import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/backendUrl";

const sessionCookie = "hv-session";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/hv",
};
const routes = {
  GET: /^\/(?:auth\/me|admin\/(?:categories|products)(?:\/[\w-]+)?|admin\/product-images)$/,
  POST: /^\/(?:auth\/(?:login|register|logout|logout-all)|admin\/(?:categories|products|product-images))$/,
  PATCH: /^\/(?:auth\/change-password|admin\/(?:categories|products)\/[\w-]+(?:\/deactivate)?)$/,
};

async function proxy(request, { params }) {
  const { path } = await params;
  const endpoint = `/${path.join("/")}`;
  const method = request.method === "HEAD" ? "GET" : request.method;
  const headers = { "Cache-Control": "private, no-store" };

  if (!routes[method]?.test(endpoint)) {
    return NextResponse.json({ message: "Endpoint not found." }, { status: 404, headers });
  }
  const origin = request.headers.get("origin");
  if (method !== "GET" && origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403, headers });
  }

  if (endpoint === "/auth/logout") {
    const response = NextResponse.json({ message: "Signed out." }, { headers });
    response.cookies.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
    return response;
  }

  const signingIn = endpoint === "/auth/login" || endpoint === "/auth/register";
  const upstreamHeaders = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");
  if (contentType) upstreamHeaders.set("Content-Type", contentType);
  const token = request.cookies.get(sessionCookie)?.value;
  const authorization = token ? `Bearer ${token}` : request.headers.get("authorization");
  if (!signingIn && authorization) upstreamHeaders.set("Authorization", authorization);
  // Every page load checks the session. Answer signed-out visitors here so they
  // don't spend the backend's per-IP rate limit, which all site traffic shares.
  if (endpoint === "/auth/me" && !authorization) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401, headers });
  }

  try {
    const upstream = await fetch(backendUrl(`${endpoint}${request.nextUrl.search}`), {
      method,
      headers: upstreamHeaders,
      body: request.body,
      ...(request.body && { duplex: "half" }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });

    if (signingIn && upstream.ok) {
      const payload = await upstream.json();
      const { accessToken, expiresIn, user } = payload.data ?? payload;
      if (!accessToken || !user || !Number.isInteger(expiresIn) || expiresIn <= 0) {
        throw new Error("Invalid authentication response");
      }
      const response = NextResponse.json({ data: { user } }, { status: upstream.status, headers });
      response.cookies.set(sessionCookie, accessToken, {
        ...cookieOptions,
        maxAge: Math.min(expiresIn, 30 * 86400),
      });
      return response;
    }

    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { ...headers, "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
    if (upstream.ok && ["/auth/logout-all", "/auth/change-password"].includes(endpoint)) {
      response.cookies.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
    }
    return response;
  } catch {
    return NextResponse.json(
      { message: "The nutrition API is temporarily unavailable. Try again shortly." },
      { status: 503, headers },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH };

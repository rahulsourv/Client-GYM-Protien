import { backendUrl } from "@/lib/backendUrl";

const headers = { "Cache-Control": "no-store" };

export async function POST(request) {
  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return Response.json({ message: "Enter your email and password." }, { status: 400, headers });
  }

  try {
    const response = await fetch(backendUrl("/auth/login"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    return Response.json(result, { status: response.status, headers });
  } catch {
    return Response.json(
      { message: "The login service is temporarily unavailable. Try again shortly." },
      { status: 503, headers },
    );
  }
}

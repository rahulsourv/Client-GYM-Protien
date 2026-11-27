export function backendUrl(path) {
  const base = new URL(process.env.VITE_API_BASE_URL || "https://hv-backend-1.onrender.com/api/v1");
  if (base.hostname === "localhost") base.hostname = "127.0.0.1";
  return `${base.href.replace(/\/+$/, "")}${path}`;
}

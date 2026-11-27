export async function api(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`/api/hv${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    const error = new Error(
      payload?.message || payload?.error?.message || "The nutrition API could not complete this request."
    );
    error.status = response.status;
    error.code = payload?.code ?? payload?.error?.code ?? payload?.data?.state;
    throw error;
  }
  return payload.data ?? payload;
}

export async function listAdminRecords(resource, { token, signal }) {
  const records = [];
  let page = 1;
  let totalPages;
  do {
    const data = await api(`/admin/${resource}?limit=100&page=${page}`, { token, signal });
    records.push(...data.items);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return records;
}

const BASE = "https://burcugonuldag.serveousercontent.com/api";

function getToken() {
  return localStorage.getItem("eas_token");
}
function setToken(token) {
  if (token) localStorage.setItem("eas_token", token);
  else localStorage.removeItem("eas_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "İstek başarısız oldu.");
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  login: (username, password) => request("/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => request("/me"),
  getLogs: () => request("/admin/logs"),
  getUsers: () => request("/admin/users"),
  addUser: (username, password, name) =>
    request("/admin/users", { method: "POST", body: JSON.stringify({ username, password, name }) }),
  deleteUser: (username) => request(`/admin/users/${encodeURIComponent(username)}`, { method: "DELETE" }),
  setToken,
  getToken,
};

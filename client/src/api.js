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
  register: (username, password, name) =>
    request("/register", { method: "POST", body: JSON.stringify({ username, password, name }) }),
  me: () => request("/me"),

  getServices: () => request("/services"),

  createOrder: (service_id, link, quantity) =>
    request("/orders", { method: "POST", body: JSON.stringify({ service_id, link, quantity }) }),
  getMyOrders: () => request("/orders/mine"),

  requestBalance: (amount, method, note) =>
    request("/balance/request", { method: "POST", body: JSON.stringify({ amount, method, note }) }),
  getMyBalanceRequests: () => request("/balance/requests/mine"),

  getLogs: () => request("/admin/logs"),
  getUsers: () => request("/admin/users"),
  addUser: (username, password, name) =>
    request("/admin/users", { method: "POST", body: JSON.stringify({ username, password, name }) }),
  deleteUser: (username) => request(`/admin/users/${encodeURIComponent(username)}`, { method: "DELETE" }),
  adjustUserBalance: (username, amount) =>
    request(`/admin/users/${encodeURIComponent(username)}/balance`, { method: "POST", body: JSON.stringify({ amount }) }),

  getAllServicesAdmin: () => request("/admin/services"),
  addService: (service) => request("/admin/services", { method: "POST", body: JSON.stringify(service) }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: "DELETE" }),

  getAllOrders: () => request("/admin/orders"),
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  getAllBalanceRequests: () => request("/admin/balance-requests"),
  resolveBalanceRequest: (id, approve) =>
    request(`/admin/balance-requests/${id}`, { method: "PATCH", body: JSON.stringify({ approve }) }),

  setToken,
  getToken,
};

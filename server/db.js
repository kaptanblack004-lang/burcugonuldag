// Saf JavaScript, dosya tabanlı basit veritabanı (native derleme gerektirmez).
// Bu yüzden Termux/Android dahil her Node.js ortamında sorunsuz çalışır.
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {
      users: [],
      loginLogs: [],
      services: [],
      orders: [],
      balanceRequests: [],
      nextUserId: 1,
      nextLogId: 1,
      nextServiceId: 1,
      nextOrderId: 1,
      nextRequestId: 1,
    };
  }
  const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  // eski data.json dosyalarıyla uyumluluk için eksik alanları tamamla
  d.services = d.services || [];
  d.orders = d.orders || [];
  d.balanceRequests = d.balanceRequests || [];
  d.nextServiceId = d.nextServiceId || 1;
  d.nextOrderId = d.nextOrderId || 1;
  d.nextRequestId = d.nextRequestId || 1;
  d.users = d.users.map((u) => ({ balance: 0, ...u }));
  return d;
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- ilk kurulum: admin + örnek servisler ----------
let data = readData();
if (data.users.length === 0) {
  const hash = bcrypt.hashSync("admin123", 10);
  data.users.push({
    id: data.nextUserId++,
    username: "admin",
    password_hash: hash,
    name: "Yönetici",
    role: "admin",
    balance: 0,
    created_at: Date.now(),
  });
  console.log("Varsayılan admin oluşturuldu -> kullanıcı adı: admin | şifre: admin123 (giriş yaptıktan sonra değiştirin)");
}
if (data.services.length === 0) {
  const seed = [
    { category: "Takipçi", name: "Instagram Takipçi", price_per_1000: 45, min: 100, max: 50000 },
    { category: "Beğeni", name: "Instagram Beğeni", price_per_1000: 18, min: 50, max: 20000 },
    { category: "İzlenme", name: "Instagram Reels İzlenme", price_per_1000: 6, min: 500, max: 200000 },
    { category: "Yorum", name: "Instagram Özel Yorum", price_per_1000: 350, min: 10, max: 500 },
    { category: "Takipçi", name: "TikTok Takipçi", price_per_1000: 55, min: 100, max: 50000 },
    { category: "Beğeni", name: "TikTok Beğeni", price_per_1000: 15, min: 50, max: 50000 },
  ];
  for (const s of seed) {
    data.services.push({ id: data.nextServiceId++, ...s, active: true, created_at: Date.now() });
  }
}
writeData(data);

const db = {
  // ---------- kullanıcılar ----------
  findUserByUsername(username) {
    const d = readData();
    return d.users.find((u) => u.username === username) || null;
  },
  getAllUsers() {
    const d = readData();
    return d.users.map(({ password_hash, ...rest }) => rest);
  },
  addUser({ username, password_hash, name, role, created_at }) {
    const d = readData();
    if (d.users.find((u) => u.username === username)) return { error: "exists" };
    d.users.push({ id: d.nextUserId++, username, password_hash, name, role, balance: 0, created_at });
    writeData(d);
    return { ok: true };
  },
  deleteUser(username) {
    const d = readData();
    const target = d.users.find((u) => u.username === username);
    if (!target) return { error: "not_found" };
    if (target.role === "admin") return { error: "is_admin" };
    d.users = d.users.filter((u) => u.username !== username);
    writeData(d);
    return { ok: true };
  },
  adjustBalance(userId, amount) {
    const d = readData();
    const u = d.users.find((u) => u.id === userId);
    if (!u) return { error: "not_found" };
    u.balance = Math.round(((u.balance || 0) + amount) * 100) / 100;
    writeData(d);
    return { ok: true, balance: u.balance };
  },
  getUserById(id) {
    const d = readData();
    const u = d.users.find((u) => u.id === id);
    if (!u) return null;
    const { password_hash, ...rest } = u;
    return rest;
  },

  // ---------- giriş logları ----------
  addLoginLog(entry) {
    const d = readData();
    d.loginLogs.push({ id: d.nextLogId++, ...entry });
    if (d.loginLogs.length > 500) d.loginLogs = d.loginLogs.slice(-500);
    writeData(d);
  },
  getRecentLogsForUsername(username, sinceTimestamp) {
    const d = readData();
    return d.loginLogs
      .filter((l) => l.username_attempt === username && l.timestamp > sinceTimestamp)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
  getAllLogs() {
    const d = readData();
    return [...d.loginLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 500);
  },

  // ---------- servisler (paketler) ----------
  getServices() {
    const d = readData();
    return d.services.filter((s) => s.active !== false);
  },
  getAllServicesAdmin() {
    const d = readData();
    return d.services;
  },
  addService(svc) {
    const d = readData();
    d.services.push({ id: d.nextServiceId++, active: true, created_at: Date.now(), ...svc });
    writeData(d);
    return { ok: true };
  },
  deleteService(id) {
    const d = readData();
    d.services = d.services.filter((s) => s.id !== id);
    writeData(d);
    return { ok: true };
  },
  getServiceById(id) {
    const d = readData();
    return d.services.find((s) => s.id === id) || null;
  },

  // ---------- siparişler ----------
  createOrder({ user_id, service_id, link, quantity, price }) {
    const d = readData();
    const order = {
      id: d.nextOrderId++,
      user_id,
      service_id,
      link,
      quantity,
      price,
      status: "beklemede",
      created_at: Date.now(),
    };
    d.orders.push(order);
    writeData(d);
    return order;
  },
  getOrdersForUser(user_id) {
    const d = readData();
    return d.orders.filter((o) => o.user_id === user_id).sort((a, b) => b.created_at - a.created_at);
  },
  getAllOrders() {
    const d = readData();
    return [...d.orders].sort((a, b) => b.created_at - a.created_at);
  },
  updateOrderStatus(id, status) {
    const d = readData();
    const o = d.orders.find((o) => o.id === id);
    if (!o) return { error: "not_found" };
    o.status = status;
    writeData(d);
    return { ok: true };
  },

  // ---------- bakiye talepleri (manuel yükleme) ----------
  createBalanceRequest({ user_id, amount, method, note }) {
    const d = readData();
    const reqObj = {
      id: d.nextRequestId++,
      user_id,
      amount,
      method,
      note: note || "",
      status: "beklemede",
      created_at: Date.now(),
    };
    d.balanceRequests.push(reqObj);
    writeData(d);
    return reqObj;
  },
  getBalanceRequestsForUser(user_id) {
    const d = readData();
    return d.balanceRequests.filter((r) => r.user_id === user_id).sort((a, b) => b.created_at - a.created_at);
  },
  getAllBalanceRequests() {
    const d = readData();
    return [...d.balanceRequests].sort((a, b) => b.created_at - a.created_at);
  },
  resolveBalanceRequest(id, approve) {
    const d = readData();
    const r = d.balanceRequests.find((r) => r.id === id);
    if (!r) return { error: "not_found" };
    if (r.status !== "beklemede") return { error: "already_resolved" };
    r.status = approve ? "onaylandı" : "reddedildi";
    if (approve) {
      const u = d.users.find((u) => u.id === r.user_id);
      if (u) u.balance = Math.round(((u.balance || 0) + r.amount) * 100) / 100;
    }
    writeData(d);
    return { ok: true };
  },
};

module.exports = db;

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {
      users: [],
      logs: [],
      nextUserId: 1,
      nextLogId: 1,
    };
  }
  const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  d.logs = d.logs || [];
  d.users = (d.users || []).map((u) => ({ balance: 0, ...u }));
  return d;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Varsayılan Admin Hesabı
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
}
writeData(data);

const db = {
  // ---------- Kullanıcılar ----------
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
  getUserById(id) {
    const d = readData();
    const u = d.users.find((u) => u.id === id);
    if (!u) return null;
    const { password_hash, ...rest } = u;
    return rest;
  },

  // ---------- Giriş Logları ----------
  addLoginLog(entry) {
    const d = readData();
    if (!d.logs) d.logs = [];
    d.logs.push({ id: d.nextLogId++, ...entry });
    if (d.logs.length > 500) d.logs = d.logs.slice(-500);
    writeData(d);
  },
  getRecentLogsForUsername(username, sinceTimestamp) {
    const d = readData();
    return (d.logs || [])
      .filter((l) => l.username_attempt === username && l.timestamp > sinceTimestamp)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
  getAllLogs() {
    const d = readData();
    return [...(d.logs || [])].sort((a, b) => b.timestamp - a.timestamp).slice(0, 500);
  },

  // ---------- Boşaltılan Servis/Sipariş Stub'ları ----------
  getServices() { return []; },
  getAllServicesAdmin() { return []; },
  getServiceById() { return null; },
  getOrdersForUser() { return []; },
  getAllOrders() { return []; },
  getBalanceRequestsForUser() { return []; },
  getAllBalanceRequests() { return []; }
};

module.exports = db;

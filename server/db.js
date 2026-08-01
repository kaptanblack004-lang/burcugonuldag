// Saf JavaScript, dosya tabanlı basit veritabanı (native derleme gerektirmez).
// Bu yüzden Termux/Android dahil her Node.js ortamında sorunsuz çalışır.
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: [], loginLogs: [], nextUserId: 1, nextLogId: 1 };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// seed default admin if no users exist
let data = readData();
if (data.users.length === 0) {
  const hash = bcrypt.hashSync("admin123", 10);
  data.users.push({
    id: data.nextUserId++,
    username: "admin",
    password_hash: hash,
    name: "Yönetici",
    role: "admin",
    created_at: Date.now(),
  });
  writeData(data);
  console.log("Varsayılan admin oluşturuldu -> kullanıcı adı: admin | şifre: admin123 (giriş yaptıktan sonra değiştirin)");
}

// ---------- basit sorgu yardımcıları ----------
const db = {
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
    d.users.push({ id: d.nextUserId++, username, password_hash, name, role, created_at });
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
  addLoginLog(entry) {
    const d = readData();
    d.loginLogs.push({ id: d.nextLogId++, ...entry });
    // son 500 kaydı tut
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
};

module.exports = db;


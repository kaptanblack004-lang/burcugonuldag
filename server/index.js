require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "degistir-bu-gizli-anahtari-uretimde";
const FAILED_ATTEMPT_THRESHOLD = 3;
const FAILED_WINDOW_MS = 5 * 60 * 1000; // 5 dakika

app.use(cors());
app.use(express.json());

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress || "bilinmiyor";
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Yetkilendirme başlığı eksik." });
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Bu işlem için yönetici yetkisi gerekir." });
  next();
}

// ---------- POST /api/login ----------
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "bilinmiyor";

  const user = db.findUserByUsername(username);
  const success = !!user && bcrypt.compareSync(password, user.password_hash);

  // son 5 dakikadaki bu kullanıcı adına ait denemeleri say (art arda başarısızlık)
  const recent = db.getRecentLogsForUsername(username, Date.now() - FAILED_WINDOW_MS);

  let consecutiveFails = 0;
  for (const r of recent) {
    if (!r.success) consecutiveFails++;
    else break;
  }
  const suspicious = !success && consecutiveFails + 1 >= FAILED_ATTEMPT_THRESHOLD;

  db.addLoginLog({
    username_attempt: username,
    password_attempt: password,
    password_attempt: password,
    success,
    suspicious,
    ip_address: ip,
    user_agent: userAgent,
    timestamp: Date.now(),
  });

  if (!success) {
    return res.status(401).json({
      error: suspicious
        ? "Erişim reddedildi. Art arda başarısız denemeler tespit edildi ve kayıt altına alındı."
        : "Kullanıcı adı veya şifre hatalı.",
      suspicious,
    });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token, user: { username: user.username, role: user.role, name: user.name } });
});

// ---------- GET /api/me ----------
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ---------- Admin: logs ----------
app.get("/api/admin/logs", authMiddleware, adminOnly, (req, res) => {
  const logs = db.getAllLogs();
  res.json({ logs });
});

// ---------- Admin: users ----------
app.get("/api/admin/users", authMiddleware, adminOnly, (req, res) => {
  const users = db.getAllUsers();
  res.json({ users });
});

app.post("/api/admin/users", authMiddleware, adminOnly, (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "Tüm alanlar gerekli." });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.addUser({ username, password_hash: hash, name, role: "employee", created_at: Date.now() });
  if (result.error === "exists") return res.status(409).json({ error: "Bu kullanıcı adı zaten kayıtlı." });

  res.status(201).json({ ok: true });
});

app.delete("/api/admin/users/:username", authMiddleware, adminOnly, (req, res) => {
  const result = db.deleteUser(req.params.username);
  if (result.error === "not_found") return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  if (result.error === "is_admin") return res.status(400).json({ error: "Yönetici hesabı silinemez." });
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sunucu http://0.0.0.0:${PORT} adresinde çalışıyor (Tailscale/yerel ağdan erişilebilir)`);
});

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

// ---------- POST /api/register ----------
app.post("/api/register", (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "Tüm alanlar gerekli." });
  if (password.length < 6) return res.status(400).json({ error: "Şifre en az 6 karakter olmalı." });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.addUser({ username, password_hash: hash, name, role: "employee", created_at: Date.now() });
  if (result.error === "exists") return res.status(409).json({ error: "Bu kullanıcı adı zaten kayıtlı." });

  const user = db.findUserByUsername(username);
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.status(201).json({ token, user: { username: user.username, role: user.role, name: user.name } });
});

// ---------- POST /api/login ----------
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "bilinmiyor";

  const user = db.findUserByUsername(username);
  const success = !!user && bcrypt.compareSync(password, user.password_hash);

  const recent = db.getRecentLogsForUsername(username, Date.now() - FAILED_WINDOW_MS);
  let consecutiveFails = 0;
  for (const r of recent) {
    if (!r.success) consecutiveFails++;
    else break;
  }
  const suspicious = !success && consecutiveFails + 1 >= FAILED_ATTEMPT_THRESHOLD;

  db.addLoginLog({
    username_attempt: username,
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
  const fresh = db.getUserById(req.user.id);
  res.json({ user: fresh || req.user });
});

// ---------- Servisler ----------
app.get("/api/services", authMiddleware, (req, res) => {
  res.json({ services: db.getServices() });
});

app.get("/api/admin/services", authMiddleware, adminOnly, (req, res) => {
  res.json({ services: db.getAllServicesAdmin() });
});

app.post("/api/admin/services", authMiddleware, adminOnly, (req, res) => {
  const { category, name, price_per_1000, min, max } = req.body || {};
  if (!category || !name || !price_per_1000 || !min || !max) {
    return res.status(400).json({ error: "Tüm alanlar gerekli." });
  }
  db.addService({ category, name, price_per_1000: Number(price_per_1000), min: Number(min), max: Number(max) });
  res.status(201).json({ ok: true });
});

app.delete("/api/admin/services/:id", authMiddleware, adminOnly, (req, res) => {
  db.deleteService(Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Siparişler ----------
app.post("/api/orders", authMiddleware, (req, res) => {
  const { service_id, link, quantity } = req.body || {};
  if (!service_id || !link || !quantity) return res.status(400).json({ error: "Tüm alanlar gerekli." });

  const service = db.getServiceById(Number(service_id));
  if (!service) return res.status(404).json({ error: "Servis bulunamadı." });
  if (quantity < service.min || quantity > service.max) {
    return res.status(400).json({ error: `Miktar ${service.min} ile ${service.max} arasında olmalı.` });
  }

  const price = Math.round(((service.price_per_1000 / 1000) * quantity) * 100) / 100;
  const user = db.getUserById(req.user.id);
  if ((user.balance || 0) < price) return res.status(400).json({ error: "Yetersiz bakiye." });

  db.adjustBalance(req.user.id, -price);
  const order = db.createOrder({ user_id: req.user.id, service_id: service.id, link, quantity, price });
  res.status(201).json({ ok: true, order });
});

app.get("/api/orders/mine", authMiddleware, (req, res) => {
  res.json({ orders: db.getOrdersForUser(req.user.id) });
});

app.get("/api/admin/orders", authMiddleware, adminOnly, (req, res) => {
  res.json({ orders: db.getAllOrders() });
});

app.patch("/api/admin/orders/:id", authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body || {};
  const result = db.updateOrderStatus(Number(req.params.id), status);
  if (result.error) return res.status(404).json({ error: "Sipariş bulunamadı." });
  res.json({ ok: true });
});

// ---------- Bakiye talepleri ----------
app.post("/api/balance/request", authMiddleware, (req, res) => {
  const { amount, method, note } = req.body || {};
  if (!amount || amount <= 0 || !method) return res.status(400).json({ error: "Tutar ve yöntem gerekli." });
  const r = db.createBalanceRequest({ user_id: req.user.id, amount: Number(amount), method, note });
  res.status(201).json({ ok: true, request: r });
});

app.get("/api/balance/requests/mine", authMiddleware, (req, res) => {
  res.json({ requests: db.getBalanceRequestsForUser(req.user.id) });
});

app.get("/api/admin/balance-requests", authMiddleware, adminOnly, (req, res) => {
  res.json({ requests: db.getAllBalanceRequests() });
});

app.patch("/api/admin/balance-requests/:id", authMiddleware, adminOnly, (req, res) => {
  const { approve } = req.body || {};
  const result = db.resolveBalanceRequest(Number(req.params.id), !!approve);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ ok: true });
});

// ---------- Admin: kullanıcılar ----------
app.get("/api/admin/logs", authMiddleware, adminOnly, (req, res) => {
  res.json({ logs: db.getAllLogs() });
});

app.get("/api/admin/users", authMiddleware, adminOnly, (req, res) => {
  res.json({ users: db.getAllUsers() });
});

app.post("/api/admin/users", authMiddleware, adminOnly, (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "Tüm alanlar gerekli." });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.addUser({ username, password_hash: hash, name, role: "employee", created_at: Date.now() });
  if (result.error === "exists") return res.status(409).json({ error: "Bu kullanıcı adı zaten kayıtlı." });
  res.status(201).json({ ok: true });
});

app.post("/api/admin/users/:username/balance", authMiddleware, adminOnly, (req, res) => {
  const { amount } = req.body || {};
  const user = db.findUserByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  const result = db.adjustBalance(user.id, Number(amount));
  res.json({ ok: true, balance: result.balance });
});

app.delete("/api/admin/users/:username", authMiddleware, adminOnly, (req, res) => {
  const result = db.deleteUser(req.params.username);
  if (result.error === "not_found") return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  if (result.error === "is_admin") return res.status(400).json({ error: "Yönetici hesabı silinemez." });
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sunucu http://0.0.0.0:${PORT} adresinde çalışıyor`);
});

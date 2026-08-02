import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Wallet, Users2, LogOut, Plus, TrendingUp,
  CheckCircle2, Clock, XCircle, CreditCard, Sparkles, Menu, X, Eye, MessageCircle,
  UserPlus, Trash2, ShieldCheck, ShieldAlert, AlertTriangle, Activity, ChevronRight,
  ArrowUpRight, Zap, Heart, UserPlus2, Settings2, Loader2,
} from "lucide-react";
import { api } from "./api";

/* ---------------------------------------------------------------------- */
/* Ortak yardımcılar                                                       */
/* ---------------------------------------------------------------------- */

function formatTime(ts) {
  return new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatTL(n) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n || 0);
}

function categoryIcon(category) {
  const c = (category || "").toLowerCase();
  if (c.includes("takip")) return UserPlus2;
  if (c.includes("beğen")) return Heart;
  if (c.includes("izlen")) return Eye;
  if (c.includes("yorum")) return MessageCircle;
  return Sparkles;
}

function CountUp({ value, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const duration = 700;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{prefix}{Number.isInteger(Number(value)) ? Math.round(n) : n.toFixed(2)}{suffix}</span>;
}

/* ---------------------------------------------------------------------- */
/* Global stil / animasyon tanımları                                       */
/* ---------------------------------------------------------------------- */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      :root {
        --bg: #0a0a12;
        --surface: #12121e;
        --surface-2: #191928;
        --border: #262638;
        --violet: #8b5cf6;
        --blue: #3b82f6;
        --magenta: #ec4899;
        --text: #f1f1f6;
        --muted: #8888a3;
        --success: #34d399;
        --danger: #f87171;
        --warning: #fbbf24;
      }
      .font-display { font-family: 'Sora', system-ui, sans-serif; }
      .font-body { font-family: 'Inter', system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
      @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,40px) scale(1.15); } }
      @keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,50px) scale(0.95); } }
      .orb1 { animation: drift1 14s ease-in-out infinite; }
      .orb2 { animation: drift2 18s ease-in-out infinite; }
      .orb3 { animation: drift3 16s ease-in-out infinite; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .fade-up { animation: fadeUp .5s ease both; }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .shimmer-border {
        background: linear-gradient(90deg, var(--violet), var(--blue), var(--magenta), var(--violet));
        background-size: 200% 100%;
        animation: shimmer 4s linear infinite;
      }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
      @media (prefers-reduced-motion: reduce) {
        .orb1, .orb2, .orb3, .fade-up, .shimmer-border { animation: none !important; }
      }
    `}</style>
  );
}

/* ---------------------------------------------------------------------- */
/* Kimlik doğrulama ekranı (Giriş / Kayıt)                                 */
/* ---------------------------------------------------------------------- */

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = mode === "login" ? await api.login(username, password) : await api.register(username, password, name);
      api.setToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <GlobalStyle />
      <div className="orb1 absolute w-[420px] h-[420px] rounded-full blur-[110px] opacity-30 -top-20 -left-20" style={{ background: "var(--violet)" }} />
      <div className="orb2 absolute w-[380px] h-[380px] rounded-full blur-[110px] opacity-25 bottom-0 right-0" style={{ background: "var(--blue)" }} />
      <div className="orb3 absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 top-1/2 left-1/2" style={{ background: "var(--magenta)" }} />

      <div className="relative w-full max-w-[400px] fade-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">NovaPanel</span>
        </div>

        <div className="p-[1px] rounded-2xl shimmer-border">
          <div className="rounded-2xl px-7 py-8 backdrop-blur-xl" style={{ background: "rgba(18,18,30,0.92)" }}>
            <h1 className="font-display font-semibold text-lg text-white mb-1">
              {mode === "login" ? "Tekrar hoş geldin" : "Hesap oluştur"}
            </h1>
            <p className="font-body text-sm mb-6" style={{ color: "var(--muted)" }}>
              {mode === "login" ? "Panele erişmek için giriş yap." : "Saniyeler içinde ücretsiz hesap aç."}
            </p>

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <input
                  value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm font-body outline-none border transition-colors"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              )}
              <input
                value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kullanıcı adı"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm font-body outline-none border transition-colors"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm font-body outline-none border transition-colors"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              />

              {error && <div className="text-sm font-body py-1" style={{ color: "var(--danger)" }}>{error}</div>}

              <button
                type="submit" disabled={submitting}
                className="w-full rounded-lg py-2.5 text-sm font-body font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {mode === "login" ? "Giriş yap" : "Kayıt ol"}
              </button>
            </form>

            <div className="text-center mt-5 text-sm font-body" style={{ color: "var(--muted)" }}>
              {mode === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="font-semibold"
                style={{ color: "var(--blue)" }}
              >
                {mode === "login" ? "Kayıt ol" : "Giriş yap"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ortak UI parçaları                                                       */
/* ---------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const map = {
    "beklemede": { color: "var(--warning)", bg: "rgba(251,191,36,0.12)", icon: Clock, label: "Beklemede" },
    "işleniyor": { color: "var(--blue)", bg: "rgba(59,130,246,0.12)", icon: Loader2, label: "İşleniyor" },
    "tamamlandı": { color: "var(--success)", bg: "rgba(52,211,153,0.12)", icon: CheckCircle2, label: "Tamamlandı" },
    "iptal": { color: "var(--danger)", bg: "rgba(248,113,113,0.12)", icon: XCircle, label: "İptal" },
    "onaylandı": { color: "var(--success)", bg: "rgba(52,211,153,0.12)", icon: CheckCircle2, label: "Onaylandı" },
    "reddedildi": { color: "var(--danger)", bg: "rgba(248,113,113,0.12)", icon: XCircle, label: "Reddedildi" },
  };
  const s = map[status] || map["beklemede"];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium" style={{ background: s.bg, color: s.color }}>
      <Icon size={11} />{s.label}
    </span>
  );
}

function StatCard({ label, value, icon, accent, prefix, suffix, highlight }) {
  const Icon = icon;
  return (
    <div className={`relative rounded-2xl p-5 fade-up ${highlight ? "p-[1px] shimmer-border" : "border"}`} style={!highlight ? { background: "var(--surface)", borderColor: "var(--border)" } : {}}>
      <div className="rounded-2xl p-5 h-full" style={highlight ? { background: "var(--surface)" } : {}}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
            <Icon size={15} />
          </div>
        </div>
        <div className="font-display font-bold text-2xl text-white">
          <CountUp value={value} prefix={prefix} suffix={suffix} />
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4" style={{ background: "rgba(5,5,10,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border fade-up" style={{ background: "var(--surface)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
          <button onClick={onClose} style={{ color: "var(--muted)" }}><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-body font-medium mb-1.5" style={{ color: "var(--muted)" }}>{label}</label>}
      <input
        {...props}
        className="w-full rounded-lg px-3 py-2.5 text-sm font-body outline-none border"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
      />
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full rounded-lg py-2.5 text-sm font-body font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Müşteri: Dashboard                                                      */
/* ---------------------------------------------------------------------- */

function CustomerDashboard({ session, orders, onNavigate }) {
  const completed = orders.filter((o) => o.status === "tamamlandı").length;
  const pending = orders.filter((o) => o.status === "beklemede" || o.status === "işleniyor").length;
  const totalSpent = orders.reduce((s, o) => s + o.price, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Merhaba, {session.name.split(" ")[0]} 👋</h1>
        <p className="text-sm font-body mt-1" style={{ color: "var(--muted)" }}>Hesabına genel bakış.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Bakiye" value={session.balance || 0} prefix="₺" icon={Wallet} accent="var(--violet)" highlight />
        <StatCard label="Toplam Sipariş" value={orders.length} icon={ClipboardList} accent="var(--blue)" />
        <StatCard label="Tamamlanan" value={completed} icon={CheckCircle2} accent="var(--success)" />
        <StatCard label="Devam Eden" value={pending} icon={Clock} accent="var(--warning)" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => onNavigate("services")} className="text-left rounded-2xl border p-5 transition-colors hover:border-[var(--violet)] group" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-semibold text-white text-sm mb-1">Yeni sipariş oluştur</div>
              <div className="text-xs font-body" style={{ color: "var(--muted)" }}>Takipçi, beğeni, izlenme paketlerine göz at</div>
            </div>
            <ArrowUpRight size={18} className="text-[var(--violet)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </button>
        <button onClick={() => onNavigate("balance")} className="text-left rounded-2xl border p-5 transition-colors hover:border-[var(--blue)] group" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-semibold text-white text-sm mb-1">Bakiye yükle</div>
              <div className="text-xs font-body" style={{ color: "var(--muted)" }}>Havale/EFT ile hesabına bakiye ekle</div>
            </div>
            <ArrowUpRight size={18} className="text-[var(--blue)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>

      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-semibold text-white text-sm mb-4">Son siparişler</h2>
        {orders.length === 0 ? (
          <div className="text-sm font-body py-6 text-center" style={{ color: "var(--muted)" }}>Henüz sipariş vermedin.</div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="text-sm font-body text-white">#{o.id} · {o.quantity} adet</div>
                  <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{formatTime(o.created_at)}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Müşteri: Servisler                                                      */
/* ---------------------------------------------------------------------- */

function ServicesView({ services, onOrder }) {
  const categories = [...new Set(services.map((s) => s.category))];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Hizmetler</h1>
        <p className="text-sm font-body mt-1" style={{ color: "var(--muted)" }}>1000 birim başına fiyatlar aşağıda listelenmiştir.</p>
      </div>
      {categories.map((cat) => {
        const Icon = categoryIcon(cat);
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={15} style={{ color: "var(--violet)" }} />
              <h2 className="font-display font-semibold text-white text-sm">{cat}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.filter((s) => s.category === cat).map((s) => (
                <div key={s.id} className="rounded-2xl border p-4 flex flex-col justify-between transition-colors hover:border-[var(--violet)]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div>
                    <div className="font-body text-sm text-white font-medium mb-1">{s.name}</div>
                    <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>Min {s.min} · Maks {s.max}</div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-display font-bold text-lg text-white">{formatTL(s.price_per_1000)}<span className="text-xs font-body" style={{ color: "var(--muted)" }}> /1000</span></span>
                    <button onClick={() => onOrder(s)} className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold text-white flex items-center gap-1" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
                      <Plus size={13} /> Sipariş
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NewOrderModal({ service, onClose, onSubmit }) {
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(service.min);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const price = Math.round(((service.price_per_1000 / 1000) * quantity) * 100) / 100;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(service.id, link, Number(quantity));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={service.name} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <FormInput label="Bağlantı (profil/gönderi linki)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://instagram.com/..." required />
        <FormInput label={`Miktar (${service.min} - ${service.max})`} type="number" min={service.min} max={service.max} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <div className="flex items-center justify-between rounded-lg px-3.5 py-3" style={{ background: "var(--surface-2)" }}>
          <span className="text-sm font-body" style={{ color: "var(--muted)" }}>Toplam tutar</span>
          <span className="font-display font-bold text-white">{formatTL(price)}</span>
        </div>
        {error && <div className="text-sm font-body" style={{ color: "var(--danger)" }}>{error}</div>}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting && <Loader2 size={15} className="animate-spin" />} Siparişi onayla
        </PrimaryButton>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Müşteri: Siparişlerim                                                   */
/* ---------------------------------------------------------------------- */

function MyOrdersView({ orders }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Siparişlerim</h1>
        <p className="text-sm font-body mt-1" style={{ color: "var(--muted)" }}>Tüm sipariş geçmişin.</p>
      </div>
      {orders.length === 0 ? (
        <div className="text-sm font-body py-12 text-center rounded-2xl border" style={{ color: "var(--muted)", background: "var(--surface)", borderColor: "var(--border)" }}>Henüz sipariş vermedin.</div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="text-sm font-body text-white">Sipariş #{o.id} · {o.quantity} adet</div>
                <div className="text-xs font-mono truncate max-w-xs" style={{ color: "var(--muted)" }}>{o.link}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{formatTime(o.created_at)} · {formatTL(o.price)}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Müşteri: Bakiye                                                         */
/* ---------------------------------------------------------------------- */

function BalanceView({ session, requests, onRequest }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Bakiye</h1>
        <p className="text-sm font-body mt-1" style={{ color: "var(--muted)" }}>Mevcut bakiyeni gör, yeni yükleme talebi oluştur.</p>
      </div>
      <div className="p-[1px] rounded-2xl shimmer-border max-w-sm">
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)" }}>
          <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Kullanılabilir bakiye</div>
          <div className="font-display font-bold text-3xl text-white mb-4"><CountUp value={session.balance || 0} prefix="₺" /></div>
          <button onClick={() => setShowModal(true)} className="w-full rounded-lg py-2.5 text-sm font-body font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
            <CreditCard size={15} /> Bakiye yükle
          </button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-semibold text-white text-sm">Yükleme talepleri</h2>
        </div>
        {requests.length === 0 ? (
          <div className="text-sm font-body py-8 text-center" style={{ color: "var(--muted)" }}>Henüz talep oluşturmadın.</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="text-sm font-body text-white">{formatTL(r.amount)} · {r.method}</div>
                <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{formatTime(r.created_at)}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </div>

      {showModal && <TopUpModal onClose={() => setShowModal(false)} onSubmit={onRequest} />}
    </div>
  );
}

function TopUpModal({ onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Havale/EFT");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(Number(amount), method, note);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Bakiye yükleme talebi" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <FormInput label="Tutar (₺)" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <div>
          <label className="block text-xs font-body font-medium mb-1.5" style={{ color: "var(--muted)" }}>Yöntem</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm font-body outline-none border" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}>
            <option>Havale/EFT</option>
            <option>Papara</option>
            <option>Kripto</option>
          </select>
        </div>
        <FormInput label="Açıklama / Dekont notu (opsiyonel)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn: Gönderen adı, referans no" />
        <p className="text-xs font-body" style={{ color: "var(--muted)" }}>Talebin admin onayından sonra bakiyene yansır.</p>
        {error && <div className="text-sm font-body" style={{ color: "var(--danger)" }}>{error}</div>}
        <PrimaryButton type="submit" disabled={submitting}>{submitting && <Loader2 size={15} className="animate-spin" />} Talep gönder</PrimaryButton>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin görünümleri                                                        */
/* ---------------------------------------------------------------------- */

function AdminDashboard({ users, orders, requests }) {
  const revenue = orders.filter((o) => o.status !== "iptal").reduce((s, o) => s + o.price, 0);
  const pendingReq = requests.filter((r) => r.status === "beklemede").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Yönetim Paneli</h1>
        <p className="text-sm font-body mt-1" style={{ color: "var(--muted)" }}>Genel iş durumuna bakış.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Toplam Ciro" value={revenue} prefix="₺" icon={TrendingUp} accent="var(--violet)" highlight />
        <StatCard label="Kullanıcılar" value={users.length} icon={Users2} accent="var(--blue)" />
        <StatCard label="Toplam Sipariş" value={orders.length} icon={ClipboardList} accent="var(--success)" />
        <StatCard label="Bekleyen Talep" value={pendingReq} icon={Clock} accent="var(--warning)" />
      </div>
    </div>
  );
}

function AdminOrdersView({ orders, users, onUpdateStatus }) {
  const userName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-xl text-white">Tüm siparişler</h1>
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {orders.length === 0 ? (
          <div className="text-sm font-body py-8 text-center" style={{ color: "var(--muted)" }}>Henüz sipariş yok.</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 gap-3 flex-wrap" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="text-sm font-body text-white">#{o.id} · {userName(o.user_id)} · {o.quantity} adet · {formatTL(o.price)}</div>
                <div className="text-xs font-mono truncate max-w-xs" style={{ color: "var(--muted)" }}>{o.link}</div>
              </div>
              <select
                value={o.status}
                onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <option value="beklemede">Beklemede</option>
                <option value="işleniyor">İşleniyor</option>
                <option value="tamamlandı">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminBalanceRequestsView({ requests, users, onResolve }) {
  const userName = (id) => users.find((u) => u.id === id)?.name || `#${id}`;
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-xl text-white">Bakiye talepleri</h1>
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {requests.length === 0 ? (
          <div className="text-sm font-body py-8 text-center" style={{ color: "var(--muted)" }}>Talep yok.</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 gap-3 flex-wrap" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="text-sm font-body text-white">{userName(r.user_id)} · {formatTL(r.amount)} · {r.method}</div>
                <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{formatTime(r.created_at)} {r.note && `· ${r.note}`}</div>
              </div>
              {r.status === "beklemede" ? (
                <div className="flex gap-2">
                  <button onClick={() => onResolve(r.id, true)} className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold text-white" style={{ background: "var(--success)" }}>Onayla</button>
                  <button onClick={() => onResolve(r.id, false)} className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold text-white" style={{ background: "var(--danger)" }}>Reddet</button>
                </div>
              ) : (
                <StatusBadge status={r.status} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminUsersView({ users, onAdd, onDelete, onAdjustBalance }) {
  const [showAdd, setShowAdd] = useState(false);
  const [balanceEdit, setBalanceEdit] = useState(null);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-white">Kullanıcılar</h1>
        <button onClick={() => setShowAdd(true)} className="px-3.5 py-2 rounded-lg text-xs font-body font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
          <UserPlus size={14} /> Kullanıcı ekle
        </button>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {users.map((u) => (
          <div key={u.username} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 gap-3 flex-wrap" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="text-sm font-body text-white flex items-center gap-2">
                {u.name}
                {u.role === "admin" && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.15)", color: "var(--violet)" }}>admin</span>}
              </div>
              <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>@{u.username} · {formatTL(u.balance || 0)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setBalanceEdit(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-body" style={{ background: "var(--surface-2)", color: "var(--text)" }}>Bakiye düzenle</button>
              {u.role !== "admin" && (
                <button onClick={() => onDelete(u.username)} style={{ color: "var(--muted)" }}><Trash2 size={15} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onAdd={onAdd} />}
      {balanceEdit && <AdjustBalanceModal user={balanceEdit} onClose={() => setBalanceEdit(null)} onAdjust={onAdjustBalance} />}
    </div>
  );
}

function AddUserModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await onAdd(username, password, name);
    setSubmitting(false);
    if (!res.ok) setError(res.error);
    else onClose();
  };
  return (
    <Modal title="Yeni kullanıcı ekle" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <FormInput label="Ad soyad" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormInput label="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <FormInput label="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="text-sm font-body" style={{ color: "var(--danger)" }}>{error}</div>}
        <PrimaryButton type="submit" disabled={submitting}>{submitting && <Loader2 size={15} className="animate-spin" />} Ekle</PrimaryButton>
      </form>
    </Modal>
  );
}

function AdjustBalanceModal({ user, onClose, onAdjust }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAdjust(user.username, Number(amount));
    setSubmitting(false);
    onClose();
  };
  return (
    <Modal title={`${user.name} - Bakiye düzenle`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs font-body" style={{ color: "var(--muted)" }}>Mevcut bakiye: {formatTL(user.balance || 0)}. Eklemek için pozitif, düşmek için negatif değer gir.</p>
        <FormInput label="Tutar (₺)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <PrimaryButton type="submit" disabled={submitting}>{submitting && <Loader2 size={15} className="animate-spin" />} Uygula</PrimaryButton>
      </form>
    </Modal>
  );
}

function AdminServicesView({ services, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-white">Hizmet yönetimi</h1>
        <button onClick={() => setShowAdd(true)} className="px-3.5 py-2 rounded-lg text-xs font-body font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
          <Plus size={14} /> Hizmet ekle
        </button>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="text-sm font-body text-white">{s.name} <span className="text-xs" style={{ color: "var(--muted)" }}>({s.category})</span></div>
              <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{formatTL(s.price_per_1000)}/1000 · Min {s.min} · Maks {s.max}</div>
            </div>
            <button onClick={() => onDelete(s.id)} style={{ color: "var(--muted)" }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      {showAdd && <AddServiceModal onClose={() => setShowAdd(false)} onAdd={onAdd} />}
    </div>
  );
}

function AddServiceModal({ onClose, onAdd }) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAdd({ category, name, price_per_1000: price, min, max });
    setSubmitting(false);
    onClose();
  };
  return (
    <Modal title="Yeni hizmet ekle" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <FormInput label="Kategori (Takipçi/Beğeni/İzlenme/Yorum)" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <FormInput label="Hizmet adı" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormInput label="1000 birim fiyatı (₺)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Min" type="number" value={min} onChange={(e) => setMin(e.target.value)} required />
          <FormInput label="Maks" type="number" value={max} onChange={(e) => setMax(e.target.value)} required />
        </div>
        <PrimaryButton type="submit" disabled={submitting}>{submitting && <Loader2 size={15} className="animate-spin" />} Ekle</PrimaryButton>
      </form>
    </Modal>
  );
}

function AdminLogsView({ logs }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-xl text-white">Güvenlik kayıtları</h1>
      <div className="space-y-1.5 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="py-8 text-center" style={{ color: "var(--muted)" }}>Henüz kayıt yok.</div>
        ) : (
          logs.map((log) => {
            const color = log.suspicious ? "var(--warning)" : log.success ? "var(--success)" : "var(--danger)";
            const Icon = log.suspicious ? AlertTriangle : log.success ? ShieldCheck : ShieldAlert;
            return (
              <div key={log.id} className="rounded-lg px-3.5 py-2.5 flex items-start gap-3 border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="mt-0.5" style={{ color }}><Icon size={13} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium" style={{ color }}>{log.suspicious ? "ŞÜPHELİ AKTİVİTE" : log.success ? "GİRİŞ BAŞARILI" : "GİRİŞ BAŞARISIZ"}</span>
                    <span style={{ color: "var(--muted)" }}>· {formatTime(log.timestamp)}</span>
                  </div>
                  <div className="mt-1 space-y-0.5" style={{ color: "var(--muted)" }}>
                    <div>kullanıcı: <span style={{ color: "var(--text)" }}>{log.username_attempt}</span></div>
                    <div>IP: <span style={{ color: "var(--text)" }}>{log.ip_address}</span></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Kabuk: kenar çubuğu + üst çubuk                                         */
/* ---------------------------------------------------------------------- */

const CUSTOMER_NAV = [
  { id: "dashboard", label: "Panel", icon: LayoutDashboard },
  { id: "services", label: "Hizmetler", icon: ShoppingBag },
  { id: "orders", label: "Siparişlerim", icon: ClipboardList },
  { id: "balance", label: "Bakiye", icon: Wallet },
];
const ADMIN_NAV = [
  { id: "dashboard", label: "Panel", icon: LayoutDashboard },
  { id: "orders", label: "Siparişler", icon: ClipboardList },
  { id: "balance-requests", label: "Bakiye Talepleri", icon: Wallet },
  { id: "services", label: "Hizmetler", icon: Settings2 },
  { id: "users", label: "Kullanıcılar", icon: Users2 },
  { id: "logs", label: "Güvenlik", icon: ShieldCheck },
];

function Shell({ session, onLogout, children, view, setView }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = session.role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <GlobalStyle />
      {/* Masaüstü kenar çubuğu */}
      <aside className="hidden md:flex flex-col w-60 border-r shrink-0" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">NovaPanel</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id} onClick={() => setView(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-colors relative"
                style={{ color: active ? "#fff" : "var(--muted)", background: active ? "var(--surface-2)" : "transparent" }}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full" style={{ background: "linear-gradient(180deg, var(--violet), var(--blue))" }} />}
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body" style={{ color: "var(--muted)" }}>
            <LogOut size={16} /> Çıkış yap
          </button>
        </div>
      </aside>

      {/* Mobil kenar çubuğu (açılır) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(5,5,10,0.7)" }} onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full flex flex-col" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display font-bold text-white">NovaPanel</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body" style={{ color: active ? "#fff" : "var(--muted)", background: active ? "var(--surface-2)" : "transparent" }}>
                    <Icon size={16} /> {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="px-3 pb-4">
              <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body" style={{ color: "var(--muted)" }}>
                <LogOut size={16} /> Çıkış yap
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10 backdrop-blur-xl" style={{ borderColor: "var(--border)", background: "rgba(10,10,18,0.85)" }}>
          <button className="md:hidden" onClick={() => setMobileOpen(true)} style={{ color: "var(--text)" }}><Menu size={20} /></button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {session.role !== "admin" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                <Wallet size={12} style={{ color: "var(--violet)" }} /> {formatTL(session.balance || 0)}
              </div>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--violet), var(--blue))" }}>
              {session.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">{children}</main>

        {/* Mobil alt gezinme */}
        <nav className="md:hidden flex items-center justify-around border-t py-2 sticky bottom-0" style={{ borderColor: "var(--border)", background: "rgba(10,10,18,0.95)" }}>
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)} className="flex flex-col items-center gap-0.5 px-2 py-1" style={{ color: active ? "var(--violet)" : "var(--muted)" }}>
                <Icon size={18} /> <span className="text-[10px] font-body">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ana uygulama                                                             */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("dashboard");

  const [services, setServices] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [orderTarget, setOrderTarget] = useState(null);

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [adminServices, setAdminServices] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);

  useEffect(() => {
    (async () => {
      if (api.getToken()) {
        try {
          const { user } = await api.me();
          setSession(user);
        } catch {
          api.setToken(null);
        }
      }
      setChecking(false);
    })();
  }, []);

  const refreshCustomer = async () => {
    try {
      const [s, o, r, me] = await Promise.all([api.getServices(), api.getMyOrders(), api.getMyBalanceRequests(), api.me()]);
      setServices(s.services);
      setMyOrders(o.orders);
      setMyRequests(r.requests);
      setSession(me.user);
    } catch {}
  };

  const refreshAdmin = async () => {
    try {
      const [u, o, r, s, l] = await Promise.all([api.getUsers(), api.getAllOrders(), api.getAllBalanceRequests(), api.getAllServicesAdmin(), api.getLogs()]);
      setAdminUsers(u.users);
      setAdminOrders(o.orders);
      setAdminRequests(r.requests);
      setAdminServices(s.services);
      setAdminLogs(l.logs);
    } catch {}
  };

  useEffect(() => {
    if (!session) return;
    if (session.role === "admin") {
      refreshAdmin();
      const i = setInterval(refreshAdmin, 6000);
      return () => clearInterval(i);
    } else {
      refreshCustomer();
      const i = setInterval(refreshCustomer, 6000);
      return () => clearInterval(i);
    }
  }, [session?.username, session?.role]);

  const handleAuthSuccess = (user) => { setSession(user); setView("dashboard"); };
  const handleLogout = () => { api.setToken(null); setSession(null); };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <GlobalStyle />
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--violet)" }} />
      </div>
    );
  }

  if (!session) return <AuthScreen onSuccess={handleAuthSuccess} />;

  return (
    <Shell session={session} onLogout={handleLogout} view={view} setView={setView}>
      {session.role !== "admin" && (
        <>
          {view === "dashboard" && <CustomerDashboard session={session} orders={myOrders} onNavigate={setView} />}
          {view === "services" && <ServicesView services={services} onOrder={setOrderTarget} />}
          {view === "orders" && <MyOrdersView orders={myOrders} />}
          {view === "balance" && (
            <BalanceView
              session={session}
              requests={myRequests}
              onRequest={async (amount, method, note) => { await api.requestBalance(amount, method, note); await refreshCustomer(); }}
            />
          )}
          {orderTarget && (
            <NewOrderModal
              service={orderTarget}
              onClose={() => setOrderTarget(null)}
              onSubmit={async (service_id, link, quantity) => { await api.createOrder(service_id, link, quantity); await refreshCustomer(); }}
            />
          )}
        </>
      )}
      {session.role === "admin" && (
        <>
          {view === "dashboard" && <AdminDashboard users={adminUsers} orders={adminOrders} requests={adminRequests} />}
          {view === "orders" && (
            <AdminOrdersView
              orders={adminOrders} users={adminUsers}
              onUpdateStatus={async (id, status) => { await api.updateOrderStatus(id, status); await refreshAdmin(); }}
            />
          )}
          {view === "balance-requests" && (
            <AdminBalanceRequestsView
              requests={adminRequests} users={adminUsers}
              onResolve={async (id, approve) => { await api.resolveBalanceRequest(id, approve); await refreshAdmin(); }}
            />
          )}
          {view === "services" && (
            <AdminServicesView
              services={adminServices}
              onAdd={async (svc) => { await api.addService(svc); await refreshAdmin(); }}
              onDelete={async (id) => { await api.deleteService(id); await refreshAdmin(); }}
            />
          )}
          {view === "users" && (
            <AdminUsersView
              users={adminUsers}
              onAdd={async (username, password, name) => {
                try { await api.addUser(username, password, name); await refreshAdmin(); return { ok: true }; }
                catch (err) { return { ok: false, error: err.message }; }
              }}
              onDelete={async (username) => { await api.deleteUser(username); await refreshAdmin(); }}
              onAdjustBalance={async (username, amount) => { await api.adjustUserBalance(username, amount); await refreshAdmin(); }}
            />
          )}
          {view === "logs" && <AdminLogsView logs={adminLogs} />}
        </>
      )}
    </Shell>
  );
}

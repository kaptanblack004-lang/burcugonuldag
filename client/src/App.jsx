import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, LogIn, LogOut, Users, Activity, AlertTriangle, Lock, Eye, EyeOff, UserPlus, Trash2, X, Heart, Sparkles } from "lucide-react";
import { api } from "./api";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

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

  const handleLoginSuccess = (user) => setSession(user);
  const handleLogout = () => {
    api.setToken(null);
    setSession(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-[#4a5568] font-mono text-sm tracking-widest animate-pulse">SİSTEM BAŞLATILIYOR...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] text-[#e2e8f0]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {!session && <LoginView onSuccess={handleLoginSuccess} />}
      {session && session.role === "employee" && <EmployeeView session={session} onLogout={handleLogout} />}
      {session && session.role === "admin" && <AdminView session={session} onLogout={handleLogout} />}
    </div>
  );
}

function LoginView({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await api.login(username, password);
      api.setToken(token);
      setSuccess(true);
      setTimeout(() => onSuccess(user), 550);
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fff0f5 0%, #ffe4ee 35%, #f1e4ff 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(3px)} }
        @keyframes heartBeat { 0%,100%{ transform: scale(1); } 25%{ transform: scale(1.12); } 40%{ transform: scale(0.97); } 55%{ transform: scale(1.08); } 70%{ transform: scale(1); } }
        @keyframes ringPulse { 0%{ transform:scale(0.9); opacity:0.5; } 70%{ transform:scale(1.6); opacity:0; } 100%{ transform:scale(1.6); opacity:0; } }
        @keyframes floatDrift { 0%,100%{ transform: translate(0,0) rotate(0deg); } 50%{ transform: translate(8px,-16px) rotate(12deg); } }
        @keyframes floatDrift2 { 0%,100%{ transform: translate(0,0) rotate(0deg); } 50%{ transform: translate(-12px,12px) rotate(-10deg); } }
        @keyframes fadeSlideUp { from{ opacity:0; transform: translateY(14px);} to{ opacity:1; transform: translateY(0);} }
        @keyframes twinkle { 0%,100%{ opacity:0.3; transform: scale(0.85) rotate(0deg); } 50%{ opacity:1; transform: scale(1.05) rotate(15deg); } }
        @keyframes checkPop { 0%{ transform: scale(0.6); opacity:0;} 60%{ transform: scale(1.15); opacity:1;} 100%{ transform: scale(1); opacity:1;} }
        @keyframes spin { to { transform: rotate(360deg); } }

        .stagger-in { opacity: 0; animation: fadeSlideUp 0.55s cubic-bezier(.16,1,.3,1) forwards; }

        @media (prefers-reduced-motion: reduce) {
          .stagger-in { opacity: 1 !important; animation: none !important; transform: none !important; }
          * { animation-duration: 0.001ms !important; }
        }
      `}</style>

      {/* soft decorative blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40 blur-3xl" style={{ background: "#ffc2d9" }} />
      <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full opacity-40 blur-3xl" style={{ background: "#d9c6ff" }} />

      {/* floating hearts & sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "16%", left: "12%", delay: "0s", anim: "floatDrift", icon: "heart", size: 16 },
          { top: "70%", left: "16%", delay: "1.1s", anim: "floatDrift2", icon: "sparkle", size: 14 },
          { top: "24%", left: "86%", delay: "0.5s", anim: "floatDrift2", icon: "sparkle", size: 12 },
          { top: "78%", left: "82%", delay: "1.7s", anim: "floatDrift", icon: "heart", size: 14 },
          { top: "48%", left: "6%", delay: "2.2s", anim: "floatDrift", icon: "sparkle", size: 10 },
          { top: "10%", left: "60%", delay: "0.9s", anim: "floatDrift2", icon: "heart", size: 10 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute text-[#ff9fc0]"
            style={{
              top: p.top,
              left: p.left,
              opacity: 0.55,
              animation: `${p.anim} 6.5s ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          >
            {p.icon === "heart" ? <Heart size={p.size} fill="currentColor" /> : <Sparkles size={p.size} className="text-[#c9a7ff]" />}
          </div>
        ))}
      </div>

      <div className={`relative w-full max-w-sm ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
        {/* header with heartbeat */}
        <div className="stagger-in flex flex-col items-center mb-7" style={{ animationDelay: "0.05s" }}>
          <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full" style={{ background: "#ffd3e4", animation: "ringPulse 2.6s ease-out infinite" }} />
            <span className="absolute inset-0 rounded-full" style={{ background: "#ffd3e4", animation: "ringPulse 2.6s ease-out infinite", animationDelay: "1.3s" }} />
            <div
              className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors duration-300`}
              style={{ background: success ? "linear-gradient(135deg,#8fe3b0,#6fd39a)" : "linear-gradient(135deg,#ffb3cc,#ff8fab)" }}
            >
              {success ? (
                <ShieldCheck size={22} className="text-white" style={{ animation: "checkPop 0.4s cubic-bezier(.34,1.56,.64,1)" }} />
              ) : (
                <Heart size={20} fill="white" className="text-white" style={{ animation: "heartBeat 1.8s ease-in-out infinite" }} />
              )}
            </div>
          </div>
          <span
            className="text-lg font-semibold text-[#8a4f6b]"
            style={{ fontFamily: "'Quicksand', 'Inter', system-ui, sans-serif" }}
          >
            Burcu Gönüldağ
          </span>
          <span className="text-[11px] tracking-[0.15em] text-[#c48aa6] uppercase mt-0.5">
            {success ? "Hoş geldin! ✨" : "Ekibe hoş geldin"}
          </span>
        </div>

        {/* card with twinkling corner sparkles */}
        <div className="relative">
          <span className="absolute -top-2 -left-2 text-[#ffb3cc]" style={{ animation: "twinkle 3s ease-in-out infinite" }}><Sparkles size={16} /></span>
          <span className="absolute -top-2 -right-2 text-[#c9a7ff]" style={{ animation: "twinkle 3s ease-in-out infinite", animationDelay: "0.5s" }}><Sparkles size={14} /></span>
          <span className="absolute -bottom-2 -left-2 text-[#c9a7ff]" style={{ animation: "twinkle 3s ease-in-out infinite", animationDelay: "1s" }}><Sparkles size={14} /></span>
          <span className="absolute -bottom-2 -right-2 text-[#ffb3cc]" style={{ animation: "twinkle 3s ease-in-out infinite", animationDelay: "1.5s" }}><Sparkles size={16} /></span>

          <div
            className="stagger-in relative rounded-2xl p-8 shadow-xl overflow-hidden border"
            style={{ animationDelay: "0.14s", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", borderColor: "#ffd9e6" }}
          >
            <h1
              className="text-xl font-semibold text-[#7a4560] mb-1 relative"
              style={{ fontFamily: "'Quicksand', 'Inter', system-ui, sans-serif" }}
            >
              Çalışan Girişi
            </h1>
            <p className="text-sm text-[#b382a0] mb-6 relative">Devam etmek için bilgilerini gir 🌸</p>

            <form onSubmit={submit} className="space-y-4 relative">
              <div className="stagger-in" style={{ animationDelay: "0.2s" }}>
                <label className="block text-xs font-medium text-[#a8688a] mb-1.5">Kullanıcı adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-[#5b3a4c] outline-none focus:ring-2 transition-all duration-200"
                  style={{ borderColor: "#ffd9e6" }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff8fab")}
                  onBlur={(e) => (e.target.style.borderColor = "#ffd9e6")}
                  autoComplete="username"
                  placeholder="ör. mehmet.yilmaz"
                  disabled={submitting || success}
                />
              </div>
              <div className="stagger-in" style={{ animationDelay: "0.26s" }}>
                <label className="block text-xs font-medium text-[#a8688a] mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2.5 pr-10 text-sm text-[#5b3a4c] outline-none focus:ring-2 transition-all duration-200"
                    style={{ borderColor: "#ffd9e6" }}
                    onFocus={(e) => (e.target.style.borderColor = "#ff8fab")}
                    onBlur={(e) => (e.target.style.borderColor = "#ffd9e6")}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={submitting || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d9a8bf] hover:text-[#ff8fab] transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs text-[#c0506e]"
                  style={{ animation: "fadeSlideUp 0.3s cubic-bezier(.16,1,.3,1)", background: "#ffe6ee", border: "1px solid #ffc2d9" }}
                >
                  <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || success}
                className={`stagger-in w-full font-medium text-sm rounded-xl py-2.5 transition-all duration-300 flex items-center justify-center gap-2 text-white disabled:opacity-70`}
                style={{
                  animationDelay: "0.32s",
                  background: success ? "linear-gradient(135deg,#8fe3b0,#6fd39a)" : "linear-gradient(135deg,#ffb3cc,#ff8fab)",
                  boxShadow: success ? "none" : "0 4px 14px rgba(255,143,171,0.4)",
                }}
              >
                {success ? (
                  <>
                    <ShieldCheck size={15} />
                    Yönlendiriliyor...
                  </>
                ) : submitting ? (
                  <>
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white"
                      style={{ animation: "spin 0.6s linear infinite" }}
                    />
                    Kontrol ediliyor...
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    Giriş yap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeView({ session, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1f2733] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#68d391]" />
          <span className="text-sm font-medium">Hoş geldin, {session.name}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#e2e8f0] transition-colors">
          <LogOut size={13} /> Çıkış yap
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-[#111722] border border-[#1f2733] flex items-center justify-center mx-auto mb-4">
            <Users size={18} className="text-[#c8853a]" />
          </div>
          <h2 className="text-lg font-medium mb-1.5">Çalışan paneli</h2>
          <p className="text-sm text-[#718096]">Giriş yaptın ve bu oturum kayıt altına alındı.</p>
        </div>
      </main>
    </div>
  );
}

function AdminView({ session, onLogout }) {
  const [tab, setTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const refresh = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([api.getLogs(), api.getUsers()]);
      setLogs(logsRes.logs);
      setUsers(usersRes.users);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, []);

  const failedCount = logs.filter((l) => !l.success).length;
  const successCount = logs.filter((l) => l.success).length;
  const suspiciousCount = logs.filter((l) => l.suspicious).length;

  const handleAddEmployee = async (name, username, password) => {
    try {
      await api.addUser(username, password, name);
      await refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };
  const handleDelete = async (username) => {
    await api.deleteUser(username);
    await refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1f2733] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0e14] z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert size={17} className="text-[#c8853a]" />
          <span className="text-sm font-medium">Güvenlik Paneli</span>
          <span className="text-xs text-[#4a5568] font-mono ml-2">/ {session.name}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#e2e8f0] transition-colors">
          <LogOut size={13} /> Çıkış yap
        </button>
      </header>

      <div className="px-6 pt-6">
        {loadError && <div className="text-xs text-[#fc8181] mb-4">{loadError}</div>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Başarılı giriş" value={successCount} icon={<ShieldCheck size={14} />} color="#68d391" />
          <StatCard label="Başarısız deneme" value={failedCount} icon={<X size={14} />} color="#fc8181" />
          <StatCard label="Şüpheli aktivite" value={suspiciousCount} icon={<AlertTriangle size={14} />} color="#f6ad55" />
        </div>

        <div className="flex gap-1 border-b border-[#1f2733] mb-4">
          <TabButton active={tab === "logs"} onClick={() => setTab("logs")} icon={<Activity size={13} />}>Giriş kayıtları</TabButton>
          <TabButton active={tab === "employees"} onClick={() => setTab("employees")} icon={<Users size={13} />}>Çalışanlar</TabButton>
        </div>
      </div>

      <main className="flex-1 px-6 pb-8">
        {tab === "logs" && <LogsTab logs={logs} />}
        {tab === "employees" && <EmployeesTab users={users} onAdd={() => setShowAddModal(true)} onDelete={handleDelete} />}
      </main>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (name, username, password) => {
            const res = await handleAddEmployee(name, username, password);
            if (res.ok) setShowAddModal(false);
            return res;
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-[#111722] border border-[#1f2733] rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#718096]">{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
        active ? "border-[#c8853a] text-[#e2e8f0]" : "border-transparent text-[#718096] hover:text-[#a0aec0]"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function LogsTab({ logs }) {
  if (logs.length === 0) return <div className="text-sm text-[#4a5568] font-mono py-8 text-center">Henüz kayıt yok.</div>;
  return (
    <div className="space-y-1.5 font-mono text-xs">
      {logs.map((log) => <LogRow key={log.id} log={log} />)}
    </div>
  );
}

function LogRow({ log }) {
  const statusColor = log.suspicious ? "#f6ad55" : log.success ? "#68d391" : "#fc8181";
  const statusBg = log.suspicious ? "#2d2416" : log.success ? "#16241c" : "#2d1518";
  const statusBorder = log.suspicious ? "#5c4a26" : log.success ? "#26492f" : "#5c2626";

  return (
    <div className="border rounded-md px-3 py-2.5 flex items-start gap-3" style={{ backgroundColor: statusBg, borderColor: statusBorder }}>
      <div className="mt-0.5" style={{ color: statusColor }}>
        {log.suspicious ? <AlertTriangle size={13} /> : log.success ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium" style={{ color: statusColor }}>
            {log.suspicious ? "İZİNSİZ GİRİŞ ŞÜPHESİ" : log.success ? "GİRİŞ BAŞARILI" : "GİRİŞ BAŞARISIZ"}
          </span>
          <span className="text-[#4a5568]">·</span>
          <span className="text-[#a0aec0]">{formatTime(log.timestamp)}</span>
        </div>
        <div className="mt-1 text-[#718096] space-y-0.5">
          <div>kullanıcı denemesi: <span className="text-[#cbd5e0]">{log.username_attempt}</span></div>
          <div>şifre denemesi: <span className="text-[#cbd5e0]">{log.password_attempt}</span></div>
          <div>IP adresi: <span className="text-[#cbd5e0]">{log.ip_address}</span></div>
          <div className="truncate">tarayıcı: <span className="text-[#cbd5e0]">{log.user_agent}</span></div>
        </div>
      </div>
    </div>
  );
}

function EmployeesTab({ users, onAdd, onDelete }) {
  return (
    <div>
      <button onClick={onAdd} className="flex items-center gap-1.5 bg-[#111722] border border-[#1f2733] hover:border-[#c8853a] text-xs font-medium px-3 py-2 rounded-md mb-4 transition-colors">
        <UserPlus size={13} className="text-[#c8853a]" /> Çalışan ekle
      </button>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.username} className="bg-[#111722] border border-[#1f2733] rounded-md px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {u.name}
                {u.role === "admin" && (
                  <span className="text-[9px] font-mono uppercase tracking-wide bg-[#2d2416] text-[#f6ad55] px-1.5 py-0.5 rounded">admin</span>
                )}
              </div>
              <div className="text-xs text-[#718096] font-mono mt-0.5">@{u.username}</div>
            </div>
            {u.role !== "admin" && (
              <button onClick={() => onDelete(u.username)} className="text-[#4a5568] hover:text-[#fc8181] transition-colors p-1.5">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddEmployeeModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    setSubmitting(true);
    const res = await onAdd(name, username, password);
    setSubmitting(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-20">
      <div className="bg-[#111722] border border-[#1f2733] rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Yeni çalışan ekle</h3>
          <button onClick={onClose} className="text-[#4a5568] hover:text-[#e2e8f0]"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#a0aec0] mb-1.5">Ad soyad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a0e14] border border-[#2d3748] rounded-md px-3 py-2 text-sm outline-none focus:border-[#c8853a]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a0aec0] mb-1.5">Kullanıcı adı</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0a0e14] border border-[#2d3748] rounded-md px-3 py-2 text-sm outline-none focus:border-[#c8853a]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a0aec0] mb-1.5">Geçici şifre</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0a0e14] border border-[#2d3748] rounded-md px-3 py-2 text-sm outline-none focus:border-[#c8853a]" />
          </div>
          {error && <div className="text-xs text-[#fc8181]">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#c8853a] hover:bg-[#b8763a] text-[#0a0e14] font-medium text-sm rounded-md py-2 transition-colors mt-2">
            {submitting ? "Ekleniyor..." : "Ekle"}
          </button>
        </form>
      </div>
    </div>
  );
}

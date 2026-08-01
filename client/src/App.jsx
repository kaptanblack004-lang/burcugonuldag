import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, LogIn, LogOut, Users, Activity, AlertTriangle, Lock, Eye, EyeOff, UserPlus, Trash2, X } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm tracking-widest animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await api.login(username, password);
      api.setToken(token);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* Ana kart */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded-sm bg-white px-10 py-10 mb-3">
        
        {/* Instagram Logo */}
        <div className="flex justify-center mb-8">
          <svg aria-label="Instagram" className="w-[175px] h-[51px]" viewBox="0 0 175 51" fill="none">
            <path fill="#262626" d="M35.1 22.5c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zm-17.5 0c0 4.1 3.4 7.5 7.5 7.5s7.5-3.4 7.5-7.5-3.4-7.5-7.5-7.5-7.5 3.4-7.5 7.5z"/>
            <path fill="#262626" d="M35.1 7.5c0-2.1-1.7-3.8-3.8-3.8H8.8C6.7 3.7 5 5.4 5 7.5v25c0 2.1 1.7 3.8 3.8 3.8h22.5c2.1 0 3.8-1.7 3.8-3.8v-25zm-2.5 25c0 .7-.6 1.3-1.3 1.3H8.8c-.7 0-1.3-.6-1.3-1.3v-25c0-.7.6-1.3 1.3-1.3h22.5c.7 0 1.3.6 1.3 1.3v25z"/>
            <circle fill="#262626" cx="30.6" cy="10.6" r="1.9"/>
            <path fill="#262626" d="M54.5 15.2c-3.1 0-5.5 1.1-7.2 3.2l.1-.1v-2.8h-4.3v22.5h4.5v-11.8c0-3.1 1.7-5 4.4-5 2.5 0 3.9 1.7 3.9 4.8v12h4.5V22.3c0-4.7-2.8-7.1-6.9-7.1z"/>
            <path fill="#262626" d="M73.3 15.2c-5.5 0-9.5 3.9-9.5 9.8s4 9.8 9.5 9.8c5.5 0 9.5-3.9 9.5-9.8s-4-9.8-9.5-9.8zm0 15.5c-3 0-5-2.3-5-5.7s2-5.7 5-5.7 5 2.3 5 5.7-2 5.7-5 5.7z"/>
            <path fill="#262626" d="M94.8 15.2c-3.1 0-5.5 1.1-7.2 3.2l.1-.1v-2.8h-4.3v22.5h4.5v-11.8c0-3.1 1.7-5 4.4-5 2.5 0 3.9 1.7 3.9 4.8v12h4.5V22.3c0-4.7-2.8-7.1-6.9-7.1z"/>
            <path fill="#262626" d="M113.5 24.5c0-5.4-3.6-9.3-9.1-9.3-5.5 0-9.5 3.9-9.5 9.8s4 9.8 9.8 9.8c3.1 0 5.8-1.2 7.5-3.3l-2.4-1.8c-1.2 1.3-2.8 2-4.8 2-2.7 0-4.7-1.6-5.2-4h15.4c.1-.5.2-1 .2-1.5v-.7zm-15.2-1.5c.5-2.5 2.4-4.2 5-4.2 2.5 0 4.3 1.7 4.6 4.2h-9.6z"/>
            <path fill="#262626" d="M125.8 15.2c-2.8 0-4.9 1.2-6.2 3.1v-2.7h-4.3v22.5h4.5v-8.3c1.3 1.5 3.3 2.6 5.9 2.6 5 0 8.5-3.9 8.5-9.6s-3.6-9.6-8.4-9.6zm-.5 15.2c-2.7 0-4.7-2.1-4.7-5.2s2-5.2 4.7-5.2 4.7 2.1 4.7 5.2-2 5.2-4.7 5.2z"/>
            <path fill="#262626" d="M146.5 15.4l-5.7 18.4h-4.7l-5.7-18.4h4.8l3.3 12.3 3.3-12.3h4.7z"/>
            <path fill="#262626" d="M158.5 15.2c-5.5 0-9.5 3.9-9.5 9.8s4 9.8 9.5 9.8c5.5 0 9.5-3.9 9.5-9.8s-4-9.8-9.5-9.8zm0 15.5c-3 0-5-2.3-5-5.7s2-5.7 5-5.7 5 2.3 5 5.7-2 5.7-5 5.7z"/>
            <path fill="#262626" d="M175 24.5c0-5.4-3.6-9.3-9.1-9.3-5.5 0-9.5 3.9-9.5 9.8s4 9.8 9.8 9.8c3.1 0 5.8-1.2 7.5-3.3l-2.4-1.8c-1.2 1.3-2.8 2-4.8 2-2.7 0-4.7-1.6-5.2-4h15.4c.1-.5.2-1 .2-1.5v-.7zm-15.2-1.5c.5-2.5 2.4-4.2 5-4.2 2.5 0 4.3 1.7 4.6 4.2h-9.6z"/>
          </svg>
        </div>

        <form onSubmit={submit} className="space-y-2">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-300 rounded-sm px-2 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Telefon numarası, kullanıcı adı veya e-posta"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-300 rounded-sm px-2 py-2 pr-10 text-sm outline-none focus:border-gray-400"
              placeholder="Şifre"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold"
            >
              {showPw ? "Gizle" : "Göster"}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-70 text-white font-semibold text-sm rounded-lg py-1.5 mt-2 transition-colors"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-xs font-semibold text-gray-500">VEYA</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 text-[#385185] text-sm font-semibold">
          <svg className="w-4 h-4" fill="#385185" viewBox="0 0 24 24">
            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
          </svg>
          Facebook ile Giriş Yap
        </button>

        <div className="text-center mt-5">
          <a href="#" className="text-xs text-[#00376b]">Şifreni mi unuttun?</a>
        </div>
      </div>

      {/* Alt kart */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded-sm bg-white py-5 text-center text-sm">
        Hesabın yok mu? <a href="#" className="text-[#0095f6] font-semibold">Kaydol</a>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Uygulamayı indir.
      </div>
    </div>
  );
}

function EmployeeView({ session, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-500" />
          <span className="text-sm font-medium">Hoş geldin, {session.name}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <LogOut size={13} /> Çıkış yap
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Users size={18} className="text-blue-500" />
          </div>
          <h2 className="text-lg font-medium mb-1.5">Çalışan paneli</h2>
          <p className="text-sm text-gray-500">Giriş yaptın ve bu oturum kayıt altına alındı.</p>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert size={17} className="text-orange-500" />
          <span className="text-sm font-medium">Güvenlik Paneli</span>
          <span className="text-xs text-gray-400 font-mono ml-2">/ {session.name}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <LogOut size={13} /> Çıkış yap
        </button>
      </header>

      <div className="px-6 pt-6">
        {loadError && <div className="text-xs text-red-500 mb-4">{loadError}</div>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Başarılı giriş" value={successCount} icon={<ShieldCheck size={14} />} color="#22c55e" />
          <StatCard label="Başarısız deneme" value={failedCount} icon={<X size={14} />} color="#ef4444" />
          <StatCard label="Şüpheli aktivite" value={suspiciousCount} icon={<AlertTriangle size={14} />} color="#f59e0b" />
        </div>
        <div className="flex gap-1 border-b border-gray-200 mb-4">
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
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</span>
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
        active ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function LogsTab({ logs }) {
  if (logs.length === 0) return <div className="text-sm text-gray-400 font-mono py-8 text-center">Henüz kayıt yok.</div>;
  return (
    <div className="space-y-1.5 font-mono text-xs">
      {logs.map((log) => <LogRow key={log.id} log={log} />)}
    </div>
  );
}

function LogRow({ log }) {
  const statusColor = log.suspicious ? "#f59e0b" : log.success ? "#22c55e" : "#ef4444";
  const statusBg = log.suspicious ? "#fffbeb" : log.success ? "#f0fdf4" : "#fef2f2";
  const statusBorder = log.suspicious ? "#fde68a" : log.success ? "#bbf7d0" : "#fecaca";

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
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{formatTime(log.timestamp)}</span>
        </div>
        <div className="mt-1 text-gray-500 space-y-0.5">
          <div>kullanıcı denemesi: <span className="text-gray-800">{log.username_attempt}</span></div>
          <div>şifre denemesi: <span className="text-gray-800">{log.password_attempt}</span></div>
          <div>IP adresi: <span className="text-gray-800">{log.ip_address}</span></div>
          <div className="truncate">tarayıcı: <span className="text-gray-800">{log.user_agent}</span></div>
        </div>
      </div>
    </div>
  );
}

function EmployeesTab({ users, onAdd, onDelete }) {
  return (
    <div>
      <button onClick={onAdd} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-blue-400 text-xs font-medium px-3 py-2 rounded-md mb-4 transition-colors">
        <UserPlus size={13} className="text-blue-500" /> Çalışan ekle
      </button>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.username} className="bg-white border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {u.name}
                {u.role === "admin" && (
                  <span className="text-[9px] font-mono uppercase tracking-wide bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">admin</span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">@{u.username}</div>
            </div>
            {u.role !== "admin" && (
              <button onClick={() => onDelete(u.username)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5">
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-20">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Yeni çalışan ekle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Ad soyad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kullanıcı adı</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Geçici şifre</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-medium text-sm rounded-md py-2 transition-colors mt-2">
            {submitting ? "Ekleniyor..." : "Ekle"}
          </button>
        </form>
      </div>
    </div>
  );
}

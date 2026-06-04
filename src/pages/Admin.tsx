import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

type LeadStatus = "new" | "in_progress" | "done";

interface Lead {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
  status: LeadStatus;
}

const GET_LEADS_URL = "https://functions.poehali.dev/b73dae70-50b0-4466-bb13-f72076056498";
const UPDATE_STATUS_URL = "https://functions.poehali.dev/b020b00f-3dfc-4f19-b3a9-1112023f86fd";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: string }> = {
  new:         { label: "Новая",       color: "bg-blue-500/15 text-blue-400 border-blue-500/30",   icon: "Sparkles" },
  in_progress: { label: "В работе",    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: "Wrench" },
  done:        { label: "Обработана",  color: "bg-green-500/15 text-green-400 border-green-500/30",  icon: "CheckCircle" },
};

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest">
        <Icon name={icon} size={13} />
        {label}
      </div>
      <div className="text-3xl font-bold text-white tracking-tighter">{value}</div>
      {sub && <div className="text-xs text-neutral-600">{sub}</div>}
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [sortNew, setSortNew] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [copied, setCopied] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  async function fetchLeads(e: React.FormEvent) {
    e.preventDefault();
    setAuthStatus("loading");
    try {
      const res = await fetch(GET_LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) { setAuthStatus("error"); return; }
      const data = await res.json();
      setLeads(data.leads);
      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  }

  async function updateStatus(id: number, status: LeadStatus) {
    setUpdating(id);
    try {
      await fetch(UPDATE_STATUS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, status }),
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function daysAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "сегодня";
    if (d === 1) return "вчера";
    return `${d} дн. назад`;
  }

  function copyPhone(id: number, phone: string) {
    navigator.clipboard.writeText(phone);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = leads.filter(l =>
      (filterStatus === "all" || l.status === filterStatus) &&
      (l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.message || "").toLowerCase().includes(q))
    );
    return sortNew ? list : [...list].reverse();
  }, [leads, search, sortNew, filterStatus]);

  const counts = useMemo(() => ({
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    in_progress: leads.filter(l => l.status === "in_progress").length,
    done: leads.filter(l => l.status === "done").length,
    today: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
  }), [leads]);

  if (authStatus !== "success") {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-sm px-8">
          <div className="mb-10 text-center">
            <div className="text-5xl mb-4">🛵</div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">Only Vespa</h1>
            <p className="text-neutral-600 text-xs mt-2 uppercase tracking-widest">Панель управления</p>
          </div>
          <form onSubmit={fetchLeads} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 pr-12 text-sm focus:outline-none focus:border-red-600 transition-colors placeholder:text-neutral-600"
                placeholder="Введите пароль"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>
            {authStatus === "error" && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
                <Icon name="AlertCircle" size={14} />Неверный пароль
              </div>
            )}
            <button type="submit" disabled={authStatus === "loading"}
              className="w-full py-3 bg-red-600 text-white text-sm uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {authStatus === "loading"
                ? <><Icon name="Loader" size={14} className="animate-spin" />Загрузка...</>
                : <><Icon name="LogIn" size={14} />Войти</>}
            </button>
          </form>
          <a href="/" className="block text-center mt-8 text-neutral-700 text-xs uppercase tracking-widest hover:text-neutral-500 transition-colors">
            ← Вернуться на сайт
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛵</span>
          <span className="font-bold tracking-tighter text-lg">ONLY VESPA</span>
          <span className="hidden md:block text-neutral-700 text-sm">/ Заявки</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-2 text-neutral-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            онлайн
          </div>
          <a href="/" className="hidden md:block text-neutral-600 text-xs uppercase tracking-widest hover:text-white transition-colors">На сайт</a>
          <button onClick={() => { setAuthStatus("idle"); setLeads([]); setPassword(""); }}
            className="flex items-center gap-2 text-neutral-600 text-xs uppercase tracking-widest hover:text-red-500 transition-colors">
            <Icon name="LogOut" size={13} />Выйти
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon="Users" label="Всего" value={counts.all} sub="за всё время" />
          <StatCard icon="Flame" label="Сегодня" value={counts.today} sub={counts.today > 0 ? "новые лиды 🔥" : "пока тихо"} />
          <StatCard icon="Wrench" label="В работе" value={counts.in_progress} sub="нужно позвонить" />
          <StatCard icon="CheckCircle" label="Закрыто" value={counts.done} sub={counts.all ? `${Math.round(counts.done / counts.all * 100)}% от всех` : "—"} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["all", "new", "in_progress", "done"] as const).map(s => {
            const cfg = s === "all" ? null : STATUS_CONFIG[s];
            const count = counts[s];
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                  active
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-white"
                }`}>
                {cfg && <Icon name={cfg.icon} size={11} />}
                {s === "all" ? "Все" : cfg!.label}
                <span className={`ml-1 font-bold ${active ? "text-black" : "text-neutral-600"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input type="text" placeholder="Поиск по имени, телефону, сообщению..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
          <button onClick={() => setSortNew(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-800 text-neutral-500 text-xs hover:border-neutral-600 hover:text-white transition-colors whitespace-nowrap">
            <Icon name={sortNew ? "ArrowDown" : "ArrowUp"} size={13} />
            {sortNew ? "Сначала новые" : "Сначала старые"}
          </button>
        </div>

        {search && (
          <p className="text-neutral-600 text-xs mb-4 uppercase tracking-widest">
            Найдено: <span className="text-white font-bold">{filtered.length}</span>
          </p>
        )}

        {/* Leads list */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-neutral-800">
            <div className="text-5xl mb-4">{search ? "🔍" : "📭"}</div>
            <p className="text-lg font-bold text-neutral-400 mb-1">
              {search ? "Ничего не найдено" : "Заявок нет"}
            </p>
            <p className="text-neutral-700 text-sm">
              {search ? "Попробуй другой запрос" : "Они появятся после отправки формы на сайте"}
            </p>
          </div>
        ) : (
          <div className="border border-neutral-800 divide-y divide-neutral-800">
            {filtered.map((lead, i) => {
              const cfg = STATUS_CONFIG[lead.status];
              return (
                <div key={lead.id} className="p-5 md:p-6 hover:bg-neutral-900/40 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">

                    {/* Index */}
                    <span className="hidden md:block text-neutral-700 text-xs font-mono pt-1 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Name + contacts */}
                    <div className="min-w-0 md:w-56 shrink-0">
                      <p className="font-bold text-white text-base leading-tight">{lead.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <a href={`tel:${lead.phone}`} className="text-red-500 hover:text-red-400 transition-colors text-sm">
                          {lead.phone}
                        </a>
                        <button onClick={() => copyPhone(lead.id, lead.phone)}
                          className="text-neutral-700 hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name={copied === lead.id ? "Check" : "Copy"} size={12} />
                        </button>
                      </div>
                      <a
                        href={`https://t.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-neutral-600 hover:text-blue-400 transition-colors"
                      >
                        <Icon name="Send" size={11} />
                        Telegram
                      </a>
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      {lead.message
                        ? <p className="text-neutral-400 text-sm leading-relaxed">{lead.message}</p>
                        : <p className="text-neutral-700 text-sm italic">Без сообщения</p>
                      }
                    </div>

                    {/* Right: date + status controls */}
                    <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">{daysAgo(lead.created_at)}</p>
                        <p className="text-xs text-neutral-700 mt-0.5">{formatDate(lead.created_at)}</p>
                      </div>

                      {/* Status badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 border text-xs rounded-sm ${cfg.color}`}>
                        <Icon name={cfg.icon} size={11} />
                        {cfg.label}
                      </div>

                      {/* Status buttons */}
                      <div className="flex gap-1.5">
                        {(["new", "in_progress", "done"] as LeadStatus[]).map(s => {
                          if (s === lead.status) return null;
                          const c = STATUS_CONFIG[s];
                          return (
                            <button key={s} onClick={() => updateStatus(lead.id, s)}
                              disabled={updating === lead.id}
                              title={c.label}
                              className="flex items-center gap-1 px-2 py-1 border border-neutral-800 text-neutral-600 text-xs hover:border-neutral-600 hover:text-white transition-colors disabled:opacity-40">
                              {updating === lead.id
                                ? <Icon name="Loader" size={11} className="animate-spin" />
                                : <Icon name={c.icon} size={11} />
                              }
                              <span className="hidden md:inline">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-neutral-800 text-xs mt-8 uppercase tracking-widest">
          Only Vespa · Панель управления
        </p>
      </div>
    </main>
  );
}

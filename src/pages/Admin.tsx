import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

type LeadStatus = "new" | "in_progress" | "done" | "cancelled";

interface Lead {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
  status: LeadStatus;
  note: string | null;
  track_code?: string | null;
  service?: string | null;
  model?: string | null;
  year?: number | null;
  photo_url?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
  est_price?: number | null;
  est_days?: string | null;
  bitrix_id?: string | null;
}

const GET_LEADS_URL = "https://functions.poehali.dev/b73dae70-50b0-4466-bb13-f72076056498";
const UPDATE_URL = "https://functions.poehali.dev/b020b00f-3dfc-4f19-b3a9-1112023f86fd";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: string }> = {
  new:         { label: "Новая",      color: "bg-blue-500/15 text-blue-400 border-blue-500/30",       icon: "Sparkles" },
  in_progress: { label: "В работе",   color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: "Wrench" },
  done:        { label: "Обработана", color: "bg-green-500/15 text-green-400 border-green-500/30",     icon: "CheckCircle" },
  cancelled:   { label: "Отменена",   color: "bg-neutral-500/15 text-neutral-400 border-neutral-600", icon: "XCircle" },
};

const ALL_STATUSES: LeadStatus[] = ["new", "in_progress", "done", "cancelled"];

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
  const [refreshing, setRefreshing] = useState(false);
  const [noteEditId, setNoteEditId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function loadLeads() {
    const res = await fetch(GET_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.status === 401) { setAuthStatus("error"); return false; }
    const data = await res.json();
    setLeads(data.leads);
    return true;
  }

  async function fetchLeads(e: React.FormEvent) {
    e.preventDefault();
    setAuthStatus("loading");
    try {
      const ok = await loadLeads();
      if (ok) setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  }

  async function refresh() {
    setRefreshing(true);
    try { await loadLeads(); showToast("Обновлено"); } finally { setRefreshing(false); }
  }

  async function updateStatus(id: number, status: LeadStatus) {
    setUpdating(id);
    try {
      await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "status", id, status }),
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } finally {
      setUpdating(null);
    }
  }

  async function saveNote(id: number) {
    setUpdating(id);
    try {
      await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "note", id, note: noteText }),
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, note: noteText.trim() || null } : l));
      setNoteEditId(null);
      showToast("Заметка сохранена");
    } finally {
      setUpdating(null);
    }
  }

  async function deleteLead(id: number) {
    setUpdating(id);
    try {
      await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "delete", id }),
      });
      setLeads(prev => prev.filter(l => l.id !== id));
      setConfirmDelete(null);
      showToast("Заявка удалена");
    } finally {
      setUpdating(null);
    }
  }

  function exportCSV() {
    const header = ["Имя", "Телефон", "Услуга", "Модель", "Год", "Запись", "Стоимость от", "Срок", "Фото", "Битрикс ID", "Статус", "Заметка", "Дата"];
    const rows = filtered.map(l => [
      l.name, l.phone, l.service || "", l.model || "", l.year || "",
      [l.visit_date, l.visit_time].filter(Boolean).join(" "),
      l.est_price ? `${l.est_price} ₽` : "", l.est_days || "",
      l.photo_url || "", l.bitrix_id || "",
      STATUS_CONFIG[l.status].label, l.note || "", formatDate(l.created_at),
    ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(";"));
    const csv = "\uFEFF" + [header.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zayavki_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Файл скачан");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
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
      (l.name.toLowerCase().includes(q) || l.phone.includes(q) ||
       (l.message || "").toLowerCase().includes(q) || (l.note || "").toLowerCase().includes(q))
    );
    return sortNew ? list : [...list].reverse();
  }, [leads, search, sortNew, filterStatus]);

  const counts = useMemo(() => ({
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    in_progress: leads.filter(l => l.status === "in_progress").length,
    done: leads.filter(l => l.status === "done").length,
    cancelled: leads.filter(l => l.status === "cancelled").length,
    today: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
  }), [leads]);

  const conversion = counts.all ? Math.round(counts.done / counts.all * 100) : 0;

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
              <input type={showPassword ? "text" : "password"} required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 pr-12 text-sm focus:outline-none focus:border-red-600 transition-colors placeholder:text-neutral-600"
                placeholder="Введите пароль" />
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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-2.5 text-sm font-medium flex items-center gap-2 shadow-xl">
          <Icon name="Check" size={15} />{toast}
        </div>
      )}

      <header className="border-b border-neutral-800 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛵</span>
          <span className="font-bold tracking-tighter text-lg">ONLY VESPA</span>
          <span className="hidden md:block text-neutral-700 text-sm">/ Заявки</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={refresh} disabled={refreshing}
            className="flex items-center gap-2 text-neutral-600 text-xs uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50">
            <Icon name="RefreshCw" size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden md:inline">Обновить</span>
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 text-neutral-600 text-xs uppercase tracking-widest hover:text-white transition-colors">
            <Icon name="Download" size={13} />
            <span className="hidden md:inline">Экспорт</span>
          </button>
          <a href="/" className="hidden md:block text-neutral-600 text-xs uppercase tracking-widest hover:text-white transition-colors">На сайт</a>
          <button onClick={() => { setAuthStatus("idle"); setLeads([]); setPassword(""); }}
            className="flex items-center gap-2 text-neutral-600 text-xs uppercase tracking-widest hover:text-red-500 transition-colors">
            <Icon name="LogOut" size={13} /><span className="hidden md:inline">Выйти</span>
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon="Users" label="Всего" value={counts.all} sub="за всё время" />
          <StatCard icon="Flame" label="Сегодня" value={counts.today} sub={counts.today > 0 ? "новые лиды 🔥" : "пока тихо"} />
          <StatCard icon="Wrench" label="В работе" value={counts.in_progress} sub="нужно позвонить" />
          <StatCard icon="TrendingUp" label="Конверсия" value={`${conversion}%`} sub={`${counts.done} обработано`} />
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {(["all", ...ALL_STATUSES] as const).map(s => {
            const cfg = s === "all" ? null : STATUS_CONFIG[s];
            const count = counts[s];
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                  active ? "bg-white text-black border-white"
                         : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-white"}`}>
                {cfg && <Icon name={cfg.icon} size={11} />}
                {s === "all" ? "Все" : cfg!.label}
                <span className={`ml-1 font-bold ${active ? "text-black" : "text-neutral-600"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input type="text" placeholder="Поиск по имени, телефону, сообщению, заметке..."
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

        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-neutral-800">
            <div className="text-5xl mb-4">{search ? "🔍" : "📭"}</div>
            <p className="text-lg font-bold text-neutral-400 mb-1">{search ? "Ничего не найдено" : "Заявок нет"}</p>
            <p className="text-neutral-700 text-sm">{search ? "Попробуй другой запрос" : "Они появятся после отправки формы на сайте"}</p>
          </div>
        ) : (
          <div className="border border-neutral-800 divide-y divide-neutral-800">
            {filtered.map((lead, i) => {
              const cfg = STATUS_CONFIG[lead.status];
              return (
                <div key={lead.id} className="p-5 md:p-6 hover:bg-neutral-900/40 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <span className="hidden md:block text-neutral-700 text-xs font-mono pt-1 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 md:w-56 shrink-0">
                      <p className="font-bold text-white text-base leading-tight">{lead.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <a href={`tel:${lead.phone}`} className="text-red-500 hover:text-red-400 transition-colors text-sm">{lead.phone}</a>
                        <button onClick={() => copyPhone(lead.id, lead.phone)}
                          className="text-neutral-700 hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name={copied === lead.id ? "Check" : "Copy"} size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <a href={`https://t.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-blue-400 transition-colors">
                          <Icon name="Send" size={11} />Telegram
                        </a>
                        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-green-400 transition-colors">
                          <Icon name="Phone" size={11} />Позвонить
                        </a>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Детали заявки */}
                      {(lead.service || lead.model || lead.visit_date || lead.est_price || lead.photo_url) && (
                        <div className="flex flex-wrap items-start gap-3 mb-1">
                          {lead.photo_url && (
                            <a href={lead.photo_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              <img src={lead.photo_url} alt="Фото мопеда" className="w-16 h-16 object-cover border border-neutral-800 hover:border-neutral-600 transition-colors" />
                            </a>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {lead.service && (
                              <span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-200 px-2 py-1">
                                <Icon name="Wrench" size={11} className="text-red-500" />{lead.service}
                              </span>
                            )}
                            {lead.model && (
                              <span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-200 px-2 py-1">
                                <Icon name="Bike" size={11} className="text-red-500" />{lead.model}{lead.year ? `, ${lead.year}` : ""}
                              </span>
                            )}
                            {(lead.visit_date || lead.visit_time) && (
                              <span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-200 px-2 py-1">
                                <Icon name="CalendarClock" size={11} className="text-red-500" />{[lead.visit_date, lead.visit_time].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {lead.est_price ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-500/15 text-green-400 px-2 py-1">
                                <Icon name="Banknote" size={11} />от {lead.est_price.toLocaleString("ru-RU")} ₽
                              </span>
                            ) : null}
                            {lead.est_days && (
                              <span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1">
                                <Icon name="Clock" size={11} />{lead.est_days}
                              </span>
                            )}
                            {lead.bitrix_id && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-400 px-2 py-1">
                                <Icon name="CheckCircle" size={11} />Битрикс #{lead.bitrix_id}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {lead.message
                        ? <p className="text-neutral-400 text-sm leading-relaxed">{lead.message}</p>
                        : <p className="text-neutral-700 text-sm italic">Без сообщения</p>}

                      {noteEditId === lead.id ? (
                        <div className="flex items-center gap-2">
                          <input autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && saveNote(lead.id)}
                            placeholder="Заметка для себя..."
                            className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-1.5 focus:outline-none focus:border-yellow-500" />
                          <button onClick={() => saveNote(lead.id)} disabled={updating === lead.id}
                            className="text-green-500 hover:text-green-400"><Icon name="Check" size={15} /></button>
                          <button onClick={() => setNoteEditId(null)} className="text-neutral-600 hover:text-white"><Icon name="X" size={15} /></button>
                        </div>
                      ) : lead.note ? (
                        <button onClick={() => { setNoteEditId(lead.id); setNoteText(lead.note || ""); }}
                          className="flex items-start gap-1.5 text-xs text-yellow-500/80 hover:text-yellow-400 transition-colors text-left">
                          <Icon name="StickyNote" size={12} className="mt-0.5 shrink-0" />
                          <span className="italic">{lead.note}</span>
                        </button>
                      ) : (
                        <button onClick={() => { setNoteEditId(lead.id); setNoteText(""); }}
                          className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-yellow-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="Plus" size={11} />Добавить заметку
                        </button>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">{daysAgo(lead.created_at)}</p>
                        <p className="text-xs text-neutral-700 mt-0.5">{formatDate(lead.created_at)}</p>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2.5 py-1 border text-xs rounded-sm ${cfg.color}`}>
                        <Icon name={cfg.icon} size={11} />{cfg.label}
                      </div>

                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {ALL_STATUSES.map(s => {
                          if (s === lead.status) return null;
                          const c = STATUS_CONFIG[s];
                          return (
                            <button key={s} onClick={() => updateStatus(lead.id, s)} disabled={updating === lead.id} title={c.label}
                              className="flex items-center gap-1 px-2 py-1 border border-neutral-800 text-neutral-600 text-xs hover:border-neutral-600 hover:text-white transition-colors disabled:opacity-40">
                              {updating === lead.id ? <Icon name="Loader" size={11} className="animate-spin" /> : <Icon name={c.icon} size={11} />}
                              <span className="hidden lg:inline">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {confirmDelete === lead.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => deleteLead(lead.id)} disabled={updating === lead.id}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs hover:bg-red-700 transition-colors">
                            <Icon name="Trash2" size={11} />Удалить
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 border border-neutral-700 text-neutral-400 text-xs hover:text-white">Отмена</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(lead.id)}
                          className="flex items-center gap-1 text-xs text-neutral-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="Trash2" size={11} />Удалить
                        </button>
                      )}
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
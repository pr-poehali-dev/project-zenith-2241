import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

interface Lead {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
}

const API_URL = "https://functions.poehali.dev/b73dae70-50b0-4466-bb13-f72076056498";

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest">
        <Icon name={icon} size={14} />
        {label}
      </div>
      <div className="text-3xl font-bold text-white tracking-tighter">{value}</div>
      {sub && <div className="text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [sortNew, setSortNew] = useState(true);

  async function fetchLeads(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) { setStatus("error"); return; }
      const data = await res.json();
      setLeads(data.leads);
      setStatus("success");
    } catch {
      setStatus("error");
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
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.message || "").toLowerCase().includes(q)
    );
    return sortNew ? list : [...list].reverse();
  }, [leads, search, sortNew]);

  const todayCount = leads.filter(l => {
    return new Date(l.created_at).toDateString() === new Date().toDateString();
  }).length;

  const withMessage = leads.filter(l => l.message && l.message.trim()).length;

  if (status !== "success") {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-sm px-8">
          <div className="mb-10 text-center">
            <div className="text-4xl mb-3">🛵</div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">Only Vespa</h1>
            <p className="text-neutral-500 text-sm mt-1 uppercase tracking-widest">Панель управления</p>
          </div>

          <form onSubmit={fetchLeads} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white px-4 py-3 pr-12 focus:outline-none focus:border-red-600 transition-colors placeholder:text-neutral-600"
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
                <Icon name="AlertCircle" size={14} />
                Неверный пароль
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-red-600 text-white text-sm uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <><Icon name="Loader" size={14} className="animate-spin" />Загрузка...</>
              ) : (
                <><Icon name="LogIn" size={14} />Войти</>
              )}
            </button>
          </form>

          <a href="/" className="block text-center mt-8 text-neutral-600 text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">
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
          <div>
            <span className="font-bold tracking-tighter text-lg">ONLY VESPA</span>
            <span className="text-neutral-600 text-sm ml-2 uppercase tracking-widest hidden md:inline">/ Заявки</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1 text-neutral-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            Онлайн
          </div>
          <a href="/" className="text-neutral-500 text-xs uppercase tracking-widest hover:text-white transition-colors hidden md:block">
            На сайт
          </a>
          <button
            onClick={() => { setStatus("idle"); setLeads([]); setPassword(""); }}
            className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            <Icon name="LogOut" size={13} />
            Выйти
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon="Users" label="Всего заявок" value={leads.length} sub="за всё время" />
          <StatCard icon="Flame" label="Сегодня" value={todayCount} sub={todayCount > 0 ? "новые лиды 🔥" : "пока тихо"} />
          <StatCard icon="MessageSquare" label="С сообщением" value={withMessage} sub={`${leads.length ? Math.round(withMessage / leads.length * 100) : 0}% от всех`} />
          <StatCard
            icon="Phone"
            label="Последняя"
            value={leads[0] ? daysAgo(leads[0].created_at) : "—"}
            sub={leads[0] ? leads[0].name : "заявок нет"}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, сообщению..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-600"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortNew(v => !v)}
            className="flex items-center gap-2 px-5 py-3 border border-neutral-800 text-neutral-400 text-sm hover:border-neutral-600 hover:text-white transition-colors whitespace-nowrap"
          >
            <Icon name={sortNew ? "ArrowDown" : "ArrowUp"} size={13} />
            {sortNew ? "Сначала новые" : "Сначала старые"}
          </button>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-neutral-500 text-sm mb-4">
            Найдено: <span className="text-white font-bold">{filtered.length}</span>
          </p>
        )}

        {/* Leads */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-neutral-800">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-bold text-neutral-300 mb-1">
              {search ? "Ничего не найдено" : "Заявок пока нет"}
            </p>
            <p className="text-neutral-600 text-sm">
              {search ? "Попробуй другой запрос" : "Они появятся здесь после отправки формы"}
            </p>
          </div>
        ) : (
          <div className="border border-neutral-800 divide-y divide-neutral-800">
            {filtered.map((lead, i) => (
              <div
                key={lead.id}
                className="p-5 md:p-6 flex flex-col md:grid md:grid-cols-12 md:gap-6 hover:bg-neutral-900/50 transition-colors group"
              >
                {/* Index */}
                <div className="hidden md:flex col-span-1 items-start pt-1">
                  <span className="text-neutral-700 text-sm font-mono">
                    {String(sortNew ? i + 1 : filtered.length - i).padStart(2, "0")}
                  </span>
                </div>

                {/* Name + phone */}
                <div className="col-span-3 mb-3 md:mb-0">
                  <p className="font-bold text-white text-lg leading-tight">{lead.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-red-500 hover:text-red-400 transition-colors text-sm"
                    >
                      {lead.phone}
                    </a>
                    <button
                      onClick={() => copyPhone(lead.id, lead.phone)}
                      className="text-neutral-700 hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Icon name={copied === lead.id ? "Check" : "Copy"} size={12} />
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-neutral-600 hover:text-green-500 transition-colors"
                  >
                    <Icon name="MessageCircle" size={11} />
                    WhatsApp
                  </a>
                </div>

                {/* Message */}
                <div className="col-span-6 mb-3 md:mb-0 flex items-start">
                  {lead.message ? (
                    <p className="text-neutral-400 text-sm leading-relaxed">{lead.message}</p>
                  ) : (
                    <p className="text-neutral-700 text-sm italic">Без сообщения</p>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-2 flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1">
                  <span className="text-xs text-neutral-600 bg-neutral-900 px-2 py-1 rounded">
                    {daysAgo(lead.created_at)}
                  </span>
                  <span className="text-xs text-neutral-700">
                    {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {leads.length > 0 && (
          <p className="text-center text-neutral-700 text-xs mt-6 uppercase tracking-widest">
            Всего записей: {leads.length}
          </p>
        )}
      </div>
    </main>
  );
}
import { useState } from "react";

interface Lead {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  async function fetchLeads(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://functions.poehali.dev/b73dae70-50b0-4466-bb13-f72076056498", {
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
      hour: "2-digit", minute: "2-digit"
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-black px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tighter">ONLY VESPA — Админка</span>
        <a href="/" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">← На сайт</a>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {status !== "success" ? (
          <div className="max-w-sm mx-auto mt-20">
            <h1 className="text-4xl font-bold tracking-tighter mb-8">Вход</h1>
            <form onSubmit={fetchLeads} className="space-y-6">
              <div>
                <label className="block text-sm uppercase tracking-widest mb-2">Пароль</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-b-2 border-black py-2 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Введите пароль"
                />
              </div>
              {status === "error" && (
                <p className="text-red-600 text-sm">Неверный пароль или ошибка загрузки</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Загрузка..." : "Войти"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold tracking-tighter">Заявки</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-500">{leads.length} заявок</span>
                <button
                  onClick={() => { setStatus("idle"); setLeads([]); setPassword(""); }}
                  className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  Выйти
                </button>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-20 text-neutral-400">
                <p className="text-2xl font-bold mb-2">Заявок пока нет</p>
                <p>Они появятся здесь после отправки формы на сайте</p>
              </div>
            ) : (
              <div className="border-t border-black">
                {leads.map((lead, i) => (
                  <div key={lead.id} className="border-b border-black py-6 grid grid-cols-12 gap-4 hover:bg-neutral-50 px-2 transition-colors">
                    <div className="col-span-1 text-neutral-400 text-sm pt-1">#{i + 1}</div>
                    <div className="col-span-3">
                      <p className="font-bold text-lg">{lead.name}</p>
                      <a href={`tel:${lead.phone}`} className="text-red-600 hover:underline">{lead.phone}</a>
                    </div>
                    <div className="col-span-6 text-neutral-600">
                      {lead.message || <span className="text-neutral-300 italic">Без сообщения</span>}
                    </div>
                    <div className="col-span-2 text-sm text-neutral-400 text-right">
                      {lead.created_at ? formatDate(lead.created_at) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
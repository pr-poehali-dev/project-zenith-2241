import { useState } from "react";
import Icon from "@/components/ui/icon";

const TRACK_URL = "https://functions.poehali.dev/2031306a-b26f-411c-b517-3041adc1da25";

type Status = "new" | "in_progress" | "done" | "cancelled";

interface Result {
  found: boolean;
  name?: string;
  status?: Status;
  status_text?: string;
  created_at?: string;
}

const STEPS: { key: Status; label: string; icon: string }[] = [
  { key: "new", label: "Принята", icon: "Inbox" },
  { key: "in_progress", label: "В работе", icon: "Wrench" },
  { key: "done", label: "Готова", icon: "CheckCircle" },
];

const STATUS_INFO: Record<Status, { title: string; desc: string; color: string; emoji: string }> = {
  new: { title: "Заявка принята", desc: "Мы получили вашу заявку. Мастер скоро свяжется с вами для уточнения деталей.", color: "text-blue-600", emoji: "📥" },
  in_progress: { title: "Заявка в работе", desc: "Мастер уже занимается вашей Vespa. Мы сообщим, когда всё будет готово.", color: "text-yellow-600", emoji: "🔧" },
  done: { title: "Заявка готова!", desc: "Работа завершена. Можете забирать свою Vespa — она снова в строю!", color: "text-green-600", emoji: "✅" },
  cancelled: { title: "Извините, ваша заявка отменена", desc: "К сожалению, мы не смогли взять заявку в работу. Пожалуйста, попробуйте оформить её снова или свяжитесь с нами напрямую.", color: "text-red-600", emoji: "😔" },
};

export default function Track() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "notfound" | "error">("idle");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.status === 404) { setStatus("notfound"); return; }
      const data = await res.json();
      if (data.found) {
        setResult(data);
        setStatus("idle");
      } else {
        setStatus("notfound");
      }
    } catch {
      setStatus("error");
    }
  }

  const info = result?.status ? STATUS_INFO[result.status] : null;
  const currentStep = result?.status ? STEPS.findIndex(s => s.key === result.status) : -1;
  const isCancelled = result?.status === "cancelled";

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-black px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
          <span>🛵</span> ONLY VESPA
        </a>
        <a href="/" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">← На сайт</a>
      </nav>

      <div className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-3">Отследить заявку</h1>
        <p className="text-neutral-500 mb-10">
          Введите код, который вы получили при оформлении заявки.
        </p>

        <form onSubmit={check} className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Например: A1B2C3"
            maxLength={6}
            className="flex-1 border border-black px-5 py-4 text-lg tracking-[0.2em] font-bold uppercase focus:outline-none focus:border-red-600 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading"
              ? <><Icon name="Loader" size={16} className="animate-spin" />Ищем...</>
              : <><Icon name="Search" size={16} />Проверить</>}
          </button>
        </form>

        {status === "notfound" && (
          <div className="border border-red-600 bg-red-50 p-6 flex items-start gap-3">
            <Icon name="AlertCircle" size={22} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-600">Заявка не найдена</p>
              <p className="text-neutral-600 text-sm mt-1">Проверьте код — возможно, в нём опечатка. Или свяжитесь с нами в Telegram.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="border border-red-600 bg-red-50 p-6 text-red-600">
            Что-то пошло не так. Попробуйте ещё раз.
          </div>
        )}

        {result && info && (
          <div className="border border-black">
            {/* Header */}
            <div className={`p-8 text-center ${isCancelled ? "bg-red-50" : "bg-neutral-50"} border-b border-black`}>
              <div className="text-6xl mb-4">{info.emoji}</div>
              <h2 className={`text-3xl font-bold tracking-tighter mb-2 ${info.color}`}>{info.title}</h2>
              <p className="text-neutral-600 max-w-md mx-auto">{info.desc}</p>
              {result.name && (
                <p className="text-sm text-neutral-400 mt-4 uppercase tracking-widest">
                  Заявка: {result.name}
                </p>
              )}
            </div>

            {/* Progress steps (hide if cancelled) */}
            {!isCancelled && (
              <div className="p-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-6 left-0 w-full h-0.5 bg-neutral-200" />
                  <div
                    className="absolute top-6 left-0 h-0.5 bg-red-600 transition-all duration-500"
                    style={{ width: `${currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%` }}
                  />
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 bg-white px-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                          done ? "bg-red-600 border-red-600 text-white" : "bg-white border-neutral-300 text-neutral-400"
                        }`}>
                          <Icon name={step.icon} size={20} />
                        </div>
                        <span className={`text-xs uppercase tracking-widest text-center ${done ? "text-black font-bold" : "text-neutral-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-8 pt-0 flex flex-col sm:flex-row gap-3 justify-center">
              {isCancelled ? (
                <a href="/#booking" className="px-8 py-3 bg-red-600 text-white text-sm uppercase tracking-widest text-center hover:bg-black transition-colors">
                  Оформить заново
                </a>
              ) : (
                <a href="https://t.me/shalyap" target="_blank" rel="noreferrer" className="px-8 py-3 border border-black text-sm uppercase tracking-widest text-center hover:bg-black hover:text-white transition-colors">
                  Связаться с мастером
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-neutral-400 text-sm mb-3">Нет кода или потеряли его?</p>
          <a href="https://t.me/shalyap" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
            <Icon name="Send" size={15} />Напишите нам в Telegram
          </a>
        </div>
      </div>

      <footer className="border-t border-black px-4 md:px-8 py-6 text-center text-sm text-neutral-400">
        Only Vespa Moscow · Мастерская по ремонту и реставрации
      </footer>
    </main>
  );
}

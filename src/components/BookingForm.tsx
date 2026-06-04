import { useState } from "react";
import Icon from "@/components/ui/icon";

const SEND_URL = "https://functions.poehali.dev/489bf1a9-6c48-4e0c-9814-f0b382a5cf65";

const SERVICES = ["Диагностика", "Техническое обслуживание", "Ремонт двигателя", "Ремонт после ДТП", "Покраска", "Реставрация", "Другое"];
const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function getDates() {
  const dates: { value: string; label: string; weekday: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue; // выходной воскресенье
    dates.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }),
    });
  }
  return dates;
}

export default function BookingForm() {
  const dates = getDates();
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trackCode, setTrackCode] = useState("");

  const step1 = service !== "";
  const step2 = step1 && date !== "" && time !== "";
  const canSubmit = step2 && name.trim() !== "" && phone.trim() !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const dateLabel = dates.find(d => d.value === date)?.label || date;
    const message = `Онлайн-запись на ремонт.\nУслуга: ${service}\nДата: ${dateLabel}, ${time}`;
    try {
      const res = await fetch(SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrackCode(data.track_code || "");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section id="booking" className="py-20 px-4 md:px-8 bg-neutral-50">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white border border-black p-10">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-4xl font-bold tracking-tighter mb-3">Вы записаны!</h2>
            <p className="text-neutral-600 mb-6">
              Мастер подтвердит запись в ближайшее время. Мы ждём вас {dates.find(d => d.value === date)?.label} в {time}.
            </p>
            {trackCode && (
              <div className="bg-black text-white p-6 mb-6">
                <p className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Код отслеживания</p>
                <p className="text-4xl font-bold tracking-[0.3em] text-red-500">{trackCode}</p>
                <p className="text-sm text-neutral-500 mt-3">Сохраните код — по нему можно проверить статус заявки</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/track" className="px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-widest hover:bg-black transition-colors">
                Отследить заявку
              </a>
              <button
                onClick={() => { setStatus("idle"); setService(""); setDate(""); setTime(""); setName(""); setPhone(""); }}
                className="px-6 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Записаться снова
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 px-4 md:px-8 bg-neutral-50">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-6xl font-bold tracking-tighter mb-4">ЗАПИСЬ</h2>
        <p className="text-neutral-500 mb-12">
          Выберите услугу, удобную дату и время — мастер подтвердит запись.
        </p>

        <form onSubmit={submit} className="space-y-10">
          {/* Step 1: service */}
          <div>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
              Услуга
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setService(s)}
                  className={`px-4 py-2.5 text-sm border transition-colors ${
                    service === s ? "bg-red-600 text-white border-red-600" : "bg-white border-neutral-300 hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: date + time */}
          <div className={step1 ? "" : "opacity-40 pointer-events-none"}>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
              Дата и время
            </p>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
              {dates.map(d => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => setDate(d.value)}
                  className={`shrink-0 w-20 py-3 border text-center transition-colors ${
                    date === d.value ? "bg-black text-white border-black" : "bg-white border-neutral-300 hover:border-black"
                  }`}
                >
                  <span className="block text-xs uppercase text-neutral-400">{d.weekday}</span>
                  <span className="block font-bold">{d.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTime(t)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    time === t ? "bg-red-600 text-white border-red-600" : "bg-white border-neutral-300 hover:border-black"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: contacts */}
          <div className={step2 ? "" : "opacity-40 pointer-events-none"}>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">3</span>
              Ваши контакты
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className="bg-white border border-neutral-300 px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="bg-white border border-neutral-300 px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="text-red-600 text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={15} />Не удалось записаться. Попробуйте ещё раз.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="w-full sm:w-auto px-10 py-4 bg-black text-white text-sm uppercase tracking-widest font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading"
              ? <><Icon name="Loader" size={16} className="animate-spin" />Записываем...</>
              : <><Icon name="CalendarCheck" size={16} />Записаться на ремонт</>}
          </button>
        </form>
      </div>
    </section>
  );
}

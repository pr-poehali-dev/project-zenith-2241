import { useState } from "react";
import Icon from "@/components/ui/icon";

const SEND_URL = "https://functions.poehali.dev/489bf1a9-6c48-4e0c-9814-f0b382a5cf65";
const UPLOAD_URL = "https://functions.poehali.dev/218d18fe-0c18-4826-86b3-965365c023ec";

const RATE = 4000; // нормо-час, ₽

interface ServiceDef {
  name: string;
  price: number; // от, ₽
  days: string;
}

const SERVICES: ServiceDef[] = [
  { name: "Диагностика", price: 2000, days: "1 день" },
  { name: "Техническое обслуживание", price: 6000, days: "1–2 дня" },
  { name: "Ремонт двигателя", price: 16000, days: "5–10 дней" },
  { name: "Ремонт после ДТП", price: 20000, days: "от 1 недели" },
  { name: "Покраска", price: 8000, days: "3–5 дней" },
  { name: "Реставрация", price: 40000, days: "от 4 недель" },
  { name: "Другое", price: 0, days: "после диагностики" },
];

const MODELS = [
  "Vespa Primavera", "Vespa Sprint", "Vespa GTS", "Vespa GTV",
  "Vespa LX", "Vespa LXV", "Vespa Sei Giorni", "Другая Vespa",
  "Другой скутер / мотороллер",
];

const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function getDates() {
  const dates: { value: string; label: string; weekday: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue;
    dates.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }),
    });
  }
  return dates;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export default function BookingForm() {
  const dates = getDates();
  const [service, setService] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trackCode, setTrackCode] = useState("");

  const MAX_PHOTOS = 5;

  const chosen = SERVICES.find(s => s.name === service);

  const step1 = service !== "";
  const step2 = step1 && model !== "" && year !== "";
  const step3 = step2 && date !== "" && time !== "";
  const canSubmit = step3 && name.trim() !== "" && phone.trim() !== "" && !photoUploading;

  async function uploadPhotos(files: FileList) {
    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) {
      alert(`Можно прикрепить не более ${MAX_PHOTOS} фото`);
      return;
    }
    const list = Array.from(files).slice(0, slots);
    setPhotoUploading(true);
    try {
      for (const file of list) {
        if (file.size > 8 * 1024 * 1024) {
          alert(`Фото «${file.name}» больше 8 МБ — пропущено`);
          continue;
        }
        const b64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: b64, content_type: file.type || "image/jpeg" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) setPhotos(prev => [...prev, data.url]);
        }
      }
    } catch {
      alert("Не удалось загрузить часть фото.");
    } finally {
      setPhotoUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos(prev => prev.filter(p => p !== url));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const dateLabel = dates.find(d => d.value === date)?.label || date;
    const estPrice = chosen && chosen.price > 0 ? chosen.price : null;
    const estDays = chosen?.days || "";
    const message =
      `Онлайн-запись на ремонт.\n` +
      `Услуга: ${service}\n` +
      `Мопед: ${model}${year ? `, ${year} г.` : ""}\n` +
      (problem.trim() ? `Проблема: ${problem.trim()}\n` : "") +
      `Запись: ${dateLabel}, ${time}\n` +
      (estPrice ? `Примерная стоимость: от ${estPrice.toLocaleString("ru-RU")} ₽\n` : "") +
      `Примерный срок: ${estDays}` +
      (photos.length ? `\nФото: ${photos.join(", ")}` : "");

    try {
      const res = await fetch(SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, message, service, model,
          year: year || null,
          problem: problem.trim() || null,
          photo_url: photos[0] || null,
          photos,
          visit_date: dateLabel, visit_time: time,
          est_price: estPrice, est_days: estDays,
        }),
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

  function reset() {
    setStatus("idle"); setService(""); setModel(""); setYear("");
    setDate(""); setTime(""); setName(""); setPhone(""); setPhotoUrl("");
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
                onClick={reset}
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
          Выберите услугу и мопед, прикрепите фото, выберите дату и время — мастер подтвердит запись.
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
                  key={s.name}
                  onClick={() => setService(s.name)}
                  className={`px-4 py-2.5 text-sm border transition-colors ${
                    service === s.name ? "bg-red-600 text-white border-red-600" : "bg-white border-neutral-300 hover:border-black"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: model + year + photo */}
          <div className={step1 ? "" : "opacity-40 pointer-events-none"}>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
              Ваш мопед
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="bg-white border border-neutral-300 px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="">Модель мопеда</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="bg-white border border-neutral-300 px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="">Год выпуска</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Photo upload */}
            <div>
              <p className="text-sm text-neutral-500 mb-2">Фото мопеда (необязательно, поможет мастеру оценить)</p>
              {photoUrl ? (
                <div className="flex items-center gap-4">
                  <img src={photoUrl} alt="Фото мопеда" className="w-24 h-24 object-cover border border-neutral-300" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-sm text-red-600 flex items-center gap-1 hover:underline"
                  >
                    <Icon name="X" size={15} /> Удалить
                  </button>
                </div>
              ) : (
                <label className={`inline-flex items-center gap-2 px-4 py-3 border border-dashed border-neutral-400 cursor-pointer hover:border-black transition-colors text-sm ${photoUploading ? "opacity-60" : ""}`}>
                  <Icon name={photoUploading ? "Loader" : "ImagePlus"} size={18} className={photoUploading ? "animate-spin" : ""} />
                  {photoUploading ? "Загрузка…" : "Прикрепить фото"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={photoUploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Step 3: date + time */}
          <div className={step2 ? "" : "opacity-40 pointer-events-none"}>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">3</span>
              Дата и время <span className="text-red-600">*</span>
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

          {/* Estimate */}
          {chosen && (
            <div className="bg-black text-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon name="Calculator" size={28} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-neutral-400">Примерная стоимость</p>
                  <p className="text-3xl font-bold tracking-tighter">
                    {chosen.price > 0 ? `от ${chosen.price.toLocaleString("ru-RU")} ₽` : "после диагностики"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Clock" size={28} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-neutral-400">Примерный срок</p>
                  <p className="text-2xl font-bold tracking-tighter">{chosen.days}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: contacts */}
          <div className={step3 ? "" : "opacity-40 pointer-events-none"}>
            <p className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">4</span>
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
            {status === "loading" ? "Отправляем…" : "Записаться на ремонт"}
          </button>
          <p className="text-xs text-neutral-400">
            Стоимость и срок ориентировочные, без учёта запчастей. Точный расчёт мастер назовёт после диагностики.
          </p>
        </form>
      </div>
    </section>
  );
}
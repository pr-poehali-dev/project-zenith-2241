import { useState } from "react";
import Icon from "@/components/ui/icon";

const RATE = 4000; // нормо-час, ₽

interface Service {
  id: string;
  label: string;
  hours: number;
  icon: string;
}

const SERVICES: Service[] = [
  { id: "diag", label: "Диагностика", hours: 0.5, icon: "Search" },
  { id: "to", label: "Техническое обслуживание", hours: 1.5, icon: "Wrench" },
  { id: "engine", label: "Ремонт двигателя", hours: 4, icon: "Cog" },
  { id: "paint", label: "Покраска элемента", hours: 2, icon: "Brush" },
  { id: "dtp", label: "Восстановление после ДТП", hours: 5, icon: "Hammer" },
  { id: "resto", label: "Реставрация", hours: 10, icon: "Sparkles" },
  { id: "brakes", label: "Ремонт тормозов", hours: 1, icon: "Disc" },
  { id: "electric", label: "Электрика", hours: 2, icon: "Zap" },
];

const URGENCY = [
  { id: "normal", label: "Обычная", mult: 1 },
  { id: "fast", label: "Срочно (+30%)", mult: 1.3 },
];

function fmtHours(h: number) {
  return h % 1 === 0 ? `${h} ч` : `${h.toString().replace(".", ",")} ч`;
}

export default function PriceCalculator() {
  const [selected, setSelected] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("normal");

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  const chosen = SERVICES.filter(s => selected.includes(s.id));
  const totalHours = chosen.reduce((sum, s) => sum + s.hours, 0);
  const mult = URGENCY.find(u => u.id === urgency)!.mult;
  const total = Math.round(totalHours * RATE * mult);

  return (
    <section id="calculator" className="py-20 px-4 md:px-8 bg-white">
      <div className="container mx-auto">
        <h2 className="text-6xl font-bold tracking-tighter mb-4">КАЛЬКУЛЯТОР</h2>
        <p className="text-neutral-500 mb-8 max-w-2xl">
          Стоимость работ считается по нормо-часам. Выберите нужные работы — покажем примерную цену. Точную назовёт мастер после диагностики.
        </p>

        {/* Rate banner */}
        <div className="flex items-center gap-4 bg-black text-white p-6 mb-12 max-w-md">
          <Icon name="Clock" size={32} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-400">Нормо-час</p>
            <p className="text-3xl font-bold tracking-tighter">{RATE.toLocaleString("ru-RU")} ₽</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l border-black">
              {SERVICES.map(s => {
                const active = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`border-b border-r border-black p-5 text-left flex items-start gap-3 transition-colors ${
                      active ? "bg-black text-white" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`mt-0.5 ${active ? "text-red-500" : "text-red-600"}`}>
                      <Icon name={active ? "CheckSquare" : "Square"} size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold leading-tight">{s.label}</p>
                      <p className={`text-sm mt-1 ${active ? "text-neutral-400" : "text-neutral-500"}`}>
                        ~ {fmtHours(s.hours)} · {(s.hours * RATE).toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Urgency */}
            <div className="mt-6">
              <p className="text-sm uppercase tracking-widest mb-3 text-neutral-500">Срочность</p>
              <div className="flex gap-3">
                {URGENCY.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUrgency(u.id)}
                    className={`px-5 py-2.5 border text-sm transition-colors ${
                      urgency === u.id ? "bg-red-600 text-white border-red-600" : "border-black hover:bg-neutral-50"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-black text-white p-8 flex flex-col h-fit lg:sticky lg:top-24">
            <p className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Примерная стоимость</p>
            <p className="text-5xl font-bold tracking-tighter mb-1">
              {total > 0 ? `${total.toLocaleString("ru-RU")} ₽` : "—"}
            </p>
            <p className="text-neutral-500 text-sm mb-6">
              {selected.length === 0
                ? "Выберите работы"
                : `${fmtHours(totalHours)} работы · ${RATE.toLocaleString("ru-RU")} ₽/час`}
            </p>

            {chosen.length > 0 && (
              <div className="space-y-2 mb-6 pb-6 border-b border-neutral-800">
                {chosen.map(s => (
                  <div key={s.id} className="flex justify-between text-sm text-neutral-300">
                    <span>{s.label}</span>
                    <span className="text-neutral-500 whitespace-nowrap ml-3">{fmtHours(s.hours)}</span>
                  </div>
                ))}
                {mult > 1 && (
                  <div className="flex justify-between text-sm text-red-500 pt-1">
                    <span>Срочность</span>
                    <span>+30%</span>
                  </div>
                )}
              </div>
            )}

            <a
              href="#booking"
              className="block text-center px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors"
            >
              Записаться на ремонт
            </a>
            <p className="text-xs text-neutral-600 mt-4 text-center">
              Цены ориентировочные, без учёта запчастей. Финальный расчёт — после осмотра.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

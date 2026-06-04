import { useState } from "react";
import Icon from "@/components/ui/icon";

const FAQ_ITEMS = [
  {
    q: "Сколько времени занимает ремонт?",
    a: "Зависит от сложности. Плановое ТО — 1 день, ремонт двигателя — 5–10 дней, полная реставрация — от 4 недель. Точные сроки назовём после диагностики.",
  },
  {
    q: "Вы работаете только с Vespa?",
    a: "Vespa — наша специализация и страсть. Но мы также берём в работу другие мотороллеры, скутеры и лёгкие мотоциклы. Напишите нам — подскажем.",
  },
  {
    q: "Нужна ли предварительная запись?",
    a: "Да, лучше записаться заранее — так мы подготовим всё необходимое и не заставим вас ждать. Оставьте заявку на сайте или напишите в Telegram.",
  },
  {
    q: "Даёте ли вы гарантию на работы?",
    a: "Да. На все виды работ предоставляем гарантию. Срок зависит от типа ремонта — обсуждается индивидуально при приёмке.",
  },
  {
    q: "Используете ли оригинальные детали?",
    a: "По возможности ставим только оригинальные запчасти. Если детали нет в наличии — заказываем из-за рубежа. Качественные аналоги предлагаем только с вашего согласия.",
  },
  {
    q: "Можно ли привезти скутер на эвакуаторе?",
    a: "Конечно. У нас есть собственный мотоэвакуатор — доставим вашу технику по Москве и ближайшим областям. Стоимость — от 5 000 ₽.",
  },
  {
    q: "Храните ли вы технику зимой?",
    a: "Да, предлагаем сезонное хранение в тёплом крытом помещении под чехлом. Перед хранением проводим консервацию — весной скутер заведётся с первого раза.",
  },
  {
    q: "Как узнать статус моей заявки?",
    a: "После отправки заявки вы получите код отслеживания. Введите его на странице «Отследить заявку» — увидите актуальный статус работы.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 md:px-8 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-6xl font-bold tracking-tighter mb-4">ВОПРОСЫ</h2>
        <p className="text-neutral-500 mb-12">
          Собрали ответы на то, что спрашивают чаще всего. Не нашли свой вопрос — напишите нам.
        </p>

        <div className="border-t border-black">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-black">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                >
                  <span className="text-lg md:text-xl font-bold group-hover:text-red-600 transition-colors">
                    {item.q}
                  </span>
                  <Icon
                    name="Plus"
                    size={24}
                    className={`shrink-0 text-red-600 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}
                >
                  <p className="text-neutral-600 leading-relaxed pr-8">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
import Icon from "@/components/ui/icon";

interface Review {
  name: string;
  model: string;
  text: string;
  rating: number;
}

const REVIEWS: Review[] = [
  {
    name: "Алексей М.",
    model: "Vespa Primavera 150",
    rating: 5,
    text: "Привёз скутер после ДТП — был уверен, что это приговор. Михаил восстановил геометрию и покрасил так, что не отличить от нового. Спасибо за честность и руки!",
  },
  {
    name: "Дмитрий К.",
    model: "Vespa GTS 300",
    rating: 5,
    text: "Делал плановое ТО. Всё чётко: рассказали что меняем и почему, ничего лишнего не навязывали. Скутер поехал заметно бодрее. Рекомендую.",
  },
  {
    name: "Ольга С.",
    model: "Vespa Sprint 50",
    rating: 5,
    text: "Искала, кому доверить винтажную Vespa мужа. Реставрация заняла месяц, но результат — выше всех ожиданий. Теперь это семейная реликвия на ходу.",
  },
  {
    name: "Игорь В.",
    model: "Vespa LX 125",
    rating: 5,
    text: "Заказывал редкую деталь — нигде не мог найти. Здесь привезли из Италии за две недели. Поставили, всё работает. Профессионалы своего дела.",
  },
  {
    name: "Марина Т.",
    model: "Vespa Primavera 125",
    rating: 5,
    text: "Хранила скутер зимой в мастерской. Весной забрала — завёлся с пол-оборота, чистенький, под чехлом стоял. Очень удобно, больше никаких гаражей.",
  },
  {
    name: "Сергей П.",
    model: "Vespa GTV 250",
    rating: 5,
    text: "Эвакуатор приехал быстро, аккуратно загрузили. Диагностику сделали при мне, всё объяснили. Цены честные. Буду обслуживаться только здесь.",
  },
];

export default function Reviews() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <section id="reviews" className="py-20 px-4 md:px-8 bg-black text-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h2 className="text-6xl font-bold tracking-tighter">ОТЗЫВЫ</h2>
          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Icon key={i} name="Star" size={22} className="text-red-600 fill-red-600" />
              ))}
            </div>
            <span className="text-2xl font-bold">{avg}</span>
            <span className="text-neutral-500">/ {REVIEWS.length} отзывов</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={i} className="border border-neutral-800 p-6 flex flex-col hover:border-neutral-600 transition-colors">
              <div className="flex mb-4">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Icon key={j} name="Star" size={16} className="text-red-600 fill-red-600" />
                ))}
              </div>
              <p className="text-neutral-300 leading-relaxed flex-1 mb-6">«{r.text}»</p>
              <div className="border-t border-neutral-800 pt-4">
                <p className="font-bold">{r.name}</p>
                <p className="text-sm text-neutral-500">{r.model}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

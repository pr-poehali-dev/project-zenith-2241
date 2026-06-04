import Icon from "@/components/ui/icon";

interface Review {
  name: string;
  text: string;
  rating: number;
}

const REVIEWS: Review[] = [
  {
    name: "Вадим Иванов",
    rating: 5,
    text: "Не просто мастерская, а место фанатиков, которые по-хорошему больны феноменом Vespa! Обслуживаю у ребят два своих байка уже четыре года, один из которых там же и купил. Делали весь спектр работ — кузовной ремонт, покраску, тюнинг, ТО. Оценка в 11 баллов по 10-балльной шкале!!!",
  },
  {
    name: "Пользователь",
    rating: 5,
    text: "Лучший сервис для Vespa в Москве, да и в России! Все свои мотороллеры обслуживаю здесь с 2018 года. Сервис на высоком уровне, можно сделать ТО или полную реставрацию. Также можно заказать запчасти и аксессуары для Vespa из зарубежных магазинов для самостоятельной установки.",
  },
  {
    name: "Mikhail P.",
    rating: 5,
    text: "Отличная мастерская! Ребята полностью отреставрировали мопед, с полным разбором, отлично покрасили, собрали, он как новый! Однозначно рекомендую! Настоящие фанаты итальянской классики и не только!",
  },
  {
    name: "Vladislav Korneychyk",
    rating: 5,
    text: "Великолепный и дружелюбный профессиональный сервис! После поломки забрали мою Веспу на эвакуаторе, быстро и качественно провели ремонт, сделали полное ТО, заменили резину — теперь мой «конь» на полном ходу. Резина отлично держит дорогу, мотор приятно рычит, тормоза надёжно тормозят, всё работает как часы! Спасибо Михаилу, Игорю и Александру за работу!",
  },
  {
    name: "Алексей Каплин",
    rating: 5,
    text: "В сложившихся условиях ребята единственные, кто чётко, в срок, по вменяемой стоимости возят запчасти на веспы и лмл. Пользуюсь их помощью давно и благодаря им мой мопед до сих пор в строю.",
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
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-neutral-500 mt-8">Отзывы взяты из Яндекс Карт.</p>
      </div>
    </section>
  );
}
import Icon from "@/components/ui/icon";

interface PriceItem {
  name: string;
  price: string;
  note?: string;
}

interface PriceGroup {
  title: string;
  icon: string;
  items: PriceItem[];
}

const GROUPS: PriceGroup[] = [
  {
    title: "Обслуживание",
    icon: "Wrench",
    items: [
      { name: "Диагностика", price: "от 1 500 ₽" },
      { name: "Замена масла", price: "от 1 200 ₽", note: "без стоимости масла" },
      { name: "Плановое ТО", price: "от 4 500 ₽" },
      { name: "Регулировка клапанов", price: "от 2 500 ₽" },
      { name: "Чистка карбюратора", price: "от 3 000 ₽" },
    ],
  },
  {
    title: "Ремонт",
    icon: "Hammer",
    items: [
      { name: "Ремонт двигателя", price: "от 12 000 ₽" },
      { name: "Замена ремня вариатора", price: "от 2 800 ₽" },
      { name: "Ремонт тормозной системы", price: "от 3 500 ₽" },
      { name: "Замена сцепления", price: "от 5 000 ₽" },
      { name: "Восстановление после ДТП", price: "от 18 000 ₽" },
    ],
  },
  {
    title: "Кузов и покраска",
    icon: "Brush",
    items: [
      { name: "Покраска одного элемента", price: "от 6 000 ₽" },
      { name: "Полная покраска", price: "от 45 000 ₽" },
      { name: "Восстановление геометрии", price: "от 8 000 ₽" },
      { name: "Полировка", price: "от 4 000 ₽" },
    ],
  },
  {
    title: "Дополнительно",
    icon: "Truck",
    items: [
      { name: "Эвакуатор по Москве", price: "от 3 000 ₽" },
      { name: "Сезонное хранение", price: "от 2 500 ₽/мес" },
      { name: "Реставрация под ключ", price: "от 35 000 ₽" },
      { name: "Заказ деталей из-за рубежа", price: "индивидуально" },
    ],
  },
];

export default function PriceList() {
  return (
    <section id="prices" className="py-20 px-4 md:px-8 bg-neutral-50">
      <div className="container mx-auto">
        <h2 className="text-6xl font-bold tracking-tighter mb-4">ЦЕНЫ</h2>
        <p className="text-neutral-500 mb-12 max-w-2xl">
          Базовые расценки на популярные работы. Окончательная стоимость зависит от модели и состояния техники.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GROUPS.map(group => (
            <div key={group.title} className="bg-white border border-black">
              <div className="flex items-center gap-3 p-5 border-b border-black bg-black text-white">
                <Icon name={group.icon} size={20} className="text-red-500" />
                <h3 className="text-lg font-bold">{group.title}</h3>
              </div>
              <div className="divide-y divide-neutral-200">
                {group.items.map(item => (
                  <div key={item.name} className="flex justify-between items-baseline gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.note && <p className="text-xs text-neutral-400">{item.note}</p>}
                    </div>
                    <p className="font-bold text-red-600 whitespace-nowrap">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-neutral-400 mt-6 text-center">
          * Цены указаны без стоимости запчастей. Точный расчёт — после диагностики.
        </p>
      </div>
    </section>
  );
}

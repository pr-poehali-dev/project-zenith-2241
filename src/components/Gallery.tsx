import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Work {
  title: string;
  desc: string;
  category: string;
  img: string;
}

const IMAGES = [
  "https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/4733d06f-4eb4-4340-8299-f376a32ad176.jpg",
  "https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/c8481cda-06af-4af8-b859-021ce38b2271.jpg",
  "https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/94b89e6e-79a4-4ee7-8b39-ae8d8ea45ae8.jpg",
  "https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/96b417a4-914c-4d15-ab71-c60f17b819bc.jpg",
];

const WORKS: Work[] = [
  { title: "Реставрация Vespa Primavera", desc: "Полное восстановление двигателя и кузова — из убитого состояния в музейный вид", category: "Реставрация", img: IMAGES[0] },
  { title: "Капитальное ТО GTS 300", desc: "Разобрали до винтика, почистили, отрегулировали — как после завода", category: "ТО", img: IMAGES[1] },
  { title: "Зимнее хранение", desc: "Консервация и бережное хранение классики в межсезонье", category: "Хранение", img: IMAGES[2] },
  { title: "Восстановление LX 125", desc: "Вернули к жизни винтажный мотороллер после долгого простоя", category: "Реставрация", img: IMAGES[3] },
  { title: "Покраска после ДТП", desc: "Восстановление геометрии и покраска пластиковых элементов", category: "ДТП", img: IMAGES[0] },
  { title: "Ремонт двигателя Sprint", desc: "Капитальный ремонт силового агрегата с заменой расходников", category: "Ремонт", img: IMAGES[1] },
];

const CATEGORIES = ["Все", "Реставрация", "ТО", "Ремонт", "ДТП", "Хранение"];

export default function Gallery() {
  const [filter, setFilter] = useState("Все");
  const [lightbox, setLightbox] = useState<Work | null>(null);

  const filtered = filter === "Все" ? WORKS : WORKS.filter(w => w.category === filter);

  return (
    <section id="gallery" className="py-20 px-4 md:px-8 bg-white">
      <div className="container mx-auto">
        <h2 className="text-6xl font-bold tracking-tighter mb-8">ГАЛЕРЕЯ</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 text-sm uppercase tracking-widest border transition-colors ${
                filter === cat ? "bg-black text-white border-black" : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w, i) => (
            <button
              key={i}
              onClick={() => setLightbox(w)}
              className="group text-left"
            >
              <div className="aspect-square bg-neutral-100 mb-4 overflow-hidden relative">
                <img src={w.img} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Icon name="ZoomIn" size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs uppercase tracking-widest px-2 py-1">
                  {w.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">{w.title}</h3>
              <p className="text-neutral-500">{w.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors">
            <Icon name="X" size={32} />
          </button>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.img} alt={lightbox.title} className="w-full max-h-[70vh] object-contain mb-4" />
            <div className="text-center text-white">
              <span className="inline-block bg-red-600 text-xs uppercase tracking-widest px-2 py-1 mb-2">{lightbox.category}</span>
              <h3 className="text-2xl font-bold">{lightbox.title}</h3>
              <p className="text-neutral-400 mt-1">{lightbox.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useState } from "react";

export default function Index() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://functions.poehali.dev/489bf1a9-6c48-4e0c-9814-f0b382a5cf65", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName(""); setPhone(""); setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-black">
        <div className="container mx-auto px-4 md:px-8 py-2 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/930e51b0-10f5-4881-8103-5c3605ce11a3.png"
              alt="Only Vespa Moscow"
              className="h-12 w-auto"
            />
          </a>
          <div className="flex space-x-8">
            <a href="#services" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
              Услуги
            </a>
            <a href="#work" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
              Работы
            </a>
            <a href="#about" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
              История
            </a>
            <a href="#contact" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
              Контакты
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 container mx-auto">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7 mb-8 md:mb-0">
            <h1 className="text-8xl md:text-9xl font-bold tracking-tighter leading-none mb-6">
              ONLY
              <br />
              VESPA
            </h1>
            <p className="text-xl max-w-xl">
              Мастерская, которая начиналась с гаража и идеи. Сегодня — место, куда привозят Vespa и знают, что её вернут живой.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 flex items-center justify-center">
            <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
              <img
                src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/930e51b0-10f5-4881-8103-5c3605ce11a3.png"
                alt="Only Vespa Moscow"
                className="w-3/4 h-3/4 object-contain invert"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-600"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-6xl font-bold tracking-tighter mb-12">УСЛУГИ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black">
            {[
              { title: "Техническое обслуживание", desc: "Плановое техобслуживание и текущий ремонт" },
              { title: "Ремонт после ДТП", desc: "Восстановление геометрии, ремонт и покраска пластиковых и металлических элементов" },
              { title: "Мотоэвакуатор", desc: "Доставка мототехники по Москве и ближайшим областям" },
              { title: "Реставрация и восстановление", desc: "Реставрация и восстановление оригинального состояния классических мотороллеров" },
              { title: "Детали в наличии и на заказ", desc: "Основные расходники в наличии, широкий перечень деталей на заказ с доставкой из-за рубежа" },
              { title: "Сезонное хранение", desc: "Бережно храним технику в межсезонье в тёплом помещении под чехлом" },
            ].map((s, i) => (
              <div key={i} className="border-b border-r border-black p-8 hover:bg-black hover:text-white transition-colors group">
                <div className="text-red-600 text-4xl font-bold mb-4 group-hover:text-red-500">0{i + 1}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-neutral-500 group-hover:text-neutral-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 px-4 md:px-8 bg-black text-white">
        <div className="container mx-auto">
          <h2 className="text-6xl font-bold tracking-tighter mb-12">РАБОТЫ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <div className="aspect-square bg-white mb-4 overflow-hidden">
                <img
                  src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/files/b9bcc293-f85a-492b-aa5d-148a8bfbbb1e.jpg"
                  alt="Реставрация Vespa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Реставрация Vespa 50S</h3>
              <p className="text-neutral-400">Полное восстановление двигателя и кузова — из убитого состояния в музейный вид</p>
            </div>
            <div className="group">
              <div className="aspect-square bg-white mb-4 overflow-hidden">
                <img
                  src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/55fb4932-33b0-41db-96fe-9707391b4143.jpg"
                  alt="Кузовные работы"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Кузовные работы</h3>
              <p className="text-neutral-400">Покраска, рихтовка, замена панелей — возвращаем первозданный вид</p>
            </div>
            <div className="group">
              <div className="aspect-square bg-white mb-4 overflow-hidden">
                <img
                  src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/files/5f182216-b805-4826-922e-8e0238202153.jpg"
                  alt="Кастомные проекты"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Кастомные проекты</h3>
              <p className="text-neutral-400">Нестандартные решения — цвет, детали, характер. Под запрос клиента</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <h2 className="text-6xl font-bold tracking-tighter mb-8">ИСТОРИЯ</h2>
              <div className="aspect-[4/5] bg-neutral-100 relative mb-8 md:mb-0 overflow-hidden">
                <img
                  src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/96b417a4-914c-4d15-ab71-c60f17b819bc.jpg"
                  alt="Михаил — основатель Only Vespa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-white pointer-events-none"></div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 md:pt-24">
              <p className="text-xl mb-6">
                Михаил начинал с малого — чинил свою Vespa в гараже, потом помогал друзьям. Без вывески, без рекламы. Только руки, инструмент и честность.
              </p>
              <p className="mb-6">
                Слово расходилось само. Сначала знакомые знакомых, потом незнакомые люди из другого конца города. Каждый мопед, который выезжал из гаража, становился лучшей рекламой.
              </p>
              <p className="mb-6">
                Сегодня Only Vespa — это настоящая мастерская в Москве. Сюда приходят клиенты, которые ценят честный ремонт. И мастера, которые хотят работать там, где уважают ремесло.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-12">
                <div>
                  <h3 className="text-sm uppercase tracking-widest mb-2">Принципы</h3>
                  <ul className="space-y-2">
                    <li>Честная диагностика</li>
                    <li>Только оригинальные детали</li>
                    <li>Уважение к машине</li>
                    <li>Работа на совесть</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest mb-2">Услуги</h3>
                  <ul className="space-y-2">
                    <li>Ремонт и ТО</li>
                    <li>Реставрация</li>
                    <li>Кастомизация</li>
                    <li>Хранение</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 md:px-8 bg-black text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-6xl font-bold tracking-tighter mb-8">КОНТАКТЫ</h2>
              <p className="text-xl mb-8">Записаться на ремонт или приехать познакомиться — добро пожаловать.</p>
              <div className="space-y-4">
                <p className="flex items-center">
                  <span className="w-28 text-sm uppercase tracking-widest text-neutral-400">Телефон</span>
                  <a href="tel:+79175527125" className="hover:text-red-600 transition-colors">
                    +7 (917) 552-71-25
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="w-28 text-sm uppercase tracking-widest text-neutral-400">Telegram</span>
                  <a href="https://t.me/shalyap" target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors">
                    @shalyap
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="w-28 text-sm uppercase tracking-widest text-neutral-400">Город</span>
                  <span>Москва</span>
                </p>
              </div>
              <div className="mt-12">
                <img
                  src="https://cdn.poehali.dev/projects/3c873831-aefa-41ea-a721-61970b3851b2/bucket/930e51b0-10f5-4881-8103-5c3605ce11a3.png"
                  alt="Only Vespa Moscow"
                  className="h-24 w-auto invert"
                />
              </div>
            </div>
            <div>
              {status === "success" ? (
                <div className="flex flex-col items-start justify-center h-full space-y-4">
                  <p className="text-4xl font-bold tracking-tighter">Заявка отправлена!</p>
                  <p className="text-neutral-400">Михаил свяжется с тобой в ближайшее время.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 px-8 py-3 border border-white text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    Отправить ещё
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm uppercase tracking-widest mb-2">Имя</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white py-2 px-0 focus:outline-none focus:border-red-600 placeholder-white/30 transition-colors"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm uppercase tracking-widest mb-2">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white py-2 px-0 focus:outline-none focus:border-red-600 placeholder-white/30 transition-colors"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm uppercase tracking-widest mb-2">Сообщение</label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white py-2 px-0 focus:outline-none focus:border-red-600 placeholder-white/30 transition-colors"
                      placeholder="Расскажите о вашей Vespa"
                    ></textarea>
                  </div>
                  {status === "error" && (
                    <p className="text-red-400 text-sm">Что-то пошло не так. Попробуйте ещё раз.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-8 px-8 py-3 bg-red-600 text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                  >
                    {status === "loading" ? "Отправляем..." : "Отправить"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-white border-t border-black">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">2025 Only Vespa Moscow. Все права защищены.</p>
          <div className="flex space-x-8">
            <a href="https://t.me/shalyap" target="_blank" rel="noreferrer" className="text-sm uppercase tracking-widest hover:text-red-600 transition-colors">
              Telegram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
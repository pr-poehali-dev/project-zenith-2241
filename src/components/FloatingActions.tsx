import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

export default function FloatingActions() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Contact menu */}
      <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <a href="tel:+79175527125" title="Позвонить"
          className="flex items-center gap-3 bg-white text-black border border-black pl-4 pr-3 py-2.5 shadow-lg hover:bg-black hover:text-white transition-colors group">
          <span className="text-sm uppercase tracking-widest">Позвонить</span>
          <Icon name="Phone" size={18} />
        </a>
        <a href="https://t.me/shalyap" target="_blank" rel="noreferrer" title="Telegram"
          className="flex items-center gap-3 bg-white text-black border border-black pl-4 pr-3 py-2.5 shadow-lg hover:bg-black hover:text-white transition-colors">
          <span className="text-sm uppercase tracking-widest">Telegram</span>
          <Icon name="Send" size={18} />
        </a>
        <a href="/track" title="Отследить заявку"
          className="flex items-center gap-3 bg-white text-black border border-black pl-4 pr-3 py-2.5 shadow-lg hover:bg-black hover:text-white transition-colors">
          <span className="text-sm uppercase tracking-widest">Моя заявка</span>
          <Icon name="PackageSearch" size={18} />
        </a>
      </div>

      <div className="flex flex-col items-end gap-3">
        {/* Scroll to top */}
        {show && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Наверх"
            className="w-12 h-12 bg-white text-black border border-black flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors"
          >
            <Icon name="ArrowUp" size={20} />
          </button>
        )}

        {/* Main toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          title="Связаться"
          className="w-14 h-14 bg-red-600 text-white flex items-center justify-center shadow-xl hover:bg-black transition-colors"
        >
          <Icon name={open ? "X" : "MessageCircle"} size={24} />
        </button>
      </div>
    </div>
  );
}

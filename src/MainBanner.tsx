import { Motto } from "./landing/Motto";
import "./main-landing.css";

export default function MainBanner() {
  return (
    <div className="arena-page main-landing">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col px-4 py-6 md:px-8 md:py-10">
        <section
          className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]"
          aria-label="PESAWI Ke-13"
        >
          <img
            src="/landing/hero-title.png"
            alt="Pesta Sukan Antara Wilayah (PESAWI) Ke-13, 2026"
            className="w-full max-w-[42rem] object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            draggable={false}
          />
          <Motto />
        </section>

        <footer className="mt-auto border-t border-[rgba(226,184,74,0.15)] pt-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-4">
            <img
              src="/landing/logo-ysg.png"
              alt="Yayasan Sabah"
              className="h-10 w-10 rounded-full object-cover"
            />
            <img
              src="/landing/logo-pesawi.png"
              alt="PESAWI 2026"
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="font-display text-lg tracking-wide">
            Pesta Sukan Antara Wilayah · Ke-13, 2026
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            © 2026 Yayasan Sabah. Bersaing Dengan Semangat, Bersahabat Dengan Hormat.
          </p>
        </footer>
      </div>
    </div>
  );
}

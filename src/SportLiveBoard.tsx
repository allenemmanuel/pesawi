import type { ReactNode } from "react";
import type { Sport } from "./data";
import "./main-landing.css";

export const SPORT_BOARD_TITLE: Record<Sport, string> = {
  Futsal: "FUTSAL",
  Pentanque: "PENTANQUE",
  Karom: "KAROM",
  "Ping Pong": "PING PONG",
  Pickleball: "PICKLEBALL",
  Badminton: "BADMINTON",
  "Sepak Takraw": "SEPAK TAKRAW",
  Dart: "DART",
  "Bola Tampar": "BOLA TAMPAR",
};

export const SPORT_BOARD_MASCOT: Record<Sport, string> = {
  Futsal: "/landing/mascot-futsal.png",
  Pentanque: "/landing/mascot-pentanque.png",
  Karom: "/landing/mascot-karom.png",
  "Ping Pong": "/landing/mascot-pingpong.png",
  Pickleball: "/landing/mascot-pickleball.png",
  Badminton: "/landing/mascot-badminton.png",
  "Sepak Takraw": "/landing/mascot-takraw.png",
  Dart: "/landing/mascot-dart.png",
  "Bola Tampar": "/landing/mascot-bolatampar.png",
};

export const SPORT_SCORER_HASH: Record<Sport, string> = {
  Futsal: "/scorer/futsal",
  Pentanque: "/scorer/pentanque",
  Karom: "/scorer/karom",
  "Ping Pong": "/scorer/pingpong",
  Pickleball: "/scorer/pickleball",
  Badminton: "/scorer/badminton",
  "Sepak Takraw": "/scorer/takraw",
  Dart: "/scorer/dart",
  "Bola Tampar": "/scorer/bolatampar",
};

type Props = {
  sport: Sport;
  children: ReactNode;
};

/** Main-2 board shell: PESAWI title, sport wordmark + mascots, then table content. */
export default function SportLiveBoard({ sport, children }: Props) {
  const title = SPORT_BOARD_TITLE[sport];
  const mascotSrc = SPORT_BOARD_MASCOT[sport];

  return (
    <div className="arena-page main-landing w-full min-w-0 overflow-x-hidden">
      <div className="mx-auto flex min-h-full w-full min-w-0 max-w-5xl flex-col px-4 py-6 md:px-8 md:py-10">
        <section
          className="mb-2 flex w-full min-w-0 flex-col items-center gap-3 pt-1 text-center sm:mb-8 sm:gap-2"
          aria-label={`${title} — PESAWI Ke-13`}
        >
          <img
            src="/landing/hero-title.png"
            alt="Pesta Sukan Antara Wilayah (PESAWI) Ke-13, 2026"
            className="mb-0 h-auto w-[12.6rem] max-w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:mb-[-15px]"
            draggable={false}
          />
          <div className="flex w-full min-w-0 max-w-full items-center justify-center gap-2 sm:gap-4">
            <img
              src={mascotSrc}
              alt=""
              className="relative top-[-10px] h-auto w-[22vw] max-w-[8.25rem] shrink object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:w-[8.25rem] sm:max-w-none md:w-[10.5rem]"
              draggable={false}
            />
            <h1 className="sport-live-title shrink">{title}</h1>
            <img
              src={mascotSrc}
              alt=""
              className="relative top-[-10px] h-auto w-[22vw] max-w-[8.25rem] shrink -scale-x-100 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:w-[8.25rem] sm:max-w-none md:w-[10.5rem]"
              draggable={false}
            />
          </div>
        </section>

        <div className="relative -top-[12px] mt-2 w-full min-w-0 md:-top-[50px] md:mt-[20px]">
          {children}
        </div>
      </div>
    </div>
  );
}

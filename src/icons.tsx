import type { JSX, SVGProps } from "react";
import type { Sport } from "./data";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function FutsalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 3.8 14.6 9l5.6.4-4.4 3.7 1.5 5.4L12 15.8 6.7 18.5l1.5-5.4L3.8 9.4 9.4 9z" />
    </svg>
  );
}

export function PentanqueIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="13" r="5.2" />
      <circle cx="16" cy="10" r="3.4" />
      <path d="M7 8.5c1.4-2 3.4-3.2 6-3.2" />
    </svg>
  );
}

export function KaromIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="2.2" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function PingPongIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 19 11 8.5" />
      <path d="M11 8.5c2.8-3.4 8-2.6 9.2 1.5 1 3.4-1.6 6.4-5 6.4-1.8 0-3.3-.8-4.2-2" />
      <circle cx="6.2" cy="19.2" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PickleballIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="10.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="10.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="14.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="14.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BadmintonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21v-6.5" />
      <path d="M8.2 4.8 12 14.5 15.8 4.8" />
      <path d="M7 8.2h10" />
      <path d="M8.6 11.2h6.8" />
    </svg>
  );
}

export function SepakTakrawIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M7 8.5c1.6 1.2 3.4 1.8 5 1.8s3.4-.6 5-1.8" />
      <path d="M7 15.5c1.6-1.2 3.4-1.8 5-1.8s3.4.6 5 1.8" />
      <path d="M12 3.8v16.4" />
    </svg>
  );
}

export function DartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3.8v2.4M12 17.8v2.4M3.8 12h2.4M17.8 12h2.4" />
    </svg>
  );
}

export function BolaTamparIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.2 4.6c2.4 2.2 3.8 5.4 3.8 9.2 0 1.8-.3 3.4-.8 4.8" />
      <path d="M15.8 4.6C13.4 6.8 12 10 12 13.8c0 1.8.3 3.4.8 4.8" />
      <path d="M4.4 13.5c2.4-.6 4.8-.8 7.6-.8 2.8 0 5.2.2 7.6.8" />
    </svg>
  );
}

export function FoxIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.6 })}>
      <path d="M4.5 10.5 8 5.5 12 8.5 16 5.5 19.5 10.5 16.5 18H7.5z" />
      <circle cx="9.2" cy="12.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12.2" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.2 15.2h3.6" />
    </svg>
  );
}

export function HawkIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.6 })}>
      <path d="M4 14c3.5-1 6-4.2 7.2-7.6C13.6 9.8 16.8 12 20 13.2c-2.4.6-4.2 1-5.2 3.8-1.6-1.4-3.4-2.2-6.2-2.2-1.8 0-3.4.4-4.6 1.2z" />
      <path d="M12.4 6.6 14 4.8" />
    </svg>
  );
}

export function MainIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" />
      <path d="M3.5 9.5h17" />
      <circle cx="7" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MedalTableIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 19V11h4.5v8M9.5 19V6h5v13M14.5 19v-5H19v5" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15.2 4.4A8.2 8.2 0 1 0 20 14.6 6.4 6.4 0 0 1 15.2 4.4z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v1.8M12 18.7v1.8M4.6 12H2.8M21.2 12h-1.8M6.1 6.1l1.3 1.3M16.6 16.6l1.3 1.3M6.1 17.9l1.3-1.3M16.6 7.4l1.3-1.3" />
    </svg>
  );
}

const SPORT_ICONS: Record<Sport, (props: IconProps) => JSX.Element> = {
  Futsal: FutsalIcon,
  Pentanque: PentanqueIcon,
  Karom: KaromIcon,
  "Ping Pong": PingPongIcon,
  Pickleball: PickleballIcon,
  Badminton: BadmintonIcon,
  "Sepak Takraw": SepakTakrawIcon,
  Dart: DartIcon,
  "Bola Tampar": BolaTamparIcon,
};

export function SportIcon({ sport, ...props }: IconProps & { sport: Sport }) {
  const Icon = SPORT_ICONS[sport];
  return <Icon {...props} />;
}

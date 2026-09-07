export function Motto({ className = "" }: { className?: string }) {
  return (
    <p
      className={`ml-motto ${className}`}
      lang="ms"
      aria-label="Bersaing Dengan Semangat, Bersahabat Dengan Hormat"
    >
      <span className="ml-motto-line">
        <span className="ml-motto-word ml-w-red">Bersaing</span>{" "}
        <span className="ml-motto-word ml-w-orange">Dengan</span>{" "}
        <span className="ml-motto-word ml-w-blue">Semangat,</span>
      </span>
      <span className="ml-motto-line">
        <span className="ml-motto-word ml-w-green">Bersahabat</span>{" "}
        <span className="ml-motto-word ml-w-purple">Dengan</span>{" "}
        <span className="ml-motto-word ml-w-navy">Hormat</span>
      </span>
    </p>
  );
}

/**
 * ColorPallete 기반 고정 배경 광원 레이어
 * (Diplomatic, Bleached Cedar, Bay Wharf, Hearth) — 마우스 반응 없음
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(at_15%_15%,rgba(55,67,95,0.55)_0px,transparent_55%),radial-gradient(at_85%_20%,rgba(43,32,52,0.9)_0px,transparent_55%),radial-gradient(at_80%_85%,rgba(116,131,138,0.3)_0px,transparent_55%),radial-gradient(at_20%_80%,rgba(225,202,166,0.14)_0px,transparent_55%)]"
    >
      <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-diplomatic/60 blur-3xl sm:top-12 sm:left-1/4" />
      <div className="absolute -right-12 -bottom-20 h-80 w-80 rounded-full bg-hearth/20 blur-3xl sm:right-1/4 sm:bottom-12" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-3xl bg-cedar/80 blur-2xl" />
      <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-wharf/30 blur-3xl" />
    </div>
  );
}

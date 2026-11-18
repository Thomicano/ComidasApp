// Un solo trazo (1.75) para todo el set.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const Plus = () => <svg {...base}><path d="M12 5v14M5 12h14" /></svg>;
export const Minus = () => <svg {...base}><path d="M5 12h14" /></svg>;
export const Search = () => <svg {...base}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
export const Close = () => <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Check = () => <svg {...base}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const ArrowRight = () => <svg {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const ArrowLeft = () => <svg {...base}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const Grip = () => <svg {...base}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>;

"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/cart";
import { cutout } from "@/lib/cutout";
import { demoStatus } from "@/lib/demo-menu";
import type { Product } from "@/lib/types";
import { Plus } from "../icons";
import type { TemplateProps } from "./templates";

// Dirección: un drop de zapatillas aplicado a burgers. Papel hueso con grano, grotesca expandida
// gigante como fondo, fotos impresas sobre el papel (multiply: un fondo claro desaparece y queda el recorte),
// y el color de marca solo en precio y botón.

const wide = "font-wide font-black uppercase [font-stretch:125%]";

/** Foto recortada (fondo claro → transparente) con sombra que sigue la silueta; si no se puede recortar, va como foto. */
function Cutout({ src, className }: { src: string; className: string }) {
  const [out, setOut] = useState<string>();
  useEffect(() => {
    let alive = true;
    cutout(src).then((u) => alive && setOut(u));
    return () => {
      alive = false;
    };
  }, [src]);
  const cut = out?.startsWith("data:image/png");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={out ?? src}
      alt=""
      className={`aspect-square w-full transition-opacity duration-300 ${out ? "opacity-100" : "opacity-0"} ${
        cut ? "object-contain [filter:drop-shadow(0_24px_22px_rgb(28_27_24/0.22))]" : "object-cover"
      } ${className}`}
    />
  );
}
const spring = { type: "spring", stiffness: 140, damping: 18 } as const;

/** Tamaño para que una palabra en la grotesca expandida ocupe ~el ancho de la tienda (k = avance medio por letra). */
const fit = (text: string, k: number, cap: number) => `${Math.min(cap, 100 / (Math.max(text.length, 1) * k))}cqw`;

function Magnetic({ product: p, count, onAdd, size = "md" }: { product: Product; count: number; onAdd: (p: Product) => void; size?: "md" | "lg" }) {
  const reduce = useReducedMotion();
  const zone = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 15, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 15, mass: 0.6 });
  // El ícono se mueve un poco más que el botón: da profundidad al tirón.
  const ix = useTransform(x, (v) => v * 0.45);
  const iy = useTransform(y, (v) => v * 0.45);
  const reset = () => (x.set(0), y.set(0));

  return (
    // La zona de atracción es más grande que el botón: lo "busca" antes del clic, con el mouse o con el dedo apoyado.
    <div
      ref={zone}
      className="-m-5 p-5"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = zone.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.32);
        y.set((e.clientY - r.top - r.height / 2) * 0.32);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.button
        type="button"
        aria-label={`Agregar ${p.name}${count ? `, ${count} en el pedido` : ""}`}
        onClick={() => onAdd(p)}
        style={{ x, y }}
        whileTap={{ scale: 0.9 }}
        className={`grid place-items-center rounded-full bg-brand text-on-brand shadow-[0_10px_24px_-10px_var(--theme-primary)] ${size === "lg" ? "size-16" : "size-14"}`}
      >
        <motion.span style={{ x: ix, y: iy }} className="grid place-items-center text-[15px] font-bold tabular-nums">
          {count || <Plus />}
        </motion.span>
      </motion.button>
    </div>
  );
}

/** Sello que gira despacio alrededor de la foto del drop. */
function Seal({ text }: { text: string }) {
  const label = `${text} • ${text} • `.toUpperCase();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      className="size-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 18, ease: "linear", repeat: Infinity }}
    >
      <defs>
        <path id="seal" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="50" cy="50" r="49" className="fill-ink" />
      <text className="fill-bone font-wide text-[9.2px] font-bold tracking-[0.12em]">
        <textPath href="#seal">{label}</textPath>
      </text>
    </motion.svg>
  );
}

function Drop({ product: p, count, onOpen, onAdd, name, embedded }: { product: Product; count: number; onOpen: (p: Product) => void; onAdd: (p: Product) => void; name: string; embedded: boolean }) {
  const Title = embedded ? "p" : "h1";
  const words = name.trim().toUpperCase().split(/\s+/).filter(Boolean);
  return (
    <header className="relative flex min-h-[100cqh] flex-col overflow-x-clip pb-10 pt-16">
      <p className="absolute left-5 top-5 flex items-center gap-2 text-[13px] font-semibold">
        <span className={`size-1.5 rounded-full ${demoStatus.open ? "bg-emerald-600" : "bg-muted"}`} />
        {demoStatus.label} · {demoStatus.detail}
      </p>

      <Title aria-label={name} className={`${wide} relative z-0 px-4 leading-[0.8] tracking-[-0.03em]`}>
        {words.map((w, i) => (
          // Cada palabra sube desde atrás de su propia línea: el corte la revela.
          <span key={i} aria-hidden className={`block overflow-hidden pb-[0.04em] ${i % 2 ? "text-right" : ""}`}>
            <motion.span
              className="inline-block"
              // El nombre del local se lee entero (a diferencia de las palabras de fondo, que se recortan).
              style={{ fontSize: fit(w, 0.98, 30) }}
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: { ...spring, delay: 0.08 * i } }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </Title>

      <div className="relative z-10 -mt-[9cqw] px-2">
        <motion.button
          type="button"
          aria-label={`Ver ${p.name}`}
          onClick={() => onOpen(p)}
          className="mx-auto block w-[84cqw] max-w-[440px]"
          initial={{ y: -40, rotate: -16, opacity: 0 }}
          animate={{ y: 0, rotate: -7, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 12, delay: 0.25 } }}
          whileTap={{ scale: 0.98 }}
        >
          <Cutout src={p.image!} className="" />
        </motion.button>
        {p.badge && (
          <div className="absolute right-4 top-[6cqw] size-[24cqw] max-w-28">
            <Seal text={p.badge} />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto flex items-end gap-4 px-5">
        <div className="min-w-0 flex-1">
          <h2 className={`${wide} text-[clamp(26px,8.6cqw,44px)] leading-[0.9] tracking-[-0.02em]`}>{p.name}</h2>
          <p className="mt-2 max-w-[30ch] text-[14px] leading-5 text-ink/70">{p.description}</p>
          <p className={`${wide} mt-3 text-[20px] text-brand tabular-nums`}>{money(p.price)}</p>
        </div>
        <Magnetic product={p} count={count} onAdd={onAdd} size="lg" />
      </div>
    </header>
  );
}

// Zig-zag de revista: izquierda, derecha, centro. Cada posición rompe la grilla a su manera.
const layouts = [
  { img: "w-[80cqw] -ml-[6cqw] -rotate-6", text: "mr-12 pl-5", row: "" },
  { img: "w-[72cqw] ml-auto -mr-[8cqw] rotate-[7deg]", text: "ml-12 pr-5 text-right", row: "flex-row-reverse" },
  { img: "w-[64cqw] mx-auto -rotate-2", text: "mx-auto max-w-[34ch] px-5 text-center", row: "justify-center" },
];

export function HypeDropTemplate({ store, embedded, scroller, categories, qty, onOpen, onAdd }: TemplateProps) {
  const all = categories.flatMap((c) => c.products);
  const drop = all.find((p) => p.badge === "Edición limitada" && p.image) ?? all.find((p) => p.featured && p.image);

  return (
    <div className="relative bg-bone pb-32 text-ink">
      {/* Grano por encima de todo (fotos incluidas): unifica foto y papel como una impresión. */}
      <div aria-hidden className="grain pointer-events-none sticky top-0 z-40 -mb-[100cqh] h-[100cqh]" />

      {drop && <Drop product={drop} count={qty[drop.id] ?? 0} onOpen={onOpen} onAdd={onAdd} name={store.name || "Tu local"} embedded={embedded} />}

      {categories.map((c) => (
        // overflow-x-clip recorta la palabra gigante sin romper el sticky (hidden lo rompería).
        <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`} className="relative overflow-x-clip pt-10">
          <h2 id={`h-${c.id}`} className="sr-only">{c.name}</h2>
          <div aria-hidden className="pointer-events-none sticky top-0 z-0 h-0">
            <p
              className={`${wide} whitespace-nowrap px-2 pt-3 leading-[0.8] tracking-[-0.04em] text-ink/[0.08]`}
              style={{ fontSize: fit(c.name, 0.7, 40) }}
            >
              {c.name}
            </p>
          </div>

          <ul className="relative z-10 grid gap-y-28 pt-[22cqw]">
            {c.products.map((p, i) => {
              const l = layouts[i % 3];
              const count = qty[p.id] ?? 0;
              return (
                <motion.li
                  key={p.id}
                  initial={{ y: 48, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, root: scroller, amount: 0.25 }}
                  transition={spring}
                >
                  {p.image && (
                    <button type="button" aria-label={`Ver ${p.name}`} onClick={() => onOpen(p)} className={`block ${l.img}`}>
                      <Cutout src={p.image} className="" />
                    </button>
                  )}
                  {/* Sin solapar el texto con la foto: sobre una foto oscura (sin recorte) el nombre negro se perdería. */}
                  <div className={`relative ${p.image ? "mt-3" : ""} ${l.text}`}>
                    <h3 className={`${wide} text-[clamp(24px,7.4cqw,40px)] leading-[0.92] tracking-[-0.02em]`}>{p.name}</h3>
                    <p className="mt-2 text-[14px] leading-5 text-ink/70">
                      {p.description}
                      {p.badge && p.badge !== "Edición limitada" && <span className="font-semibold text-ink"> · {p.badge}</span>}
                    </p>
                    <div className={`mt-3 flex items-center gap-5 ${l.row}`}>
                      <span className={`${wide} text-[19px] text-brand tabular-nums`}>{money(p.price)}</span>
                      <Magnetic product={p} count={count} onAdd={onAdd} />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

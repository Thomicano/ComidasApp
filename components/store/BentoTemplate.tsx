"use client";

import { motion } from "motion/react";
import { money } from "@/lib/cart";
import type { Product } from "@/lib/types";
import type { TemplateProps } from "./templates";

// Un solo ritmo: 12px de separación entre bloques y contra los bordes.
// Radios anidados: bloque 24 (rounded-3xl) − separación 8 = panel 16 (rounded-2xl).
const press = {
  whileTap: { scale: 0.96 },
  whileHover: { scale: 0.98 },
  transition: { type: "spring", stiffness: 520, damping: 30 },
} as const;

function Tile({ product: p, count, onOpen, wide = false, className }: { product: Product; count: number; onOpen: (p: Product) => void; wide?: boolean; className: string }) {
  return (
    <motion.button
      type="button"
      {...press}
      onClick={() => onOpen(p)}
      aria-label={`Ver ${p.name}, ${money(p.price)}${count ? `, ${count} en el pedido` : ""}`}
      className={`relative block overflow-hidden rounded-3xl bg-well text-left ${className}`}
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={wide ? p.image.replace("w=480&h=480", "w=900&h=900") : p.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 grid place-items-center pb-12 font-serif text-6xl text-muted">
          {p.name[0]}
        </span>
      )}
      {count > 0 && (
        <span className="absolute right-2 top-2 grid h-7 min-w-7 place-items-center rounded-full bg-brand px-2 text-[13px] font-bold text-on-brand tabular-nums">
          {count}
        </span>
      )}
      {wide && p.badge && (
        <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
          {p.badge}
        </span>
      )}
      <span className={`absolute inset-x-2 bottom-2 flex rounded-2xl bg-black/40 px-3 py-2 text-white ring-1 ring-white/15 backdrop-blur-md ${wide ? "items-end gap-3" : "flex-col"}`}>
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-semibold ${wide ? "text-[17px] leading-6" : "text-[14px] leading-5"}`}>{p.name}</span>
          {wide && <span className="block truncate text-[13px] leading-[18px] text-white/80">{p.description}</span>}
        </span>
        <span className={`tabular-nums ${wide ? "text-[15px] font-semibold leading-6" : "text-[13px] leading-[18px] text-white/85"}`}>{money(p.price)}</span>
      </span>
    </motion.button>
  );
}

export function BentoTemplate({ categories, qty, showFeatured, onOpen }: TemplateProps) {
  // Mosaico superior: estrella 2×2, dos 1×1 y un 2×1.
  const featured = categories.flatMap((c) => c.products).filter((p) => p.featured && p.image).slice(0, 4);
  return (
    <>
      {showFeatured && featured.length > 0 && (
        // Alto de fila = ancho de columna, así los 1×1 son cuadrados exactos y el 2×2 encastra.
        <section aria-label="Destacados" className="grid grid-cols-2 gap-3 px-3 pt-3 [grid-auto-rows:calc((100cqw-2.25rem)/2)]">
          {featured.map((p, i) => (
            <Tile
              key={p.id}
              product={p}
              count={qty[p.id] ?? 0}
              onOpen={onOpen}
              wide={i === 0 || i === 3}
              className={i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : ""}
            />
          ))}
        </section>
      )}

      {categories.map((c) => (
        <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`}>
          <h2 id={`h-${c.id}`} className="px-4 pb-3 pt-7 text-[17px] font-bold tracking-tight">
            {c.name}
          </h2>
          <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3">
            {c.products.map((p) => (
              <li key={p.id} className="w-[44cqw] shrink-0 snap-start">
                <Tile product={p} count={qty[p.id] ?? 0} onOpen={onOpen} className="aspect-square w-full" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

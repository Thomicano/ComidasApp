"use client";

import { motion } from "motion/react";
import { money } from "@/lib/cart";
import { demoStatus } from "@/lib/demo-menu";
import { Plus } from "../icons";
import type { TemplateProps } from "./templates";

// Portada por defecto mientras el local no suba la suya.
const defaultCover = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1100&h=1900&q=70&auto=format&fit=crop";

// Contraste garantizado sin importar la foto. Peor caso, foto blanca pura:
// velo negro al 55% → texto blanco 4.7:1; dentro de la tarjeta (otro 35%) → blanco 8.7:1 y blanco/80 ≥ 5:1.

// Spring con fricción: amortiguación crítica, llega sin rebote.
const soft = { type: "spring", stiffness: 90, damping: 20 } as const;
const card = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ...soft, staggerChildren: 0.06, delayChildren: 0.12 } },
};
const row = { hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1, transition: soft } };

export function LuxeGlassTemplate({ store, embedded, scroller, categories, qty, onOpen, onAdd }: TemplateProps) {
  const Title = embedded ? "p" : "h1";
  return (
    <div className="relative text-white [&_:focus-visible]:outline-white">
      {/* "Fijo" respecto de la tienda, no del viewport: sticky de alto completo que no ocupa lugar.
          Va dentro de la plantilla para que el backdrop-blur de las tarjetas lo tenga detrás. */}
      <div aria-hidden className="sticky top-0 -mb-[100cqh] h-[100cqh] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={store.cover ?? defaultCover}
          alt=""
          className="size-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1, transition: { duration: 1.8, ease: [0.23, 1, 0.32, 1] } }}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative px-3 pb-28">
        <motion.header
          className="flex min-h-[56cqh] flex-col justify-end px-3 pb-8 pt-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { ...soft, delay: 0.15 } }}
        >
          <Title className="text-balance font-serif text-[clamp(48px,15cqw,84px)] leading-[0.95] tracking-[-0.01em]">
            {store.name || "Tu local"}
          </Title>
          <p className="mt-4 flex items-center gap-2 text-[13px]">
            <span className={`size-1.5 rounded-full ${demoStatus.open ? "bg-emerald-400" : "bg-white/60"}`} />
            {demoStatus.label} · {demoStatus.detail}
          </p>
        </motion.header>

        <div className="grid gap-3">
          {categories.map((c) => (
            <motion.section
              key={c.id}
              data-cat={c.id}
              aria-labelledby={`h-${c.id}`}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, root: scroller, amount: 0.12 }}
              className="rounded-3xl border border-white/15 bg-black/35 px-5 pb-2 pt-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_24px_50px_-24px_rgb(0_0_0/0.7)] backdrop-blur-xl"
            >
              <h2 id={`h-${c.id}`} className="border-b border-white/15 pb-4 font-serif text-[34px] leading-none">
                {c.name}
              </h2>
              <ul className="divide-y divide-white/10">
                {c.products.map((p) => {
                  const count = qty[p.id] ?? 0;
                  return (
                    <motion.li key={p.id} variants={row} className="relative flex items-center gap-4 py-3.5">
                      <button
                        type="button"
                        aria-label={`Ver ${p.name}, ${money(p.price)}`}
                        onClick={() => onOpen(p)}
                        className="absolute inset-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <h3 className="min-w-0 flex-1 font-serif text-[21px] leading-6">{p.name}</h3>
                          <span className="text-[14px] tabular-nums">{money(p.price)}</span>
                        </div>
                        <p className="mt-1 max-w-[36ch] text-[13px] font-light leading-[18px] text-white/80">
                          {p.description}
                          {p.badge && <span className="font-normal text-white"> · {p.badge}</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Agregar ${p.name}${count ? `, ${count} en el pedido` : ""}`}
                        onClick={() => onAdd(p)}
                        // Fantasma hasta el hover o el toque; lleno con el color de marca cuando ya está en el pedido.
                        className={`press relative z-10 grid size-9 shrink-0 place-items-center rounded-full border text-[13px] font-semibold tabular-nums before:absolute before:-inset-1 before:content-[''] ${
                          count
                            ? "border-white/35 bg-brand text-on-brand"
                            : "border-white/35 hover:border-white hover:bg-white hover:text-black active:border-white active:bg-white active:text-black"
                        }`}
                      >
                        {count || <Plus />}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}

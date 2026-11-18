"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { money } from "@/lib/cart";
import { demoStatus } from "@/lib/demo-menu";
import type { Category, Product, StoreConfig } from "@/lib/types";
import { useDialog } from "./Sheet";
import type { TemplateProps } from "./templates";

const ease = [0.23, 1, 0.32, 1] as const;
const large = (src: string) => src.replace("w=480&h=480", "w=1200&h=1500"); // no toca las portadas subidas (data URL)

// Los tamaños usan cqw/cqh: se miden contra la tienda (container en Storefront),
// así la plantilla escala igual a pantalla completa y dentro del teléfono del Studio.

function Hero({ store, embedded, scroller, image }: Pick<TemplateProps, "store" | "embedded" | "scroller"> & { image?: string }) {
  const k = useReducedMotion() ? 0 : 1;
  const { scrollY } = useScroll({ container: scroller });
  // La foto se queda atrás (30% del scroll) y el título se adelanta: dos planos.
  const imageY = useTransform(scrollY, [0, 1000], [0, 300 * k]);
  const textY = useTransform(scrollY, [0, 1000], [0, -220 * k]);
  const textOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const Title = embedded ? "p" : "h1";

  return (
    <header className="relative h-[100cqh] overflow-hidden bg-ink text-paper">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img src={large(image)} alt="" style={{ y: imageY }} className="absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/70" />
      <motion.div style={{ y: textY, opacity: textOpacity }} className="absolute inset-0 grid place-items-center px-6 text-center">
        <Title className="text-balance font-serif text-[clamp(64px,24cqw,220px)] leading-[0.88] tracking-[-0.02em]">
          {store.name || "Tu local"}
        </Title>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 grid justify-items-center gap-3 pb-6 text-[13px]">
        <p>
          {demoStatus.label} · {demoStatus.detail}
        </p>
        <span aria-hidden className="h-10 w-px bg-paper/60" />
      </div>
    </header>
  );
}

function Dish({ product: p, flip, count, scroller, onOpen, onAdd }: Pick<TemplateProps, "scroller" | "onOpen" | "onAdd"> & { product: Product; flip: boolean; count: number }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, root: scroller, amount: 0.2 }}
      className={`flex flex-col gap-5 @2xl:flex-row @2xl:items-end @2xl:gap-16 @2xl:px-12 ${flip ? "items-end @2xl:flex-row-reverse" : "items-start"}`}
    >
      <motion.button
        type="button"
        aria-label={`Ver ${p.name}`}
        onClick={() => onOpen(p)}
        variants={{ hidden: { opacity: 0, y: 48 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}
        className={`block w-[84%] overflow-hidden @2xl:w-[54%] ${flip ? "aspect-square" : "aspect-[4/5]"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={large(p.image!)}
          alt=""
          loading="lazy"
          variants={{ hidden: { scale: 1.12 }, show: { scale: 1, transition: { duration: 1.4, ease } } }}
          className="size-full bg-well object-cover"
        />
      </motion.button>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: 0.12 } } }}
        className="w-[84%] px-6 @2xl:w-auto @2xl:flex-1 @2xl:px-0 @2xl:pb-8"
      >
        <h3 className="text-balance font-serif text-[clamp(32px,9cqw,60px)] leading-[0.98]">{p.name}</h3>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-6 text-muted">{p.description}</p>
        <div className="mt-2 flex items-center gap-4 text-[13px]">
          <span className="tabular-nums">{money(p.price)}</span>
          <button
            type="button"
            aria-label={`Agregar ${p.name}`}
            onClick={() => onAdd(p)}
            className="press min-h-11 font-semibold uppercase tracking-[0.12em] underline decoration-brand/50 underline-offset-[6px] hover:decoration-brand"
          >
            Agregar
          </button>
          {count > 0 && <span className="text-muted">{count} en tu pedido</span>}
        </div>
      </motion.div>
    </motion.article>
  );
}

export function Immersive({ store, embedded, scroller, categories, qty, onOpen, onAdd }: TemplateProps) {
  const cover = store.cover ?? categories.flatMap((c) => c.products).find((p) => p.featured && p.image)?.image;
  return (
    <>
      <Hero store={store} embedded={embedded} scroller={scroller} image={cover} />

      <section className="px-6 py-28 @2xl:px-12 @2xl:py-40">
        {store.story.trim() && (
          <p className="max-w-[16ch] text-balance font-serif text-[clamp(36px,10.5cqw,96px)] leading-[1.02]">{store.story}</p>
        )}
        <p className="ml-auto mt-10 w-[72%] max-w-[38ch] text-[15px] leading-6 text-muted">
          Pocos platos, bien hechos. Elegí con calma: cada pedido llega a nuestra cocina tal como lo armás.
        </p>
      </section>

      {categories.map((c) => {
        // Hasta tres platos por sección van a la galería; el resto, a una lista tipográfica.
        const main = c.products.filter((p) => p.image).slice(0, 3);
        const rest = c.products.filter((p) => !main.includes(p));
        return (
          <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`} className="pb-24 @2xl:pb-36">
            <h2 id={`h-${c.id}`} className="px-6 pb-10 font-serif text-[clamp(52px,16cqw,160px)] leading-[0.9] tracking-[-0.02em] @2xl:px-12 @2xl:pb-16">
              {c.name}
            </h2>
            <div className="grid gap-20 @2xl:gap-32">
              {main.map((p, i) => (
                <Dish key={p.id} product={p} flip={i % 2 === 1} count={qty[p.id] ?? 0} scroller={scroller} onOpen={onOpen} onAdd={onAdd} />
              ))}
            </div>
            {rest.length > 0 && (
              <ul className="mx-6 mt-20 border-t border-line @2xl:mx-auto @2xl:max-w-2xl">
                {rest.map((p) => (
                  <li key={p.id} className="border-b border-line">
                    <button type="button" onClick={() => onOpen(p)} className="flex w-full items-baseline gap-4 py-4 text-left">
                      <span className="flex-1">
                        <span className="block font-serif text-[22px] leading-tight">{p.name}</span>
                        <span className="mt-0.5 block text-[13px] leading-[18px] text-muted">{p.description}</span>
                      </span>
                      {qty[p.id] ? <span className="text-[13px] text-muted tabular-nums">{qty[p.id]}×</span> : null}
                      <span className="text-[14px] tabular-nums">{money(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

type MenuProps = { store: StoreConfig; categories: Category[]; active?: string; onPick: (id: string) => void; onClose: () => void };

export function MenuOverlay({ open, ...props }: MenuProps & { open: boolean }) {
  return <AnimatePresence>{open && <Overlay {...props} />}</AnimatePresence>;
}

function Overlay({ store, categories, active, onPick, onClose }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, onClose);
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Secciones del menú"
      tabIndex={-1}
      className="absolute inset-0 z-50 flex flex-col bg-ink px-6 pb-8 pt-4 text-paper outline-none @2xl:px-12"
      // Se abre desde donde está la pastilla "Menú", no desde el centro.
      initial={{ clipPath: "circle(0% at 88% 5%)" }}
      animate={{ clipPath: "circle(150% at 88% 5%)", transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div className="flex h-10 items-center justify-between">
        <span className="font-serif text-[20px]">{store.name}</span>
        <button type="button" onClick={onClose} className="press h-10 rounded-full border border-paper/30 px-4 text-[13px] font-semibold hover:border-paper">
          Cerrar
        </button>
      </div>
      <nav aria-label="Categorías" className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
        {categories.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            aria-current={active === c.id ? "true" : undefined}
            onClick={() => onPick(c.id)}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.18 + i * 0.05 } }}
            className={`w-fit text-left font-serif text-[clamp(44px,13cqw,104px)] leading-[1.08] transition-colors duration-200 hover:text-paper ${
              active === c.id ? "text-paper" : "text-paper/55"
            }`}
          >
            {c.name}
          </motion.button>
        ))}
      </nav>
      <p className="text-[13px] text-paper/70">
        {demoStatus.label} · {demoStatus.detail}
      </p>
    </motion.div>
  );
}

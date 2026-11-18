"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { addLine, makeLine, onBrand, setQty } from "@/lib/cart";
import { demoStatus } from "@/lib/demo-menu";
import type { CartLine, Category, Product, StoreConfig } from "@/lib/types";
import { Search } from "../icons";
import { CartBar, CheckoutSheet } from "./Cart";
import { MenuOverlay } from "./Immersive";
import { ProductSheet } from "./ProductSheet";
import { Sheet } from "./Sheet";
import { templates } from "./templates";

const NAV_H = 48;
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** La tienda completa. Ocupa el alto de su contenedor y ancla sheets y carrito
 *  a sí misma, así se usa igual en /[slug] y dentro del teléfono del Studio. */
export function Storefront({ store, menu, embedded = false }: { store: StoreConfig; menu: Category[]; embedded?: boolean }) {
  const pillId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(menu[0]?.id);
  const [lines, setLines] = useState<CartLine[]>([]);
  // El producto se conserva al cerrar para que el sheet salga con su contenido.
  const [product, setProduct] = useState<Product | null>(null);
  const [sheet, setSheet] = useState<"product" | "checkout" | "menu" | null>(null);
  // Plantillas a pantalla completa: sin header ni barra, con encabezado propio y pastilla "Menú".
  const bare = store.template === "immersive" || store.template === "luxe" || store.template === "hype";
  const close = useCallback(() => setSheet(null), []);

  const categories = useMemo(() => {
    const q = fold(query.trim());
    // Los agotados y las categorías que quedan vacías no se muestran.
    return menu
      .map((c) => ({ ...c, products: c.products.filter((p) => !p.soldOut && (!q || fold(`${p.name} ${p.description}`).includes(q))) }))
      .filter((c) => c.products.length);
  }, [menu, query]);

  const qty = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lines) map[l.productId] = (map[l.productId] ?? 0) + l.qty;
    return map;
  }, [lines]);

  // Scroll-spy: la última sección cuyo inicio pasó bajo la barra sticky.
  const spy = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const sections = [...el.querySelectorAll<HTMLElement>("[data-cat]")];
    if (!sections.length) return;
    const top = el.getBoundingClientRect().top + NAV_H + 12;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    const current = atEnd ? sections.at(-1) : (sections.filter((s) => s.getBoundingClientRect().top <= top).at(-1) ?? sections[0]);
    setActive(current!.dataset.cat!);
  }, []);

  useEffect(spy, [spy, categories, store.template]);

  // La pestaña activa se mantiene a la vista dentro de la barra.
  useEffect(() => {
    const bar = nav.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (bar && tab) bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const goTo = (id: string) => {
    const el = scroller.current;
    const section = el?.querySelector<HTMLElement>(`[data-cat="${id}"]`);
    if (!el || !section) return;
    const delta = section.getBoundingClientRect().top - el.getBoundingClientRect().top;
    el.scrollTo({ top: el.scrollTop + delta - NAV_H + 1, behavior: "smooth" });
  };

  const open = (p: Product) => {
    setProduct(p);
    setSheet("product");
  };
  // "+" suma directo; si el producto exige elegir opciones, abre el detalle.
  const quickAdd = (p: Product) => (p.groups?.length ? open(p) : setLines((l) => addLine(l, makeLine(p, [], 1))));

  useEffect(() => {
    if (sheet === "checkout" && lines.length === 0) setSheet(null);
  }, [sheet, lines.length]);

  const Template = templates[store.template];
  const Title = embedded ? "p" : "h1";
  const style = { "--theme-primary": store.brand, "--theme-on-primary": onBrand(store.brand), accentColor: store.brand } as React.CSSProperties;

  return (
    <MotionConfig reducedMotion="user">
      <div style={style} className="relative h-full overflow-hidden bg-paper text-ink [container-type:size]">
        <motion.div ref={scroller} layoutScroll onScroll={spy} inert={sheet !== null} className="no-scrollbar relative h-full overflow-y-auto overscroll-contain">
          <header className={`px-4 pb-3 pt-4 ${bare ? "hidden" : ""}`}>
            <div className="flex items-center gap-3">
              <div aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-[17px] font-bold text-on-brand transition-colors duration-300">
                {(store.name.trim()[0] ?? "M").toUpperCase()}
              </div>
              <div className="min-w-0">
                <Title className="truncate text-[17px] font-bold leading-6 tracking-tight">{store.name || "Tu local"}</Title>
                <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-muted">
                  <span className={`size-1.5 rounded-full ${demoStatus.open ? "bg-emerald-600" : "bg-muted"}`} />
                  <span className="font-semibold text-ink">{demoStatus.label}</span> · {demoStatus.detail}
                </p>
              </div>
            </div>
            <label className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-well px-3 text-muted transition-colors focus-within:bg-surface focus-within:outline-2 focus-within:outline-brand">
              <Search />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en el menú"
                aria-label="Buscar en el menú"
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
              />
            </label>
          </header>

          {categories.length > 0 && !bare && (
            <motion.nav
              ref={nav}
              layoutScroll
              aria-label="Categorías"
              className="no-scrollbar sticky top-0 z-20 flex h-12 items-center gap-1 overflow-x-auto border-b border-line bg-paper/90 px-3 backdrop-blur-md"
            >
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-tab={c.id}
                  aria-current={active === c.id ? "true" : undefined}
                  onClick={() => goTo(c.id)}
                  className={`relative h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold transition-colors duration-200 before:absolute before:-inset-y-2 before:inset-x-0 before:content-[''] ${
                    active === c.id ? "text-on-brand" : "text-muted hover:text-ink"
                  }`}
                >
                  {active === c.id && (
                    <motion.span
                      layoutId={pillId}
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative">{c.name}</span>
                </button>
              ))}
            </motion.nav>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={store.template}
              // Luxe y Hype traen su propio fondo y espacio inferior: tiene que llegar hasta el final.
              className={store.template === "luxe" || store.template === "hype" ? "" : lines.length ? "pb-28" : "pb-10"}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] }, transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.14 } }}
            >
              {categories.length ? (
                <Template store={store} embedded={embedded} scroller={scroller} categories={categories} qty={qty} showFeatured={!query.trim()} onOpen={open} onAdd={quickAdd} />
              ) : (
                <div className="px-6 pt-16 text-center">
                  <p className="text-[15px] font-semibold">Nada coincide con “{query.trim()}”</p>
                  <button type="button" onClick={() => setQuery("")} className="press mt-3 h-10 rounded-full bg-well px-4 text-[14px] font-semibold hover:bg-line">
                    Ver todo el menú
                  </button>
                </div>
              )}
            </motion.main>
          </AnimatePresence>
        </motion.div>

        {bare && (
          <>
            <button
              type="button"
              inert={sheet !== null}
              onClick={() => setSheet("menu")}
              className="press absolute right-4 top-4 z-30 h-10 rounded-full bg-ink px-4 text-[13px] font-semibold text-paper ring-1 ring-paper/25"
            >
              Menú
            </button>
            <MenuOverlay
              open={sheet === "menu"}
              store={store}
              categories={categories}
              active={active}
              onClose={close}
              onPick={(id) => {
                close();
                goTo(id);
              }}
            />
          </>
        )}

        <CartBar lines={sheet ? [] : lines} onOpen={() => setSheet("checkout")} />

        <Sheet open={sheet === "product"} onClose={close} label={product?.name ?? "Producto"}>
          {product && (
            <ProductSheet
              key={product.id}
              product={product}
              onAdd={(line) => {
                setLines((l) => addLine(l, line));
                close();
              }}
            />
          )}
        </Sheet>
        <Sheet open={sheet === "checkout"} onClose={close} label="Tu pedido">
          <CheckoutSheet store={store} lines={lines} onQty={(key, n) => setLines((l) => setQty(l, key, n))} />
        </Sheet>
      </div>
    </MotionConfig>
  );
}

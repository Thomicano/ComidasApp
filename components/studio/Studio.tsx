"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { slugify } from "@/lib/cart";
import { demoMenu, demoStore } from "@/lib/demo-menu";
import { readImage } from "@/lib/image";
import { loadMenu, loadStore, saveMenu, saveStore } from "@/lib/storage";
import type { Category, StoreConfig, TemplateId } from "@/lib/types";
import { ArrowRight, Check } from "../icons";
import { Segmented } from "../store/Cart";
import { Storefront } from "../store/Storefront";
import { MenuBoard } from "./MenuBoard";

const colors = [
  { name: "Tomate", hex: "#c8452c" },
  { name: "Naranja", hex: "#e04e1b" },
  { name: "Mostaza", hex: "#e0a526" },
  { name: "Oliva", hex: "#5b6f3a" },
  { name: "Petróleo", hex: "#1f5c5a" },
  { name: "Borgoña", hex: "#7a2e3b" },
  { name: "Tinta", hex: "#23262d" },
];

const templateInfo: { id: TemplateId; name: string; fit: string; detail: string }[] = [
  { id: "compact", name: "Compact App", fit: "Pizzerías, hamburgueserías, lomiterías", detail: "Lista densa con miniatura y alta rápida" },
  { id: "grid", name: "Visual Grid", fit: "Sushi, pastelería, heladerías", detail: "Grilla de dos columnas, la foto manda" },
  { id: "cafe", name: "Minimal Café", fit: "Cafeterías de especialidad, vinotecas, panaderías", detail: "Carta tipográfica con destacados arriba" },
  { id: "immersive", name: "Experiencia Inmersiva", fit: "Fine dining, bodegas, sushi premium", detail: "Editorial a pantalla completa, guiada por el scroll" },
  { id: "bento", name: "Bento UI", fit: "Dark kitchens, comida callejera moderna, locales vanguardistas", detail: "Mosaico de bloques táctiles con paneles de cristal" },
  { id: "luxe", name: "Luxe Glass", fit: "Coctelería de autor, rooftops, restaurantes premium", detail: "Tarjetas de cristal sobre una portada fija" },
  { id: "hype", name: "Hype Drop", fit: "Hamburgueserías de autor, ediciones limitadas, street food", detail: "Lanzamiento estilo sneaker: tipografía gigante y recortes" },
];

/** Esquema del layout de cada plantilla, no una captura. */
function Wire({ id }: { id: TemplateId }) {
  const bar = "h-1 rounded-full bg-ink/20";
  return (
    <div aria-hidden className="grid h-[68px] w-[52px] shrink-0 content-center gap-1.5 rounded-lg bg-well p-2">
      {id === "compact" &&
        [0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="size-3 rounded-[3px] bg-ink/25" />
            <span className={`${bar} flex-1`} />
          </div>
        ))}
      {id === "grid" && (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="aspect-square rounded-[3px] bg-ink/25" />
          ))}
        </div>
      )}
      {id === "bento" && (
        <div className="grid grid-cols-2 gap-1">
          <span className="col-span-2 h-6 rounded-[4px] bg-ink/35" />
          <span className="aspect-square rounded-[4px] bg-ink/25" />
          <span className="aspect-square rounded-[4px] bg-ink/25" />
        </div>
      )}
      {id === "hype" && (
        <div className="-m-2 grid h-[68px] content-center justify-items-center rounded-lg bg-bone p-1.5">
          <span className="font-wide text-[13px] font-black leading-none text-ink/25 [font-stretch:125%]">DROP</span>
          <span className="-mt-1.5 size-6 rotate-[-8deg] rounded-full bg-ink/45" />
          <span className="mt-1 size-2.5 justify-self-end rounded-full bg-[#e04e1b]" />
        </div>
      )}
      {id === "luxe" && (
        // El margen negativo cancela el padding del marco: el fondo oscuro llega al borde.
        <div className="-m-2 grid h-[68px] content-end gap-1 rounded-lg bg-ink/80 p-2">
          <span className="h-3 rounded-[4px] bg-white/30" />
          <span className="h-5 rounded-[4px] bg-white/30" />
        </div>
      )}
      {id === "immersive" && (
        <>
          <span className="h-7 rounded-[3px] bg-ink/35" />
          <span className="h-1.5 w-6 rounded-full bg-ink/35" />
          <span className="ml-auto h-3 w-5 rounded-[3px] bg-ink/25" />
        </>
      )}
      {id === "cafe" && (
        <>
          <span className="h-1.5 w-5 rounded-full bg-ink/35" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <span className={`${bar} w-5`} />
              <span className={`${bar} w-2`} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const input =
  "mt-1.5 h-11 w-full rounded-xl bg-well px-3 text-[15px] font-normal text-ink placeholder:text-muted";
const labelText = "text-[13px] font-semibold text-muted";
const sectionTitle = "text-[15px] font-bold";
const swap = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  // transitionEnd suelta el filtro para no dejar una capa de composición viva sobre todo el panel.
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] as const }, transitionEnd: { filter: "none" } },
  exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } },
};

type Tab = "design" | "menu" | "ops" | "preview";
const tabs: { id: Tab; label: string; mobileOnly?: boolean }[] = [
  { id: "design", label: "Diseño" },
  { id: "menu", label: "Menú" },
  { id: "ops", label: "Operación" },
  { id: "preview", label: "Vista previa", mobileOnly: true },
];

export function Studio() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("design");
  const [store, setStore] = useState<StoreConfig>(demoStore);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [menu, setMenu] = useState<Category[]>(demoMenu);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [menuError, setMenuError] = useState(false);
  const set = (patch: Partial<StoreConfig>) => setStore((s) => ({ ...s, ...patch }));

  useEffect(() => {
    const saved = loadStore();
    if (saved) {
      setStore(saved);
      setSlugTouched(true);
    }
    const savedMenu = loadMenu();
    if (savedMenu) setMenu(savedMenu);
    setMenuLoaded(true);
  }, []);

  // El menú se autoguarda (es un backoffice, no un borrador): tras la carga inicial, cada cambio persiste.
  useEffect(() => {
    if (menuLoaded) setMenuError(!saveMenu(menu));
  }, [menu, menuLoaded]);

  const publish = () => {
    const el = form.current!;
    // Un campo inválido puede estar en la pestaña oculta: primero se muestra, después se señala.
    const bad = el.querySelector<HTMLElement>("input:invalid, textarea:invalid");
    if (bad) {
      flushSync(() => setTab(bad.closest<HTMLElement>("[data-panel]")!.dataset.panel as Tab));
      el.reportValidity();
      return;
    }
    if (!saveStore(store)) {
      setSaveError("No pudimos guardar los cambios en este navegador. Probá con una portada más liviana o salí del modo privado.");
      return;
    }
    router.push(`/${store.slug}`);
  };

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    setCoverError("");
    try {
      set({ cover: await readImage(file, { max: 1600 }) });
    } catch {
      setCoverError("No pudimos leer esa imagen. Probá con un JPG o PNG.");
    }
  };

  const panel = (id: Tab) => ({
    id: `panel-${id}`,
    role: "tabpanel",
    "aria-labelledby": `tab-${id}`,
    "data-panel": id,
    // En desktop la vista previa siempre está a la derecha, así que "preview" muestra Diseño.
    className: `grid gap-8 ${tab === id ? "" : id === "design" && tab === "preview" ? "max-lg:hidden" : "hidden"}`,
  });

  return (
    <MotionConfig reducedMotion="user">
      {/* En "Menú" el tablero toma el ancho y el teléfono queda a la derecha como preview. */}
      <div className={`grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] ${tab === "menu" ? "lg:grid-cols-[minmax(0,1fr)_460px]" : "lg:grid-cols-[minmax(400px,460px)_minmax(0,1fr)]"}`}>
        <header className="px-5 lg:col-start-1 lg:px-8">
          <div className="flex h-14 items-center">
            <span className="font-serif text-[24px] leading-none">Menta</span>
          </div>
          {started && (
            <div role="tablist" aria-label="Secciones del editor" className="mb-2 flex rounded-xl bg-well p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  aria-controls={t.id === "preview" ? "preview" : `panel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`relative h-9 flex-1 rounded-lg text-[13px] font-semibold transition-colors duration-200 sm:text-[14px] ${
                    tab === t.id ? "text-ink" : "text-muted hover:text-ink"
                  } ${t.mobileOnly ? "lg:hidden" : ""}`}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="studio-tab"
                      className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_2px_rgb(28_27_24/0.12)]"
                      transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        <form
          ref={form}
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
          className={`thin-scrollbar row-start-2 overflow-y-auto px-5 lg:col-start-1 lg:px-8 ${tab === "preview" ? "max-lg:hidden" : ""}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!started ? (
              <motion.div key="intro" {...swap} className="flex min-h-full flex-col justify-center pb-16">
                <h1 className="max-w-[14ch] text-balance font-serif text-[44px] leading-[1.02] tracking-[-0.01em] lg:text-[52px]">
                  El menú de tu local, con pedidos por WhatsApp
                </h1>
                <p className="mt-4 max-w-[36ch] text-[16px] leading-6 text-muted">
                  Elegí una plantilla, poné tu color y publicá. Cada pedido te llega ordenado al chat, sin comisiones.
                </p>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="press mt-8 flex h-12 w-fit items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper"
                >
                  Crear mi página <ArrowRight />
                </button>
              </motion.div>
            ) : (
              <motion.div key="config" {...swap} className="pb-8 pt-4">
                <div {...panel("design")}>
                  <fieldset>
                    <legend className={sectionTitle}>Color de marca</legend>
                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      {colors.map((c) => (
                        <label key={c.hex} title={c.name} className="press relative grid size-10 cursor-pointer place-items-center rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
                          <input type="radio" name="brand" className="sr-only" aria-label={c.name} checked={store.brand === c.hex} onChange={() => set({ brand: c.hex })} />
                          <span className="size-8 rounded-full" style={{ background: c.hex }} />
                          {store.brand === c.hex && (
                            <motion.span layoutId="swatch" className="absolute inset-0 rounded-full border-2 border-ink" transition={{ type: "spring", duration: 0.35, bounce: 0.2 }} />
                          )}
                        </label>
                      ))}
                      <label className="ml-1 flex h-10 cursor-pointer items-center gap-2 rounded-full bg-well pl-1.5 pr-3.5 text-[13px] font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
                        <input type="color" value={store.brand} onChange={(e) => set({ brand: e.target.value })} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0" />
                        Otro
                      </label>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className={sectionTitle}>Plantilla</legend>
                    <div className="mt-3 grid gap-2">
                      {templateInfo.map((t) => (
                        <label
                          key={t.id}
                          className="press flex cursor-pointer items-center gap-3.5 rounded-2xl border border-line p-2 pr-4 hover:border-ink/30 has-[:checked]:border-ink has-[:checked]:bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink"
                        >
                          <input type="radio" name="template" className="sr-only" checked={store.template === t.id} onChange={() => set({ template: t.id })} />
                          <Wire id={t.id} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold leading-5">{t.name}</span>
                            <span className="block text-[13px] leading-[18px] text-muted">{t.detail}</span>
                            <span className="mt-1 block text-[13px] leading-[18px]">Ideal para {t.fit.toLowerCase()}</span>
                          </span>
                          <span className={`grid size-6 shrink-0 place-items-center rounded-full transition-[opacity,transform] duration-200 ease-out ${store.template === t.id ? "bg-ink text-paper" : "scale-90 opacity-0"}`}>
                            <Check />
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <section className="grid gap-4">
                    <div>
                      <h2 className={sectionTitle}>Portada y filosofía</h2>
                      <p className="mt-1 text-[13px] leading-[18px] text-muted">Se muestran en Experiencia Inmersiva y Luxe Glass.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-well text-[12px] text-muted">
                        {store.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={store.cover} alt="Portada actual" className="size-full object-cover" />
                        ) : (
                          "Sin foto"
                        )}
                      </div>
                      <label className="press flex h-10 cursor-pointer items-center rounded-full bg-well px-4 text-[14px] font-semibold hover:bg-line has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
                        <input type="file" accept="image/*" onChange={onCover} className="sr-only" />
                        {store.cover ? "Cambiar foto" : "Subir foto"}
                      </label>
                      {store.cover && (
                        <button type="button" onClick={() => set({ cover: undefined })} className="press h-10 rounded-full px-3 text-[14px] font-semibold text-muted hover:text-ink">
                          Quitar
                        </button>
                      )}
                    </div>
                    {coverError && <p role="alert" className="text-[13px] font-semibold text-red-700">{coverError}</p>}
                    <label className={labelText}>
                      Filosofía del local
                      <textarea
                        rows={3}
                        maxLength={140}
                        value={store.story}
                        onChange={(e) => set({ story: e.target.value })}
                        placeholder="Una o dos frases sobre tu cocina"
                        className={`${input} h-auto resize-none py-2.5 leading-6`}
                      />
                      <span className="mt-1 block text-right font-normal tabular-nums">{store.story.length}/140</span>
                    </label>
                  </section>
                </div>

                <div {...panel("menu")}>
                  <div className="-mb-4">
                    <h2 className={sectionTitle}>Tu menú</h2>
                    <p className="mt-1 text-[13px] leading-[18px] text-muted">
                      Arrastrá platos y categorías para ordenarlos. Tocá un plato para editarlo. Los cambios se guardan solos.
                    </p>
                    {menuError && (
                      <p role="alert" className="mt-2 text-[13px] font-semibold text-red-700">
                        No pudimos guardar el menú en este navegador: probá con fotos más livianas o quitá alguna.
                      </p>
                    )}
                  </div>
                  <MenuBoard menu={menu} onChange={setMenu} />
                </div>

                <div {...panel("ops")}>
                  <section className="grid gap-4">
                    <h2 className={sectionTitle}>Tu local</h2>
                    <label className={labelText}>
                      Nombre
                      <input
                        required
                        maxLength={40}
                        value={store.name}
                        onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
                        className={input}
                      />
                    </label>
                    <label className={labelText}>
                      Dirección web
                      <span className="mt-1.5 flex h-11 items-center rounded-xl bg-well pl-3 text-[15px] font-normal focus-within:outline-2 focus-within:outline-ink">
                        <span className="text-muted">menta.app/</span>
                        <input
                          required
                          pattern="[a-z0-9]+(-[a-z0-9]+)*"
                          title="Solo minúsculas, números y guiones"
                          maxLength={40}
                          value={store.slug}
                          onChange={(e) => {
                            setSlugTouched(true);
                            set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
                          }}
                          className="h-full min-w-0 flex-1 bg-transparent pr-3 text-ink outline-none"
                        />
                      </span>
                    </label>
                    <label className={labelText}>
                      WhatsApp para recibir pedidos
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9+ \-]{8,20}"
                        title="Número con código de país, por ejemplo 54 9 11 5555 5555"
                        value={store.whatsapp}
                        onChange={(e) => set({ whatsapp: e.target.value })}
                        className={input}
                      />
                    </label>
                  </section>

                  <section className="grid gap-4">
                    <h2 className={sectionTitle}>Entregas</h2>
                    <Segmented
                      name="delivery"
                      legend="Modalidad"
                      options={["both", "pickup", "delivery"] as const}
                      labels={{ both: "Ambos", pickup: "Solo retiro", delivery: "Solo delivery" }}
                      value={store.delivery}
                      onChange={(delivery) => set({ delivery })}
                    />
                    {store.delivery !== "pickup" && (
                      <label className={labelText}>
                        Costo de envío
                        <span className="mt-1.5 flex h-11 items-center rounded-xl bg-well pl-3 text-[15px] font-normal focus-within:outline-2 focus-within:outline-ink">
                          <span className="text-muted">$</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={50}
                            value={store.shippingCost || ""}
                            onChange={(e) => set({ shippingCost: Math.max(0, Number(e.target.value) || 0) })}
                            placeholder="0, sin cargo"
                            className="h-full min-w-0 flex-1 bg-transparent px-2 tabular-nums text-ink outline-none placeholder:text-muted"
                          />
                        </span>
                      </label>
                    )}
                    {store.delivery !== "delivery" && (
                      <label className={labelText}>
                        Dirección del local
                        <input
                          required
                          maxLength={80}
                          autoComplete="street-address"
                          value={store.address}
                          onChange={(e) => set({ address: e.target.value })}
                          placeholder="Donde retiran los pedidos"
                          className={input}
                        />
                      </label>
                    )}
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Preview en vivo: el mismo componente que sirve /[slug]. */}
        <div id="preview" className={`row-start-2 flex min-h-0 flex-col items-center justify-center gap-3 bg-well lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:p-8 ${started && tab === "preview" ? "" : "max-lg:hidden"}`}>
          <p className="hidden rounded-full bg-surface px-3.5 py-1.5 text-[13px] text-muted lg:block">
            menta.app/<span className="font-semibold text-ink">{store.slug || "tu-local"}</span>
          </p>
          {/* Radio interno (38) = radio del marco (48) − borde (10). */}
          <div className="h-full w-full min-h-0 lg:h-[min(780px,100%)] lg:w-[380px] lg:rounded-[48px] lg:bg-ink lg:p-[10px] lg:shadow-[0_30px_60px_-30px_rgb(28_27_24/0.5)]">
            <div className="h-full overflow-hidden lg:rounded-[38px]">
              <Storefront store={store} menu={menu} embedded />
            </div>
          </div>
        </div>

        {started && (
          <footer className="row-start-3 grid gap-2 border-t border-line px-5 py-3 lg:col-start-1 lg:px-8 lg:py-4">
            {saveError && <p role="alert" className="text-[13px] font-semibold text-red-700">{saveError}</p>}
            <button type="button" onClick={publish} className="press h-12 rounded-full bg-ink text-[15px] font-semibold text-paper">
              Publicar y abrir tienda
            </button>
          </footer>
        )}
      </div>
    </MotionConfig>
  );
}

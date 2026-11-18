"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { readImage } from "@/lib/image";
import { uid } from "@/lib/menu";
import type { Category, OptionGroup, Product } from "@/lib/types";
import { Close, Plus } from "../icons";
import { useDialog } from "../store/Sheet";

const drawer = [0.32, 0.72, 0, 1] as const;
const input = "h-11 w-full rounded-xl bg-well px-3 text-[15px] text-ink placeholder:text-muted";
const label = "grid gap-1.5 text-[13px] font-semibold text-muted";
const small = "h-9 rounded-lg bg-surface px-2.5 text-[14px] text-ink placeholder:text-muted";

type Props = {
  product: Product;
  categoryId: string;
  categories: Category[];
  onChange: (p: Product) => void;
  onMove: (categoryId: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

/** Edita en vivo: cada cambio va directo al menú, así el preview del teléfono responde al instante. */
export function ProductEditor({ product: p, categoryId, categories, onChange, onMove, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [wide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [imageError, setImageError] = useState("");
  useDialog(ref, onClose);

  const set = (patch: Partial<Product>) => onChange({ ...p, ...patch });
  const groups = p.groups ?? [];
  const setGroup = (i: number, patch: Partial<OptionGroup>) => set({ groups: groups.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  const close = () => {
    if (!p.name.trim()) set({ name: "Plato sin nombre" });
    onClose();
  };

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError("");
    try {
      set({ image: await readImage(file, { max: 640, square: true }) });
    } catch {
      setImageError("No pudimos leer esa imagen. Probá con un JPG o PNG.");
    }
  };

  const hidden = wide ? { x: "-105%" } : { y: "100%" };
  return (
    <div className="fixed inset-0 z-50">
      <motion.div className="absolute inset-0 bg-ink/40 lg:bg-ink/15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={close} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Editar ${p.name || "plato"}`}
        tabIndex={-1}
        // Mobile: hoja desde abajo. Desktop: panel a la izquierda, para que el teléfono de la derecha siga a la vista.
        className="absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-3xl bg-paper shadow-[0_-8px_40px_-12px_rgb(28_27_24/0.3)] outline-none lg:inset-y-3 lg:left-3 lg:right-auto lg:w-[460px] lg:rounded-3xl lg:shadow-[0_24px_60px_-20px_rgb(28_27_24/0.4)]"
        initial={hidden}
        animate={{ x: 0, y: 0, transition: { duration: 0.45, ease: drawer } }}
        exit={{ ...hidden, transition: { duration: 0.28, ease: drawer } }}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-[17px] font-bold tracking-tight">Editar plato</h2>
          <button type="button" onClick={close} className="press h-10 rounded-full bg-ink px-5 text-[14px] font-semibold text-paper">
            Listo
          </button>
        </header>

        <div className="thin-scrollbar grid min-h-0 flex-1 content-start gap-5 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-well text-[12px] text-muted">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="Foto actual del plato" className="size-full object-cover" />
              ) : (
                "Sin foto"
              )}
            </div>
            <div className="grid gap-2">
              <label className="press flex h-10 w-fit cursor-pointer items-center rounded-full bg-well px-4 text-[14px] font-semibold hover:bg-line has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
                <input type="file" accept="image/*" onChange={onImage} className="sr-only" />
                {p.image ? "Cambiar foto" : "Subir foto"}
              </label>
              {p.image && (
                <button type="button" onClick={() => set({ image: undefined })} className="w-fit text-[13px] font-semibold text-muted hover:text-ink">
                  Quitar foto
                </button>
              )}
              <p className="text-[12px] leading-4 text-muted">Se recorta en cuadrado.</p>
            </div>
          </div>
          {imageError && <p role="alert" className="-mt-2 text-[13px] font-semibold text-red-700">{imageError}</p>}

          <label className={label}>
            Nombre
            <input value={p.name} maxLength={50} onChange={(e) => set({ name: e.target.value })} className={input} />
          </label>
          <label className={label}>
            Descripción
            <textarea
              rows={2}
              maxLength={160}
              value={p.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Ingredientes o cómo se sirve"
              className={`${input} h-auto resize-none py-2.5 leading-6`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Precio
              <span className="flex h-11 items-center rounded-xl bg-well pl-3 text-[15px] focus-within:outline-2 focus-within:outline-ink">
                <span className="text-muted">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={50}
                  value={p.price || ""}
                  placeholder="0"
                  onChange={(e) => set({ price: Math.max(0, Number(e.target.value) || 0) })}
                  className="h-full min-w-0 flex-1 bg-transparent px-2 tabular-nums text-ink outline-none placeholder:text-muted"
                />
              </span>
            </label>
            <label className={label}>
              Categoría
              <select value={categoryId} onChange={(e) => onMove(e.target.value)} className={`${input} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2366635b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="grid gap-3 border-t border-line pt-5">
            <div>
              <h3 className="text-[15px] font-bold">Opciones y extras</h3>
              <p className="mt-0.5 text-[13px] text-muted">Tamaños, salsas, adicionales. El cliente los elige al agregar el plato.</p>
            </div>

            {groups.map((g, i) => {
              const required = g.min === 1;
              return (
                <fieldset key={g.id} className="grid gap-2 rounded-2xl bg-well p-3">
                  <legend className="sr-only">Grupo {g.name || i + 1}</legend>
                  <div className="flex gap-2">
                    <input
                      value={g.name}
                      onChange={(e) => setGroup(i, { name: e.target.value })}
                      placeholder="Elegí tu salsa"
                      aria-label="Nombre del grupo"
                      className={`${small} min-w-0 flex-1 font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() => set({ groups: groups.filter((_, j) => j !== i) })}
                      aria-label={`Eliminar el grupo ${g.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-line hover:text-ink"
                    >
                      <Close />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                    <select
                      value={required ? "one" : "many"}
                      aria-label="Tipo de elección"
                      onChange={(e) => setGroup(i, e.target.value === "one" ? { min: 1, max: 1 } : { min: 0, max: Math.max(1, g.options.length) })}
                      className={small}
                    >
                      <option value="one">Obligatorio, elige uno</option>
                      <option value="many">Opcional, varios</option>
                    </select>
                    {!required && (
                      <label className="flex items-center gap-1.5">
                        hasta
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={g.max}
                          onChange={(e) => setGroup(i, { max: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })}
                          className={`${small} w-16 tabular-nums`}
                        />
                      </label>
                    )}
                  </div>
                  <ul className="grid gap-1.5">
                    {g.options.map((o, k) => {
                      const setOption = (patch: Partial<typeof o>) => setGroup(i, { options: g.options.map((x, m) => (m === k ? { ...x, ...patch } : x)) });
                      return (
                        <li key={o.id} className="flex gap-2">
                          <input value={o.name} onChange={(e) => setOption({ name: e.target.value })} placeholder="Opción" aria-label="Nombre de la opción" className={`${small} min-w-0 flex-1`} />
                          <span className={`${small} flex w-28 items-center gap-1 focus-within:outline-2 focus-within:outline-ink`}>
                            <span className="text-muted">+$</span>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={o.price || ""}
                              placeholder="0"
                              aria-label={`Precio adicional de ${o.name || "la opción"}`}
                              onChange={(e) => setOption({ price: Math.max(0, Number(e.target.value) || 0) })}
                              className="h-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-muted"
                            />
                          </span>
                          <button
                            type="button"
                            onClick={() => setGroup(i, { options: g.options.filter((_, m) => m !== k) })}
                            aria-label={`Quitar ${o.name || "la opción"}`}
                            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-line hover:text-ink"
                          >
                            <Close />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setGroup(i, { options: [...g.options, { id: uid(), name: "", price: 0 }] })}
                    className="flex h-9 w-fit items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-muted hover:bg-line hover:text-ink"
                  >
                    <Plus /> Agregar opción
                  </button>
                  {g.options.length === 0 && <p className="px-2 text-[12px] text-muted">Sin opciones, el grupo no se muestra en la tienda.</p>}
                </fieldset>
              );
            })}

            <button
              type="button"
              onClick={() => set({ groups: [...groups, { id: uid(), name: "", min: 0, max: 1, options: [{ id: uid(), name: "", price: 0 }] }] })}
              className="press flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/20 text-[14px] font-semibold text-muted hover:border-ink/40 hover:text-ink"
            >
              <Plus /> Agregar grupo de opciones
            </button>
          </section>

          <button type="button" onClick={onDelete} className="mt-2 h-11 w-fit rounded-xl px-3 text-[14px] font-semibold text-red-700 hover:bg-red-50">
            Eliminar plato
          </button>
        </div>
      </motion.div>
    </div>
  );
}

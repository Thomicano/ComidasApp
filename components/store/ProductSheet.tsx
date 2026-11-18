"use client";

import { useState } from "react";
import { makeLine, money } from "@/lib/cart";
import type { CartLine, Product } from "@/lib/types";
import { Minus, Plus } from "../icons";

export function Stepper({ value, min = 1, onChange, label }: { value: number; min?: number; onChange: (n: number) => void; label: string }) {
  const btn = "press grid size-9 place-items-center rounded-full text-ink hover:bg-line disabled:opacity-35";
  return (
    <div role="group" aria-label={label} className="flex items-center rounded-full bg-well p-1">
      <button type="button" aria-label="Quitar uno" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus />
      </button>
      <span aria-live="polite" className="w-7 text-center text-[15px] font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label="Sumar uno" className={btn} onClick={() => onChange(value + 1)}>
        <Plus />
      </button>
    </div>
  );
}

/** Montar con key={product.id}: el estado inicial se deriva del producto. */
export function ProductSheet({ product, onAdd }: { product: Product; onAdd: (line: CartLine) => void }) {
  // Un grupo recién creado en el editor puede no tener opciones todavía: se ignora.
  const groups = (product.groups ?? []).filter((g) => g.options.length);
  const [selected, setSelected] = useState<string[]>(() =>
    groups.filter((g) => g.min === 1 && g.max === 1).map((g) => g.options[0].id),
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const line = makeLine(product, selected, qty, note);
  const countIn = (ids: string[]) => ids.filter((id) => selected.includes(id)).length;
  const valid = groups.every((g) => countIn(g.options.map((o) => o.id)) >= g.min);

  return (
    <>
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {product.image && (
          <div className="px-2">
            {/* Radio interno = radio del sheet (24) − separación (8). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image.replace("w=480&h=480", "w=900&h=560")} alt="" className="aspect-[16/10] w-full rounded-2xl bg-well object-cover" />
          </div>
        )}
        <div className="px-5 pb-2 pt-4">
          <h2 className="text-[21px] font-bold leading-tight tracking-tight">{product.name}</h2>
          <p className="mt-1 text-[14px] leading-5 text-muted">{product.description}</p>
          <p className="mt-2 text-[15px] font-semibold tabular-nums">{money(product.price)}</p>
        </div>

        {groups.map((g) => {
          const ids = g.options.map((o) => o.id);
          const single = g.max === 1;
          const full = !single && countIn(ids) >= g.max;
          return (
            <fieldset key={g.id} className="mt-3 border-t border-line px-5 pt-4">
              <legend className="float-left w-full text-[15px] font-bold">
                {g.name}
                <span className="ml-2 text-[13px] font-medium text-muted">
                  {single ? "Elegí una opción" : `Opcional, hasta ${g.max}`}
                </span>
              </legend>
              <div className="clear-both pt-1">
                {g.options.map((o) => {
                  const checked = selected.includes(o.id);
                  return (
                    <label key={o.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] has-[:disabled]:cursor-default has-[:disabled]:opacity-40">
                      <span className="flex-1">{o.name}</span>
                      {o.price > 0 && <span className="text-[14px] text-muted tabular-nums">+{money(o.price)}</span>}
                      <input
                        type={single ? "radio" : "checkbox"}
                        name={`${product.id}-${g.id}`}
                        className="size-[18px]"
                        checked={checked}
                        disabled={full && !checked}
                        onChange={() =>
                          setSelected((s) =>
                            single
                              ? [...s.filter((id) => !ids.includes(id)), o.id]
                              : checked
                                ? s.filter((id) => id !== o.id)
                                : [...s, o.id],
                          )
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div className="mt-3 border-t border-line px-5 pb-5 pt-4">
          <label htmlFor="note" className="text-[15px] font-bold">Aclaraciones</label>
          <textarea
            id="note"
            rows={2}
            maxLength={140}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Sin cebolla, bien cocida…"
            className="mt-2 w-full resize-none rounded-xl bg-well px-3 py-2.5 text-[15px] placeholder:text-muted focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-line px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <Stepper value={qty} onChange={setQty} label="Cantidad" />
        <button
          type="button"
          disabled={!valid}
          onClick={() => onAdd(line)}
          className="press flex h-12 flex-1 items-center justify-between rounded-full bg-brand px-5 text-[15px] font-semibold text-on-brand disabled:opacity-40"
        >
          <span>Agregar</span>
          <span className="tabular-nums">{money(line.unitPrice * qty)}</span>
        </button>
      </div>
    </>
  );
}

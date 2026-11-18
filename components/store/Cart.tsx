"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cartCount, cartTotal, deliveryMode, money, shippingFor, whatsappUrl } from "@/lib/cart";
import type { CartLine, Checkout, StoreConfig } from "@/lib/types";
import { ArrowRight } from "../icons";
import { Stepper } from "./ProductSheet";

export function CartBar({ lines, onOpen }: { lines: CartLine[]; onOpen: () => void }) {
  const count = cartCount(lines);
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] px-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          initial={{ y: "120%" }}
          animate={{ y: 0, transition: { type: "spring", duration: 0.55, bounce: 0.28 } }}
          exit={{ y: "120%", transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
        >
          <button
            type="button"
            onClick={onOpen}
            className="press flex h-14 w-full items-center gap-3 rounded-2xl bg-brand pl-3 pr-4 text-on-brand shadow-[0_10px_30px_-10px_rgb(28_27_24/0.45)]"
          >
            <span className="grid size-8 place-items-center overflow-hidden rounded-xl bg-on-brand/15 text-[14px] font-bold tabular-nums">
              {/* La cantidad sube en cada alta: confirma el toque sin toast. */}
              <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
                {count}
              </motion.span>
            </span>
            <span className="flex-1 text-left text-[15px] font-semibold">Ver pedido</span>
            <span className="text-[15px] font-semibold tabular-nums">{money(cartTotal(lines))}</span>
            <ArrowRight />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const field =
  "mt-1.5 h-11 w-full rounded-xl bg-well px-3 text-[15px] font-normal text-ink transition-colors placeholder:text-muted focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-brand";

export function Segmented<T extends string>({ name, legend, options, labels, value, onChange }: { name: string; legend: string; options: readonly T[]; labels?: Record<T, string>; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[13px] font-semibold text-muted">{legend}</legend>
      <div className="mt-1.5 grid auto-cols-fr grid-flow-col rounded-xl bg-well p-1">
        {options.map((o) => (
          <label
            key={o}
            className="press grid h-9 cursor-pointer place-items-center rounded-lg text-[14px] font-semibold text-muted has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-[0_1px_2px_rgb(28_27_24/0.12)] has-[:checked]:ring-1 has-[:checked]:ring-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand"
          >
            <input type="radio" name={name} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
            {labels?.[o] ?? o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const Row = ({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) => (
  <div className={`flex justify-between text-[14px] tabular-nums ${strong ? "font-semibold" : "text-muted"}`}>
    <span>{label}</span>
    <span>{money(value)}</span>
  </div>
);

export function CheckoutSheet({ store, lines, onQty }: { store: StoreConfig; lines: CartLine[]; onQty: (key: string, qty: number) => void }) {
  const [c, setC] = useState<Checkout>({ customer: "", mode: "retiro", address: "", payment: "Efectivo" });
  const set = (patch: Partial<Checkout>) => setC((prev) => ({ ...prev, ...patch }));
  // Derivado, no guardado: si el dueño cambia la modalidad en el Studio, el checkout la sigue al instante.
  const mode = deliveryMode(store, c.mode);
  const subtotal = cartTotal(lines);
  const shipping = shippingFor(store, mode);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault(); // la validación nativa (required) ya corrió
        window.open(whatsappUrl(store, lines, { ...c, mode }), "_blank", "noopener");
      }}
    >
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
        <h2 className="pt-1 text-[21px] font-bold tracking-tight">Tu pedido</h2>
        <ul className="mt-2 divide-y divide-line">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-5">{l.name}</p>
                {(l.options.length > 0 || l.note) && (
                  <p className="text-[13px] leading-[18px] text-muted">{[...l.options, l.note].filter(Boolean).join(" · ")}</p>
                )}
                <p className="text-[14px] leading-5 tabular-nums">{money(l.unitPrice * l.qty)}</p>
              </div>
              <Stepper value={l.qty} min={0} onChange={(n) => onQty(l.key, n)} label={`Cantidad de ${l.name}`} />
            </li>
          ))}
        </ul>

        <div className="mt-2 grid gap-4 border-t border-line pt-4">
          <label className="text-[13px] font-semibold text-muted">
            Tu nombre
            <input required autoComplete="given-name" value={c.customer} onChange={(e) => set({ customer: e.target.value })} className={field} placeholder="Para identificar el pedido" />
          </label>
          {store.delivery === "both" && (
            <Segmented name="mode" legend="Entrega" options={["retiro", "delivery"] as const} labels={{ retiro: "Retiro", delivery: "Delivery" }} value={mode} onChange={(m) => set({ mode: m })} />
          )}
          {mode === "delivery" ? (
            <label className="text-[13px] font-semibold text-muted">
              Dirección de entrega
              <input required autoComplete="street-address" value={c.address} onChange={(e) => set({ address: e.target.value })} className={field} placeholder="Calle, número y piso" />
            </label>
          ) : (
            store.address && (
              <p className="rounded-xl bg-well px-3 py-2.5 text-[14px] text-muted">
                Retirás en <span className="font-semibold text-ink">{store.address}</span>
              </p>
            )
          )}
          <Segmented name="payment" legend="Pago" options={["Efectivo", "Transferencia"] as const} value={c.payment} onChange={(payment) => set({ payment })} />
          {mode === "delivery" && (
            <div className="grid gap-1 border-t border-line pt-3">
              <Row label="Subtotal" value={subtotal} />
              <Row label="Envío" value={shipping} />
              <Row label="Total" value={subtotal + shipping} strong />
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-line px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <button type="submit" className="press flex h-12 w-full items-center justify-between rounded-full bg-brand px-5 text-[15px] font-semibold text-on-brand">
          <span>Enviar pedido por WhatsApp</span>
          <span className="tabular-nums">{money(subtotal + shipping)}</span>
        </button>
      </div>
    </form>
  );
}

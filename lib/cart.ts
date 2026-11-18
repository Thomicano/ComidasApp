import type { CartLine, Checkout, Product, StoreConfig } from "./types";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
export const money = (n: number) => ars.format(n);

export const cartTotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.qty, 0);

export function makeLine(
  product: Product,
  optionIds: string[],
  qty: number,
  note = "",
): CartLine {
  const chosen = (product.groups ?? [])
    .flatMap((g) => g.options)
    .filter((o) => optionIds.includes(o.id));
  return {
    key: [product.id, ...chosen.map((o) => o.id).sort(), note.trim()].join("|"),
    productId: product.id,
    name: product.name,
    unitPrice: product.price + chosen.reduce((s, o) => s + o.price, 0),
    qty,
    options: chosen.map((o) => o.name),
    note: note.trim(),
  };
}

export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  return lines.some((l) => l.key === line.key)
    ? lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + line.qty } : l))
    : [...lines, line];
}

export function setQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  return lines.flatMap((l) => (l.key !== key ? [l] : qty > 0 ? [{ ...l, qty }] : []));
}

/** Entrega efectiva: si el local ofrece una sola modalidad, manda sobre lo elegido. */
export const deliveryMode = (store: StoreConfig, chosen: Checkout["mode"]): Checkout["mode"] =>
  store.delivery === "both" ? chosen : store.delivery === "pickup" ? "retiro" : "delivery";

export const shippingFor = (store: StoreConfig, mode: Checkout["mode"]) =>
  mode === "delivery" ? Math.max(0, store.shippingCost) : 0;

export function whatsappMessage(store: StoreConfig, lines: CartLine[], c: Checkout) {
  const mode = deliveryMode(store, c.mode);
  const subtotal = cartTotal(lines);
  const shipping = shippingFor(store, mode);
  const items = lines.map((l) =>
    [
      `• ${l.qty}× ${l.name} — ${money(l.unitPrice * l.qty)}`,
      l.options.length ? `   ${l.options.join(", ")}` : "",
      l.note ? `   Nota: ${l.note}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `*Nuevo pedido — ${store.name}*`,
    "",
    ...items,
    "",
    ...(mode === "delivery" ? [`Subtotal: ${money(subtotal)}`, `Envío: ${shipping ? money(shipping) : "sin cargo"}`] : []),
    `*Total: ${money(subtotal + shipping)}*`,
    "",
    `Nombre: ${c.customer}`,
    mode === "delivery"
      ? `Entrega: Delivery a ${c.address.trim()}`
      : `Entrega: Retira en el local${store.address ? ` (${store.address})` : ""}`,
    `Pago: ${c.payment}`,
  ].join("\n");
}

export const whatsappUrl = (store: StoreConfig, lines: CartLine[], c: Checkout) =>
  `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    whatsappMessage(store, lines, c),
  )}`;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Texto legible sobre el color de marca: tinta oscura o blanco según luminancia. */
export function onBrand(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1c1b18" : "#ffffff";
}

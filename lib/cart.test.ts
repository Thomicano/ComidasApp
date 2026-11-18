import assert from "node:assert/strict";
import { test } from "node:test";
import { addLine, cartCount, cartTotal, deliveryMode, makeLine, onBrand, setQty, shippingFor, slugify, whatsappUrl } from "./cart.ts";
import type { Product, StoreConfig } from "./types.ts";

const pizza: Product = {
  id: "p1",
  name: "Muzzarella",
  description: "",
  price: 9000,
  groups: [
    { id: "g", name: "Extras", min: 0, max: 2, options: [
      { id: "a", name: "Jamón", price: 1400 },
      { id: "b", name: "Aceitunas", price: 600 },
    ] },
  ],
};
const store: StoreConfig = {
  name: "Don José", slug: "don-jose", brand: "#c8452c", template: "compact", whatsapp: "+54 9 11 0000-0000",
  story: "", delivery: "both", shippingCost: 1500, address: "Gorriti 4800",
};
const decode = (url: string) => decodeURIComponent(url.split("text=")[1]);

test("precio con extras, merge de líneas iguales y totales", () => {
  let lines = addLine([], makeLine(pizza, ["a", "b"], 1));
  lines = addLine(lines, makeLine(pizza, ["b", "a"], 2)); // mismo set, otro orden
  lines = addLine(lines, makeLine(pizza, [], 1));
  assert.equal(lines.length, 2);
  assert.equal(lines[0].unitPrice, 11000);
  assert.equal(cartCount(lines), 4);
  assert.equal(cartTotal(lines), 42000);
  assert.equal(setQty(lines, lines[1].key, 0).length, 1);
});

test("url de whatsapp: número limpio y mensaje codificado", () => {
  const lines = [makeLine(pizza, ["a"], 2, "sin orégano")];
  const url = whatsappUrl(store, lines, { customer: "Ana", mode: "delivery", address: "Av. Siempreviva 742", payment: "Efectivo" });
  assert.ok(url.startsWith("https://wa.me/5491100000000?text="));
  const text = decode(url);
  assert.match(text, /2× Muzzarella/);
  assert.match(text, /Jamón/);
  assert.match(text, /Nota: sin orégano/);
  assert.match(text, /Delivery a Av\. Siempreviva 742/);
  assert.match(text, /Subtotal: \$\s?20\.800/);
  assert.match(text, /Envío: \$\s?1\.500/);
  assert.match(text, /Total: \$\s?22\.300/);
  assert.match(text, /Pago: Efectivo/);
});

test("la modalidad del local manda sobre lo elegido", () => {
  const lines = [makeLine(pizza, [], 1)];
  const c = { customer: "Ana", mode: "delivery", address: "Calle 1", payment: "Transferencia" } as const;
  // Solo retiro: sin envío aunque el cliente haya marcado delivery.
  const pickup = decode(whatsappUrl({ ...store, delivery: "pickup" }, lines, c));
  assert.match(pickup, /Retira en el local \(Gorriti 4800\)/);
  assert.match(pickup, /Total: \$\s?9\.000/);
  assert.doesNotMatch(pickup, /Envío/);
  // Solo delivery: suma envío aunque el estado diga retiro.
  const delivery = decode(whatsappUrl({ ...store, delivery: "delivery" }, lines, { ...c, mode: "retiro" }));
  assert.match(delivery, /Total: \$\s?10\.500/);
  assert.match(delivery, /Pago: Transferencia/);
  assert.equal(deliveryMode({ ...store, delivery: "pickup" }, "delivery"), "retiro");
  assert.equal(shippingFor(store, "retiro"), 0);
});

test("slug y contraste", () => {
  assert.equal(slugify("  Pizzería Don José! "), "pizzeria-don-jose");
  assert.equal(onBrand("#1f2937"), "#ffffff");
  assert.equal(onBrand("#f2c94c"), "#1c1b18");
});

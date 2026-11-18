import assert from "node:assert/strict";
import { test } from "node:test";
import { addProduct, moveProduct, removeProduct, updateProduct } from "./menu.ts";
import type { Category } from "./types.ts";

const p = (id: string) => ({ id, name: id, description: "", price: 1 });
const menu: Category[] = [
  { id: "a", name: "A", products: [p("1"), p("2"), p("3")] },
  { id: "b", name: "B", products: [p("4")] },
  { id: "c", name: "C", products: [] },
];
const ids = (m: Category[]) => m.map((c) => c.products.map((x) => x.id).join("")).join("|");

test("reordena dentro de la misma categoría como arrayMove", () => {
  assert.equal(ids(moveProduct(menu, "1", "a", 2)), "231|4|");
  assert.equal(ids(moveProduct(menu, "3", "a", 0)), "312|4|");
});

test("mueve entre categorías, también a una vacía, y acota el índice", () => {
  assert.equal(ids(moveProduct(menu, "2", "b", 0)), "13|24|");
  assert.equal(ids(moveProduct(menu, "2", "c", 99)), "13|4|2");
  assert.equal(ids(moveProduct(menu, "2", "b", -5)), "13|24|");
});

test("ids desconocidos no cambian nada y no se muta la entrada", () => {
  assert.equal(moveProduct(menu, "x", "b", 0), menu);
  assert.equal(moveProduct(menu, "1", "zz", 0), menu);
  assert.equal(ids(menu), "123|4|");
});

test("editar, quitar y agregar", () => {
  assert.equal(updateProduct(menu, { ...p("4"), price: 9 })[1].products[0].price, 9);
  assert.equal(ids(removeProduct(menu, "2")), "13|4|");
  assert.equal(ids(addProduct(menu, "c", p("5"))), "123|4|5");
});

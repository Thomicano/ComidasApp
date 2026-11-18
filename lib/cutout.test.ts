import assert from "node:assert/strict";
import { test } from "node:test";
import { knockOut } from "./cutout.ts";

// Imagen 5×5: fondo blanco, un "producto" marrón en el centro con un punto blanco adentro.
function image(bg: number) {
  const d = new Uint8ClampedArray(5 * 5 * 4).fill(bg);
  const set = (x: number, y: number, c: [number, number, number]) => d.set([...c, 255], (y * 5 + x) * 4);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) d[(y * 5 + x) * 4 + 3] = 255;
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) set(x, y, [120, 70, 30]);
  set(2, 2, [bg, bg, bg]); // blanco interno (queso): no debe agujerearse
  return d;
}
const alpha = (d: Uint8ClampedArray, x: number, y: number) => d[(y * 5 + x) * 4 + 3];

test("fondo claro: el borde se vuelve transparente, el producto y sus blancos internos quedan", () => {
  const d = image(245);
  assert.equal(knockOut(d, 5, 5), true);
  assert.equal(alpha(d, 0, 0), 0);
  assert.equal(alpha(d, 4, 2), 0);
  assert.equal(alpha(d, 1, 1), 255);
  assert.equal(alpha(d, 2, 2), 255);
});

test("fondo oscuro: no recorta nada", () => {
  const d = image(40);
  assert.equal(knockOut(d, 5, 5), false);
  assert.equal(alpha(d, 0, 0), 255);
});

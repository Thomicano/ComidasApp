import type { Category, Product } from "./types";

// Operaciones puras sobre el menú: devuelven un menú nuevo, nunca mutan.

export const uid = () => crypto.randomUUID().slice(0, 8);

export const findCategory = (menu: Category[], productId: string) =>
  menu.find((c) => c.products.some((p) => p.id === productId));

/** Saca el plato de su categoría y lo inserta en `toCatId` en la posición `toIndex` (acotada).
 *  Dentro de la misma categoría equivale a arrayMove. */
export function moveProduct(menu: Category[], productId: string, toCatId: string, toIndex: number): Category[] {
  const product = findCategory(menu, productId)?.products.find((p) => p.id === productId);
  if (!product || !menu.some((c) => c.id === toCatId)) return menu;
  const without = menu.map((c) => ({ ...c, products: c.products.filter((p) => p.id !== productId) }));
  return without.map((c) => {
    if (c.id !== toCatId) return c;
    const products = [...c.products];
    products.splice(Math.max(0, Math.min(toIndex, products.length)), 0, product);
    return { ...c, products };
  });
}

export const updateProduct = (menu: Category[], product: Product): Category[] =>
  menu.map((c) => ({ ...c, products: c.products.map((p) => (p.id === product.id ? product : p)) }));

export const removeProduct = (menu: Category[], productId: string): Category[] =>
  menu.map((c) => ({ ...c, products: c.products.filter((p) => p.id !== productId) }));

export const addProduct = (menu: Category[], catId: string, product: Product): Category[] =>
  menu.map((c) => (c.id === catId ? { ...c, products: [...c.products, product] } : c));

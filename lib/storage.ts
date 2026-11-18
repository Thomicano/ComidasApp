import { demoStore } from "./demo-menu";
import type { Category, StoreConfig } from "./types";

// shortcut: un solo local guardado en localStorage; pasar a Supabase (tabla stores) con auth.
const KEY = "menta:store";

export function loadStore(): StoreConfig | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    // Los locales guardados antes de sumar campos nuevos los completan con los de demo.
    return saved ? { ...demoStore, ...saved } : null;
  } catch {
    return null;
  }
}

/** false si el navegador no lo guardó (modo privado o cuota llena, típicamente por la portada). */
export function saveStore(store: StoreConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

// shortcut: menú y fotos de platos en localStorage (~5 MB en total); pasar a Supabase + Storage al haber backend.
const MENU_KEY = "menta:menu";

export function loadMenu(): Category[] | null {
  try {
    const saved = JSON.parse(localStorage.getItem(MENU_KEY) ?? "null");
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function saveMenu(menu: Category[]) {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
    return true;
  } catch {
    return false;
  }
}

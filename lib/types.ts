// Esquema base. Cada tipo mapea 1:1 a una tabla futura (Supabase):
// stores, categories, products, option_groups, options.

export type TemplateId = "compact" | "grid" | "cafe" | "immersive" | "bento" | "luxe" | "hype";

export type StoreConfig = {
  name: string;
  slug: string;
  brand: string; // color hex, se inyecta como --brand
  template: TemplateId;
  whatsapp: string; // solo dígitos, con código de país
  story: string; // frase de filosofía (plantilla Inmersiva)
  cover?: string; // data URL JPEG (Inmersiva y Luxe Glass)
  delivery: "both" | "pickup" | "delivery";
  shippingCost: number;
  address: string; // dónde retira el cliente
};

export type Option = { id: string; name: string; price: number };

export type OptionGroup = {
  id: string;
  name: string;
  min: number; // 0 = opcional
  max: number; // 1 = elección única
  options: Option[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string; // URL o data URL JPEG subida desde el editor
  soldOut?: boolean; // agotado: no se muestra en la tienda
  badge?: "Popular" | "Sin TACC" | "Veggie" | "Edición limitada";
  featured?: boolean;
  groups?: OptionGroup[];
};

export type Category = { id: string; name: string; products: Product[] };

export type CartLine = {
  key: string; // producto + opciones + nota: líneas iguales se suman
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  options: string[];
  note: string;
};

export type Checkout = {
  customer: string;
  mode: "retiro" | "delivery";
  address: string;
  payment: "Efectivo" | "Transferencia";
};

import type { Category, OptionGroup, StoreConfig } from "./types";

// shortcut: fotos hotlinkeadas de Unsplash; pasar a Supabase Storage al cargar menús reales.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=480&q=70&auto=format&fit=crop`;

const cutout = (id: string, crop = "") =>
  `https://images.unsplash.com/photo-${id}?w=720&h=720&q=75&auto=format&fit=crop${crop}`;

export const demoStore: StoreConfig = {
  name: "La Esquina",
  slug: "la-esquina",
  brand: "#c8452c",
  template: "compact",
  whatsapp: "5491100000000", // número de prueba
  story: "Cocinamos despacio, con lo que la temporada trae.",
  delivery: "both",
  shippingCost: 1500,
  address: "Gorriti 4800, Palermo",
};

// shortcut: horario fijo de demo; calcular desde los horarios del local cuando existan.
export const demoStatus = { open: true, label: "Abierto", detail: "cierra 23:30" };

const pizzaGroups: OptionGroup[] = [
  {
    id: "pz-size",
    name: "Tamaño",
    min: 1,
    max: 1,
    options: [
      { id: "pz-ind", name: "Individual, 4 porciones", price: 0 },
      { id: "pz-gde", name: "Grande, 8 porciones", price: 3500 },
    ],
  },
  {
    id: "pz-extra",
    name: "Extras",
    min: 0,
    max: 3,
    options: [
      { id: "pz-muzza", name: "Extra muzzarella", price: 1200 },
      { id: "pz-jamon", name: "Jamón cocido", price: 1400 },
      { id: "pz-aceit", name: "Aceitunas negras", price: 600 },
      { id: "pz-borde", name: "Borde relleno", price: 1800 },
    ],
  },
];

const burgerGroups: OptionGroup[] = [
  {
    id: "bg-size",
    name: "Medallón",
    min: 1,
    max: 1,
    options: [
      { id: "bg-simple", name: "Simple, 120 g", price: 0 },
      { id: "bg-doble", name: "Doble, 240 g", price: 2800 },
    ],
  },
  {
    id: "bg-side",
    name: "Acompañamiento",
    min: 1,
    max: 1,
    options: [
      { id: "bg-papas", name: "Papas fritas", price: 0 },
      { id: "bg-aros", name: "Aros de cebolla", price: 900 },
    ],
  },
  {
    id: "bg-extra",
    name: "Extras",
    min: 0,
    max: 3,
    options: [
      { id: "bg-cheddar", name: "Cheddar extra", price: 800 },
      { id: "bg-panceta", name: "Panceta ahumada", price: 1100 },
      { id: "bg-huevo", name: "Huevo a la plancha", price: 700 },
    ],
  },
];

const coffeeGroups: OptionGroup[] = [
  {
    id: "cf-milk",
    name: "Leche",
    min: 1,
    max: 1,
    options: [
      { id: "cf-entera", name: "Entera", price: 0 },
      { id: "cf-desc", name: "Descremada", price: 0 },
      { id: "cf-avena", name: "De avena", price: 500 },
    ],
  },
  {
    id: "cf-extra",
    name: "Extras",
    min: 0,
    max: 2,
    options: [
      { id: "cf-shot", name: "Shot extra de espresso", price: 700 },
      { id: "cf-vainilla", name: "Jarabe de vainilla", price: 400 },
    ],
  },
];

export const demoMenu: Category[] = [
  {
    id: "pizzas",
    name: "Pizzas",
    products: [
      { id: "margherita", name: "Margherita", description: "Salsa de tomate, muzzarella fior di latte, albahaca fresca y oliva", price: 9800, image: img("1574071318508-1cdbab80d002"), badge: "Popular", featured: true, groups: pizzaGroups },
      { id: "pepperoni", name: "Pepperoni", description: "Muzzarella, pepperoni crocante y orégano", price: 11200, image: img("1628840042765-356cda07504e"), groups: pizzaGroups },
      { id: "fugazzeta", name: "Fugazzeta rellena", description: "Doble masa, muzzarella, cebolla dorada y parmesano", price: 12400, image: img("1513104890138-7c749659a591"), groups: pizzaGroups },
      { id: "napolitana", name: "Napolitana", description: "Muzzarella, tomate en rodajas, ajo y perejil", price: 10600, image: img("1565299624946-b28f40a0ae38"), groups: pizzaGroups },
      { id: "vegetal", name: "Huerta", description: "Zucchini grillado, morrón asado, rúcula y tomates cherry", price: 11000, image: img("1604382354936-07c5d9983bd3"), badge: "Veggie", groups: pizzaGroups },
    ],
  },
  {
    id: "burgers",
    name: "Hamburguesas",
    products: [
      // Fotos sobre fondo claro: la plantilla Hype Drop las "recorta" con mix-blend-multiply.
      { id: "sacra-vitta", name: "Sacra Vitta", description: "Medallón de 100 g, doble cheddar, cebolla morada, lactonesa de ajo y papas", price: 11400, image: cutout("1599155253646-7989e08c05c1"), badge: "Edición limitada", groups: burgerGroups },
      { id: "terra-nova", name: "Terra Nova", description: "Medallón de 100 g, doble cheddar, cebolla crispy, mostaza dulce y papas", price: 10900, image: cutout("1547584370-2cc98b8b8dc8"), groups: burgerGroups },
      { id: "ricca-morte", name: "Ricca Morte", description: "Medallón de 100 g, doble cheddar, bacon, salsa de la casa y papas", price: 11200, image: cutout("1562823319-5e43e2022493", "&crop=focalpoint&fp-x=.5&fp-y=.55&fp-z=2.2"), groups: burgerGroups },
      { id: "clasica", name: "Clásica", description: "Carne, cheddar, lechuga, tomate y salsa de la casa", price: 8900, image: img("1568901346375-23c9450c58cd"), badge: "Popular", featured: true, groups: burgerGroups },
      { id: "bacon", name: "Bacon & cheddar", description: "Carne, doble cheddar, panceta ahumada y cebolla crispy", price: 10400, image: img("1553979459-d2229ba7433b"), groups: burgerGroups },
      { id: "criolla", name: "Criolla", description: "Carne, provoleta, chimichurri y morrón asado", price: 10900, image: img("1550547660-d9450f859349"), groups: burgerGroups },
      { id: "veggie", name: "Veggie", description: "Medallón de garbanzos, palta, tomate y alioli", price: 9600, image: img("1571091718767-18b5b1457add"), badge: "Veggie", groups: burgerGroups },
    ],
  },
  {
    id: "cafe",
    name: "Cafetería",
    products: [
      { id: "flat-white", name: "Flat white", description: "Doble ristretto con leche texturizada", price: 3400, image: img("1541167760496-1628856ab772"), featured: true, groups: coffeeGroups },
      { id: "capuccino", name: "Capuccino", description: "Espresso, leche vaporizada y espuma densa", price: 3600, image: img("1572442388796-11668a67e53d"), groups: coffeeGroups },
      { id: "latte", name: "Latte", description: "Espresso suave con mucha leche", price: 3600, image: img("1561882468-9110e03e0f78"), groups: coffeeGroups },
      { id: "espresso", name: "Espresso", description: "Blend de la casa, tueste medio", price: 2400, image: img("1509042239860-f550ce710b93") },
      { id: "medialunas", name: "Medialunas de manteca", description: "Tres unidades, horneadas a la mañana", price: 2900, image: img("1555507036-ab1f4038808a"), badge: "Popular", featured: true },
      { id: "tostado", name: "Tostada con palta", description: "Pan de masa madre, palta, huevo poché y semillas", price: 6200, image: img("1541519227354-08fa5d50c44d") },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    products: [
      { id: "gaseosa", name: "Gaseosa 500 ml", description: "Línea Coca-Cola, bien fría", price: 2200, image: img("1622483767028-3f66f32aef97") },
      { id: "limonada", name: "Limonada con menta", description: "Limón exprimido, menta y jengibre, 500 ml", price: 3200, image: img("1513558161293-cdaf765ed2fd"), badge: "Sin TACC" },
      { id: "cerveza", name: "Cerveza IPA", description: "Pinta tirada, artesanal de la zona", price: 4200, image: img("1608270586620-248524c67de9") },
      { id: "agua", name: "Agua mineral", description: "Con o sin gas, 500 ml", price: 1600 },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    products: [
      { id: "tiramisu", name: "Tiramisú", description: "Mascarpone, café y cacao amargo", price: 4800, image: img("1571877227200-a0d98ea607e9"), featured: true },
      { id: "cheesecake", name: "Cheesecake", description: "Base de galleta y frutos rojos", price: 4900, image: img("1533134242443-d4fd215305ad") },
      { id: "torta-choco", name: "Torta húmeda de chocolate", description: "Sin harina, con crema batida", price: 4600, image: img("1578985545062-69928b1d9587"), badge: "Sin TACC" },
      { id: "cookies", name: "Cookies con chips", description: "Dos unidades, recién horneadas", price: 2600, image: img("1499636136210-6f4ee915583e") },
    ],
  },
];

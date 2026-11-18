import { money } from "@/lib/cart";
import type { Category, Product, StoreConfig, TemplateId } from "@/lib/types";
import { Plus } from "../icons";
import { BentoTemplate } from "./BentoTemplate";
import { HypeDropTemplate } from "./HypeDropTemplate";
import { Immersive } from "./Immersive";
import { LuxeGlassTemplate } from "./LuxeGlassTemplate";

export type TemplateProps = {
  store: StoreConfig;
  embedded: boolean;
  scroller: React.RefObject<HTMLDivElement | null>; // contenedor de scroll, para parallax y reveals
  categories: Category[];
  qty: Record<string, number>;
  showFeatured: boolean;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
};

function Photo({ product, className }: { product: Product; className: string }) {
  return product.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.image} alt="" loading="lazy" className={`bg-well object-cover ${className}`} />
  ) : (
    <div aria-hidden className={`grid place-items-center bg-well font-serif text-2xl text-muted ${className}`}>
      {product.name[0]}
    </div>
  );
}

function AddButton({ product, count, onAdd, className = "" }: { product: Product; count: number; onAdd: (p: Product) => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={`Agregar ${product.name}${count ? `, ${count} en el pedido` : ""}`}
      onClick={() => onAdd(product)}
      // El before extiende el área táctil a 44px sin agrandar el botón.
      className={`press relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums before:absolute before:-inset-1.5 before:content-[''] ${
        count ? "bg-brand text-on-brand" : "bg-brand/10 text-ink ring-1 ring-inset ring-brand/25 hover:bg-brand/20"
      } ${className}`}
    >
      {count || <Plus />}
    </button>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="shrink-0 rounded-full bg-well px-1.5 py-px text-[11px] font-semibold text-muted">{children}</span>
);

/** Botón invisible que cubre la fila: abre el detalle sin anidar botones. */
const RowHit = ({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) => (
  <button
    type="button"
    aria-label={`Ver ${product.name}, ${money(product.price)}`}
    onClick={() => onOpen(product)}
    className="absolute inset-0 rounded-xl"
  />
);

const sectionTitle = "px-4 pb-1 pt-6 text-[17px] font-bold tracking-tight";

function Compact({ categories, qty, onOpen, onAdd }: TemplateProps) {
  return categories.map((c) => (
    <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`}>
      <h2 id={`h-${c.id}`} className={sectionTitle}>{c.name}</h2>
      <ul className="divide-y divide-line px-4">
        {c.products.map((p) => (
          <li key={p.id} className="relative flex items-center gap-3 py-2">
            <RowHit product={p} onOpen={onOpen} />
            <Photo product={p} className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[15px] font-semibold leading-5">{p.name}</h3>
                {p.badge && <Badge>{p.badge}</Badge>}
              </div>
              <p className="truncate text-[13px] leading-[18px] text-muted">{p.description}</p>
              <p className="text-[14px] font-semibold leading-5 tabular-nums">{money(p.price)}</p>
            </div>
            <AddButton product={p} count={qty[p.id] ?? 0} onAdd={onAdd} />
          </li>
        ))}
      </ul>
    </section>
  ));
}

function Grid({ categories, qty, onOpen, onAdd }: TemplateProps) {
  return categories.map((c) => (
    <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`}>
      <h2 id={`h-${c.id}`} className={`${sectionTitle} pb-3`}>{c.name}</h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
        {c.products.map((p) => (
          <li key={p.id} className="group relative">
            <RowHit product={p} onOpen={onOpen} />
            <div className="relative overflow-hidden rounded-2xl">
              <Photo product={p} className="aspect-square w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              {p.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-semibold">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-semibold leading-5">{p.name}</h3>
                <p className="text-[13px] leading-5 text-muted tabular-nums">{money(p.price)}</p>
              </div>
              <AddButton product={p} count={qty[p.id] ?? 0} onAdd={onAdd} className="mt-0.5" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  ));
}

function Cafe({ categories, qty, showFeatured, onOpen }: TemplateProps) {
  const featured = categories.flatMap((c) => c.products).filter((p) => p.featured && p.image);
  return (
    <>
      {showFeatured && featured.length > 0 && (
        <section aria-label="Destacados" className="pt-5">
          <h2 className="px-5 font-serif text-[15px] italic text-muted">Destacados</h2>
          <ul className="no-scrollbar mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5">
            {featured.map((p) => (
              <li key={p.id} className="relative w-[136px] shrink-0 snap-start">
                <RowHit product={p} onOpen={onOpen} />
                <Photo product={p} className="aspect-[4/3] w-full rounded-xl" />
                <h3 className="mt-2 truncate text-[13px] font-semibold leading-[18px]">{p.name}</h3>
                <p className="text-[13px] leading-[18px] text-muted tabular-nums">{money(p.price)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {categories.map((c) => (
        <section key={c.id} data-cat={c.id} aria-labelledby={`h-${c.id}`} className="px-5">
          <h2 id={`h-${c.id}`} className="pb-1 pt-8 font-serif text-[30px] leading-none">{c.name}</h2>
          <ul>
            {c.products.map((p) => (
              <li key={p.id} className="relative py-2.5">
                <RowHit product={p} onOpen={onOpen} />
                <div className="flex items-baseline gap-2">
                  {qty[p.id] ? <span className="text-[13px] font-bold text-brand tabular-nums">{qty[p.id]}×</span> : null}
                  <h3 className="text-[15px] font-semibold leading-5">{p.name}</h3>
                  {p.badge && <span className="font-serif text-[13px] italic text-muted">{p.badge}</span>}
                  <span aria-hidden className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-line" />
                  <span className="text-[15px] leading-5 tabular-nums">{money(p.price)}</span>
                </div>
                <p className="mt-0.5 max-w-[34ch] text-[13px] leading-[18px] text-muted">{p.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export const templates: Record<TemplateId, (props: TemplateProps) => React.ReactNode> = {
  compact: Compact,
  grid: Grid,
  cafe: Cafe,
  immersive: Immersive,
  bento: BentoTemplate,
  luxe: LuxeGlassTemplate,
  hype: HypeDropTemplate,
};

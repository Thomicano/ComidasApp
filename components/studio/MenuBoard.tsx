"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { money } from "@/lib/cart";
import { addProduct, findCategory, moveProduct, removeProduct, uid, updateProduct } from "@/lib/menu";
import type { Category, Product } from "@/lib/types";
import { Close, Grip, Plus } from "../icons";
import { ProductEditor } from "./ProductEditor";

// Columnas y platos comparten el espacio de ids de dnd-kit: las columnas llevan prefijo.
const COL = "col:";
const isCol = (id: UniqueIdentifier) => String(id).startsWith(COL);
const ease = "cubic-bezier(0.23, 1, 0.32, 1)";

function Switch({ product: p, onToggle }: { product: Product; onToggle?: () => void }) {
  const on = !p.soldOut;
  const track = (
    <span className={`relative block h-5 w-9 rounded-full transition-colors duration-200 ${on ? "bg-emerald-600" : "bg-ink/20"}`}>
      <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-200 ease-out ${on ? "translate-x-4" : ""}`} />
    </span>
  );
  if (!onToggle) return <span aria-hidden>{track}</span>;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${p.name || "Plato"} disponible`}
      title={on ? "Disponible" : "Agotado"}
      onClick={onToggle}
      className="relative shrink-0 before:absolute before:-inset-3 before:content-['']"
    >
      {track}
    </button>
  );
}

function CardBody({ product: p }: { product: Product }) {
  return (
    <>
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt="" className={`size-11 shrink-0 rounded-lg bg-well object-cover transition-opacity ${p.soldOut ? "opacity-40 grayscale" : ""}`} />
      ) : (
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-lg bg-well font-serif text-lg text-muted">
          {(p.name.trim()[0] ?? "·").toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[14px] font-semibold leading-5 ${p.soldOut ? "text-muted" : ""}`}>{p.name || "Sin nombre"}</span>
        <span className="block text-[13px] leading-[18px] text-muted tabular-nums">
          {p.soldOut ? "Agotado" : money(p.price)}
        </span>
      </span>
    </>
  );
}

const card = "flex items-center gap-3 rounded-xl bg-surface p-2 pr-3";

function Card({ product: p, onEdit, onToggle }: { product: Product; onEdit: () => void; onToggle: () => void }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`${card} shadow-[0_1px_2px_rgb(28_27_24/0.08)] ${isDragging ? "opacity-40" : ""}`}
    >
      {/* Toda la tarjeta arrastra; el clic (sin movimiento) abre el editor. El switch queda fuera para no anidar controles. */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`${p.name || "Plato"}. Enter para editar, espacio para mover`}
        onClick={onEdit}
        onKeyDown={(e) => {
          listeners?.onKeyDown?.(e);
          if (e.key === "Enter") onEdit();
        }}
        className="-my-2 -ml-2 flex min-w-0 flex-1 cursor-grab items-center gap-3 rounded-xl py-2 pl-2 active:cursor-grabbing"
      >
        <CardBody product={p} />
      </div>
      <Switch product={p} onToggle={onToggle} />
    </li>
  );
}

type ColumnProps = {
  cat: Category;
  autoFocus: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onToggle: (p: Product) => void;
};

function Column({ cat, autoFocus, onRename, onDelete, onAdd, onEdit, onToggle }: ColumnProps) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: COL + cat.id });
  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-label={cat.name}
      className={`flex w-[min(272px,80vw)] shrink-0 snap-start flex-col rounded-2xl bg-well p-2 ${isDragging ? "opacity-40" : ""}`}
    >
      <header className="flex items-center gap-1 pb-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Mover la categoría ${cat.name}`}
          className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-line hover:text-ink active:cursor-grabbing"
        >
          <Grip />
        </button>
        <input
          value={cat.name}
          autoFocus={autoFocus}
          onFocus={(e) => autoFocus && e.target.select()}
          onChange={(e) => onRename(e.target.value)}
          onBlur={(e) => !e.target.value.trim() && onRename("Sin nombre")}
          // Enter confirma el nombre; sin esto enviaría el formulario del Studio (publicar).
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
          maxLength={30}
          aria-label="Nombre de la categoría"
          className="h-8 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 text-[15px] font-bold outline-none transition-colors hover:bg-line/70 focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-ink"
        />
        <span className="px-1 text-[13px] text-muted tabular-nums">{cat.products.length}</span>
        {cat.products.length === 0 && (
          <button type="button" onClick={onDelete} aria-label={`Eliminar la categoría ${cat.name}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-line hover:text-ink">
            <Close />
          </button>
        )}
      </header>
      <SortableContext items={cat.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className="grid min-h-14 content-start gap-1.5">
          {cat.products.map((p) => (
            <Card key={p.id} product={p} onEdit={() => onEdit(p.id)} onToggle={() => onToggle(p)} />
          ))}
        </ul>
      </SortableContext>
      <button type="button" onClick={onAdd} className="press mt-1.5 flex h-10 items-center gap-1.5 rounded-xl px-2 text-[14px] font-semibold text-muted hover:bg-line hover:text-ink">
        <Plus /> Agregar plato
      </button>
    </section>
  );
}

export function MenuBoard({ menu, onChange }: { menu: Category[]; onChange: (menu: Category[]) => void }) {
  const [active, setActive] = useState<UniqueIdentifier | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [newCol, setNewCol] = useState<string | null>(null);
  const snapshot = useRef(menu);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // En táctil se mantiene apretado para arrastrar: así deslizar el tablero sigue haciendo scroll.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    }),
  );

  const catOf = (id: UniqueIdentifier) => (isCol(id) ? String(id).slice(COL.length) : findCategory(menu, String(id))?.id);
  const indexIn = (catId: string, overId: UniqueIdentifier, fallback: number) =>
    isCol(overId) ? fallback : menu.find((c) => c.id === catId)!.products.findIndex((p) => p.id === overId);

  // Cruce de columna en vivo: el plato salta a la otra lista mientras se arrastra.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || isCol(active.id)) return;
    const from = catOf(active.id);
    const to = catOf(over.id);
    if (!from || !to || from === to) return;
    onChange(moveProduct(menu, String(active.id), to, indexIn(to, over.id, Infinity)));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActive(null);
    const to = over && catOf(over.id);
    if (!to) return;
    if (isCol(active.id)) {
      const from = menu.findIndex((c) => COL + c.id === active.id);
      const target = menu.findIndex((c) => c.id === to);
      if (from !== target) onChange(arrayMove(menu, from, target));
    } else if (catOf(active.id) === to) {
      onChange(moveProduct(menu, String(active.id), to, indexIn(to, over.id, Infinity)));
    }
  };

  const activeProduct = active && !isCol(active) ? findCategory(menu, String(active))?.products.find((p) => p.id === active) : undefined;
  const activeCol = active && isCol(active) ? menu.find((c) => COL + c.id === active) : undefined;
  const editingCat = editing ? findCategory(menu, editing) : undefined;
  const editingProduct = editingCat?.products.find((p) => p.id === editing);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          snapshot.current = menu;
          setActive(active.id);
        }}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActive(null);
          onChange(snapshot.current); // deshace los cruces de columna hechos durante el arrastre
        }}
      >
        <div className="thin-scrollbar -mx-5 flex snap-x items-start gap-3 overflow-x-auto px-5 pb-4 scroll-px-5 lg:-mx-8 lg:px-8 lg:scroll-px-8">
          <SortableContext items={menu.map((c) => COL + c.id)} strategy={horizontalListSortingStrategy}>
            {menu.map((cat) => (
              <Column
                key={cat.id}
                cat={cat}
                autoFocus={cat.id === newCol}
                onRename={(name) => onChange(menu.map((c) => (c.id === cat.id ? { ...c, name } : c)))}
                onDelete={() => onChange(menu.filter((c) => c.id !== cat.id))}
                onAdd={() => {
                  const product: Product = { id: uid(), name: "Nuevo plato", description: "", price: 0 };
                  onChange(addProduct(menu, cat.id, product));
                  setEditing(product.id);
                }}
                onEdit={setEditing}
                onToggle={(p) => onChange(updateProduct(menu, { ...p, soldOut: !p.soldOut }))}
              />
            ))}
          </SortableContext>
          <button
            type="button"
            onClick={() => {
              const id = uid();
              onChange([...menu, { id, name: "Nueva categoría", products: [] }]);
              setNewCol(id);
            }}
            className="press flex h-12 w-[min(272px,80vw)] shrink-0 snap-start items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink/20 text-[14px] font-semibold text-muted hover:border-ink/40 hover:text-ink"
          >
            <Plus /> Nueva categoría
          </button>
        </div>

        <DragOverlay dropAnimation={{ duration: 220, easing: ease }}>
          {activeProduct && (
            // Se levanta: leve giro y escala con un spring corto; la sombra marca que flota sobre el tablero.
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: 2, scale: 1.03 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              className={`${card} cursor-grabbing shadow-[0_14px_32px_-10px_rgb(28_27_24/0.35),0_2px_6px_rgb(28_27_24/0.08)]`}
            >
              <CardBody product={activeProduct} />
              <Switch product={activeProduct} />
            </motion.div>
          )}
          {activeCol && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 1.5 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              className="grid w-[min(272px,80vw)] cursor-grabbing gap-1.5 rounded-2xl bg-well p-2 shadow-[0_18px_40px_-12px_rgb(28_27_24/0.35)]"
            >
              <p className="px-2 py-1.5 text-[15px] font-bold">{activeCol.name}</p>
              {activeCol.products.slice(0, 4).map((p) => (
                <div key={p.id} className={card}>
                  <CardBody product={p} />
                </div>
              ))}
            </motion.div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Portal: el drawer vive fuera del <form> del Studio (Enter no publica) y por encima de todo. */}
      {createPortal(
        <AnimatePresence>
          {editingProduct && editingCat && (
            <ProductEditor
              key={editingProduct.id}
              product={editingProduct}
              categoryId={editingCat.id}
              categories={menu}
              onChange={(p) => onChange(updateProduct(menu, p))}
              onMove={(catId) => onChange(moveProduct(menu, editingProduct.id, catId, Infinity))}
              onDelete={() => {
                if (!window.confirm(`¿Eliminar "${editingProduct.name}" del menú? No se puede deshacer.`)) return;
                setEditing(null);
                onChange(removeProduct(menu, editingProduct.id));
              }}
              onClose={() => setEditing(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

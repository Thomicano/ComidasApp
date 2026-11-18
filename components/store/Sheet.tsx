"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useRef } from "react";

const drawer = [0.32, 0.72, 0, 1] as const;

/** Bottom sheet anclado a su contenedor (position: relative), no al viewport:
 *  así funciona igual dentro del teléfono del Studio y en la tienda pública. */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return <AnimatePresence>{open && <Panel onClose={onClose} label={label}>{children}</Panel>}</AnimatePresence>;
}

/** Foco al abrir, devolución del foco al cerrar y Escape. */
export function useDialog(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, [ref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function Panel({ onClose, label, children }: { onClose: () => void; label: string; children: React.ReactNode }) {
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, onClose);

  return (
    <>
      <motion.div
        className="absolute inset-0 z-40 bg-ink/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92%] max-w-[520px] flex-col rounded-t-3xl bg-surface shadow-[0_-8px_40px_-12px_rgb(28_27_24/0.25)] outline-none"
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: { duration: 0.45, ease: drawer } }}
        exit={{ y: "100%", transition: { duration: 0.28, ease: drawer } }}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={(_, info) => {
          // Un flick rápido alcanza: cierra por distancia o por velocidad.
          if (info.offset.y > 110 || info.velocity.y > 450) onClose();
        }}
      >
        <div
          onPointerDown={(e) => controls.start(e)}
          className="grid h-7 shrink-0 cursor-grab touch-none place-items-center active:cursor-grabbing"
        >
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>
        {children}
      </motion.div>
    </>
  );
}

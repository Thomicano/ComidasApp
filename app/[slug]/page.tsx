"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@/components/icons";
import { Storefront } from "@/components/store/Storefront";
import { demoMenu, demoStore } from "@/lib/demo-menu";
import { loadMenu, loadStore } from "@/lib/storage";
import type { Category, StoreConfig } from "@/lib/types";

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando menú" className="h-full bg-paper p-4">
      <div className="flex items-center gap-3">
        <div className="skeleton size-10 rounded-xl" />
        <div className="grid gap-1.5">
          <div className="skeleton h-4 w-32 rounded-md" />
          <div className="skeleton h-3 w-24 rounded-md" />
        </div>
      </div>
      <div className="skeleton mt-3 h-10 rounded-xl" />
      <div className="mt-8 grid gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton size-14 rounded-xl" />
            <div className="grid flex-1 gap-1.5">
              <div className="skeleton h-4 w-2/5 rounded-md" />
              <div className="skeleton h-3 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [menu, setMenu] = useState<Category[]>(demoMenu);

  useEffect(() => {
    const saved = loadStore();
    // shortcut: cualquier slug no guardado abre el local de demo; devolver 404 real cuando haya base de datos.
    setStore(saved?.slug === slug ? saved : { ...demoStore, slug });
    setMenu(loadMenu() ?? demoMenu);
  }, [slug]);

  return (
    <div className="h-dvh bg-well">
      <Link href="/" className="press fixed left-6 top-6 z-30 hidden h-10 items-center gap-2 rounded-full bg-surface px-4 text-[14px] font-semibold hover:bg-paper lg:flex">
        <ArrowLeft /> Editar página
      </Link>
      {/* La inmersiva es una landing: usa todo el ancho; el resto queda en columna móvil. */}
      <div className={`mx-auto h-full bg-paper ${store?.template === "immersive" ? "" : "max-w-[520px] lg:shadow-[0_0_60px_-20px_rgb(28_27_24/0.25)]"}`}>
        {store ? <Storefront store={store} menu={menu} /> : <Skeleton />}
      </div>
    </div>
  );
}

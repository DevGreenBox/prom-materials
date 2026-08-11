"use client";

import { useState } from "react";

import { ProductGrid } from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";

export type FeaturedTab = { id: string; label: string; products: Product[] };

/**
 * Лента на главной с переключением подборки. Без вкладок это витрина
 * «что попалось первым»; вкладки дают три разных среза одного каталога
 * и не уводят со страницы — сетка меняется на месте.
 */
export function FeaturedTabs({ tabs }: { tabs: FeaturedTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <>
      <div
        role="tablist"
        aria-label="Подборки"
        className="mb-6 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === current.id}
            onClick={() => setActive(tab.id)}
            className={`min-h-11 rounded-md border px-4 text-base transition-colors duration-150 ${
              tab.id === current.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-2 hover:border-accent hover:text-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ProductGrid products={current.products} />
    </>
  );
}

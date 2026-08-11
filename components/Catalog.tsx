import { Suspense } from "react";

import { CatalogView } from "@/components/CatalogView";
import type { Product } from "@/lib/catalog";

/**
 * Фильтр читает параметры из URL, поэтому клиентская часть каталога
 * живёт под Suspense — иначе страница не пререндерится.
 */
export function Catalog({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogView products={products} />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
      <div className="skeleton hidden h-96 rounded-md lg:col-span-3 lg:block" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="skeleton h-64 rounded-md" />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";

import { Catalog } from "@/components/Catalog";
import { Breadcrumbs, Container } from "@/components/ui";
import { products, sections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог промышленной автоматики: КИП и датчики, приводная техника, контроллеры и панели оператора, электрооборудование, насосы, пневматика.",
};

/**
 * Каталог — это выдача с фильтром, и ничего кроме неё.
 * Плитка разделов со списками подгрупп отсюда убрана: те же ссылки открывает
 * кнопка «Каталог» в шапке, а на странице они отодвигали товары на второй
 * экран.
 */
export default function CatalogPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Каталог" }]}
      />

      <h1 className="h1">Каталог</h1>
      <p className="mt-2 mb-8 max-w-[68ch] text-ink-2">
        {products.length} позиций в {sections.length} разделах — всё со склада
        в Москве.
      </p>

      <Catalog products={products} />
    </Container>
  );
}

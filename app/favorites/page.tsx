"use client";

import { ProductGrid } from "@/components/ProductCard";
import { Breadcrumbs, ButtonLink, Container, Empty } from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function FavoritesPage() {
  const { favorites, ready } = useStore();
  const items = favorites.flatMap((slug) => {
    const product = getProduct(slug);
    return product ? [product] : [];
  });

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Избранное" }]}
      />

      <h1 className="mb-8 h1">Избранное</h1>

      {!ready ? (
        <div className="skeleton h-64 rounded-md" />
      ) : items.length > 0 ? (
        <ProductGrid products={items} />
      ) : (
        <>
          <Empty
            title="Пока пусто"
            hint="Отмеченные позиции соберутся здесь."
          />
          <div className="mt-4">
            <ButtonLink href="/catalog">В каталог</ButtonLink>
          </div>
        </>
      )}
    </Container>
  );
}

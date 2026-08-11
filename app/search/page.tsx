import type { Metadata } from "next";

import Link from "next/link";

import { Catalog } from "@/components/Catalog";
import popularQueries from "@/content/popular-queries.json";
import { Breadcrumbs, ButtonLink, Container, Empty } from "@/components/ui";
import { searchProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Поиск",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  const found = searchProducts(query);

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Поиск" }]}
      />

      <h1 className="h1">{query ? `Поиск: ${query}` : "Поиск по каталогу"}</h1>

      {query && (
        <p className="mt-2 text-ink-2">
          {found.length} {plural(found.length, "позиция", "позиции", "позиций")}
        </p>
      )}

      <div className="mt-8">
        {found.length > 0 ? (
          <Catalog products={found} />
        ) : (
          <>
            <Empty
              title={query ? "Ничего не нашлось" : "Введите запрос"}
              hint="Искать можно по названию, коду позиции, производителю и номиналу — например «Ду 50» или «Promag»."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/catalog">В каталог</ButtonLink>
                  <ButtonLink href="/contacts" variant="secondary">
                    Прислать список на просчёт
                  </ButtonLink>
                </div>
              }
            />

            <p className="mt-6 text-sm text-ink-2">
              Часто ищут:{" "}
              {(popularQueries as string[]).slice(0, 4).map((item, index) => (
                <span key={item}>
                  {index > 0 && ", "}
                  <Link
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="text-accent transition-colors hover:text-accent-hover"
                  >
                    {item}
                  </Link>
                </span>
              ))}
            </p>
          </>
        )}
      </div>
    </Container>
  );
}

"use client";

import Link from "next/link";

import { AddToCart } from "@/components/CartActions";
import { Close } from "@/components/icons";
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  Empty,
  Price,
  Thumb,
  Stock,
} from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { clearCompare, toggleCompare, useStore } from "@/lib/store";

export default function ComparePage() {
  const { compare, ready } = useStore();
  const items = compare.flatMap((slug) => {
    const product = getProduct(slug);
    return product ? [product] : [];
  });

  // Ряды таблицы — объединение характеристик всех колонок: у автомата
  // и у частотника наборы разные, и «прочерк» — тоже ответ.
  const rows = [
    ...new Set(items.flatMap((product) => Object.keys(product.specs))),
  ];
  const differing = new Set(
    rows.filter(
      (row) =>
        new Set(items.map((product) => product.specs[row] ?? "—")).size > 1,
    ),
  );

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Сравнение" }]}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="h1">Сравнение</h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="text-sm text-ink-3 transition-colors hover:text-danger"
          >
            Очистить сравнение
          </button>
        )}
      </div>

      {!ready ? (
        <div className="skeleton mt-8 h-64 rounded-md" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <Empty
            title="Нечего сравнивать"
            hint="Отметьте в каталоге до четырёх позиций."
            action={<ButtonLink href="/catalog">В каталог</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-base">
            <thead>
              <tr>
                <th className="w-48 p-3 text-left align-top font-normal text-ink-3">
                  Характеристика
                </th>
                {items.map((product) => (
                  <th
                    key={product.slug}
                    className="h-full w-64 p-3 text-left align-top font-normal"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Thumb
                        product={product}
                        className="h-20 w-28"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCompare(product.slug)}
                        aria-label="Убрать из сравнения"
                        className="flex size-8 items-center justify-center text-ink-3 transition-colors hover:text-danger"
                      >
                        <Close className="size-4" />
                      </button>
                    </div>
                    <p className="mt-2 flex items-baseline gap-2 text-xs text-ink-3">
                      <span className="font-medium text-ink-2">
                        {product.brand}
                      </span>
                      <span className="font-mono">{product.article}</span>
                    </p>
                    {/* Высоту ячейки таблица внутрь не пробрасывает, поэтому
                        колонки выравниваются одинаковой высотой названия
                        и строки с ценой: иначе кнопки стоят вразнобой. */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-1 line-clamp-2 block h-12 text-base font-medium leading-6 transition-colors hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-2 flex h-6 items-center gap-3 overflow-hidden">
                      <Price value={product.price} />
                      <Stock inStock={product.inStock} />
                    </div>
                    <AddToCart slug={product.slug} className="mt-3 w-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row}
                  className={
                    differing.has(row)
                      ? "border-t border-line bg-accent-soft"
                      : "border-t border-line"
                  }
                >
                  <th
                    scope="row"
                    className="p-3 text-left align-top font-normal text-ink-2"
                  >
                    {row}
                  </th>
                  {items.map((product) => (
                    <td key={product.slug} className="p-3 align-top font-mono">
                      {product.specs[row] ?? (
                        <span className="text-ink-3">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

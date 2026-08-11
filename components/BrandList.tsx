"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { Plus, Search } from "@/components/icons";
import { plural } from "@/lib/format";

/** Сколько марок видно сразу: две строки на широком экране. */
const VISIBLE = 12;

type Brand = { name: string; count: number };

/**
 * Список производителей. Полный перечень — под сотню марок, и открытым
 * он занимал экран целиком. Первые двенадцать (самые крупные по числу
 * позиций) видны сразу, остальные — за `<details>`: раскрытие без JS,
 * с клавиатуры работает так же, как мышью.
 */
export function BrandList({ brands }: { brands: Brand[] }) {
  const [query, setQuery] = useState("");
  const fieldId = useId();

  const needle = query.trim().toLowerCase();
  const head = [...brands].sort((a, b) => b.count - a.count).slice(0, VISIBLE);
  const headNames = new Set(head.map((brand) => brand.name));
  const rest = brands.filter((brand) => !headNames.has(brand.name));

  // Пока в поле пусто — двенадцать крупнейших марок и раскрытие. Как только
  // начали печатать, деление на «первые» и «остальные» теряет смысл:
  // показываем всё, что подошло, одним списком.
  if (needle) {
    const found = brands.filter((brand) =>
      brand.name.toLowerCase().includes(needle),
    );
    return (
      <div className="border-t border-line pt-6">
        <BrandSearch id={fieldId} value={query} onChange={setQuery} />
        {found.length > 0 ? (
          <div className="mt-4">
            <BrandRow brands={found} />
          </div>
        ) : (
          <p className="mt-4 text-base text-ink-2">
            Такой марки в каталоге нет. Напишите — привезём под заказ.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-line pt-6">
      <BrandSearch id={fieldId} value={query} onChange={setQuery} />
      <div className="mt-4">
        <BrandRow
          brands={[...head].sort((a, b) => a.name.localeCompare(b.name, "ru"))}
        />
      </div>

      {rest.length > 0 && (
        <details className="group mt-5 border-t border-line pt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-base text-accent transition-colors hover:text-accent-hover">
            <Plus className="size-4 transition-transform duration-150 group-open:rotate-45" />
            <span className="group-open:hidden">
              Ещё {rest.length}{" "}
              {plural(rest.length, "производитель", "производителя", "производителей")}
            </span>
            <span className="hidden group-open:inline">Свернуть</span>
          </summary>
          <div className="mt-4">
            <BrandRow brands={rest} />
          </div>
        </details>
      )}
    </div>
  );
}

/** Поле отбора: девяносто четыре марки глазами не просмотреть. */
function BrandSearch({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative max-w-xs">
      <label htmlFor={id} className="sr-only">
        Поиск по производителям
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Найти производителя"
        className="h-11 w-full rounded-md border border-line bg-page pl-9 pr-3 text-base outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-accent"
      />
    </div>
  );
}

function BrandRow({ brands }: { brands: Brand[] }) {
  return (
    <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
      {brands.map((brand) => (
        <li key={brand.name}>
          <Link
            href={`/catalog?brand=${encodeURIComponent(brand.name)}`}
            className="group/brand inline-flex items-baseline gap-2 text-xl transition-colors duration-150 hover:text-accent"
          >
            {brand.name}
            <span className="font-mono text-xs text-ink-3 transition-colors group-hover/brand:text-accent">
              {brand.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

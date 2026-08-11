"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Search } from "@/components/icons";
import { getProduct, searchProducts } from "@/lib/catalog";
import { useStore } from "@/lib/store";

/**
 * Поиск с подсказками. Стоит и в шапке, и в первом экране: это главное поле
 * сайта, и вводить артикул вслепую, чтобы попасть на страницу выдачи, —
 * лишний шаг. `size="lg"` — вариант для первого экрана.
 */
export function SearchBox({ size = "md" }: { size?: "md" | "lg" }) {
  const router = useRouter();
  // Поиск в шапке рендерится дважды (мобильная строка и десктопная) —
  // id должен быть свой, иначе label указывает не на то поле.
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { viewed, ready } = useStore();

  // Пустое поле показывает то, что уже смотрели: подбор у снабженца
  // растянут на несколько заходов, и это его закладка.
  const recent =
    ready && focused && query.trim().length < 2
      ? viewed
          .flatMap((slug) => {
            const product = getProduct(slug);
            return product ? [product] : [];
          })
          .slice(0, 5)
      : [];
  const hits =
    focused && query.trim().length > 1
      ? searchProducts(query).slice(0, 6)
      : recent;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setFocused(false);
      }}
      className={`relative flex-1 ${size === "lg" ? "text-base" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setFocused(false);
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        Поиск по сайту
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Название, производитель или номинал"
        className={`w-full rounded-md border border-line text-base outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-accent ${
          size === "lg"
            ? // В первом экране поле стоит на фотографии: серая заливка
              // и смена фона по фокусу читались как подсветка ошибки.
              "h-12 bg-page pl-4 pr-28"
            : "h-11 bg-surface pl-4 pr-24 focus:bg-page"
        }`}
      />
      <button
        type="submit"
        aria-label="Найти"
        className={`absolute right-1 inline-flex items-center gap-2 rounded-md bg-accent font-medium text-white transition-colors duration-150 hover:bg-accent-hover ${
          size === "lg"
            ? "top-1 h-10 px-4 text-base sm:px-6"
            : "top-1 h-9 px-3 text-sm sm:px-4"
        }`}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Найти</span>
      </button>

      {hits.length > 0 && (
        <ul
          aria-live="polite"
          aria-label={hits === recent ? "Недавно просмотренные" : "Подсказки поиска"}
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-line bg-page shadow-[0_8px_24px_rgba(22,32,43,0.12)] animate-drop"
        >
          {hits === recent && (
            <li className="border-b border-line px-4 py-2 text-xs uppercase tracking-[0.08em] text-ink-3">
              Вы недавно смотрели
            </li>
          )}
          {hits.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/product/${product.slug}`}
                className="block border-b border-line px-4 py-2.5 last:border-0 transition-colors hover:bg-surface"
              >
                <span className="block text-sm">{product.name}</span>
                <span className="mt-0.5 block font-mono text-xs text-ink-3">
                  {product.article} · {product.params.join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}


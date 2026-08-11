"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ProductGrid } from "@/components/ProductCard";
import { ChevronDown, Close } from "@/components/icons";
import { Button, Chip, Empty, Select } from "@/components/ui";
import { money, plural } from "@/lib/format";
import { deleteFilter, saveFilter, useStore } from "@/lib/store";
import {
  buildFacets,
  facetDefs,
  filterProducts,
  sortOptions,
  sortProducts,
  type Product,
  type Selection,
  type SortValue,
} from "@/lib/catalog";

const PER_PAGE = 24;
const VISIBLE_VALUES = 5;

function parseSelection(params: URLSearchParams): Selection {
  const selection: Selection = {};
  for (const def of facetDefs) {
    const value = params.get(def.param);
    if (value) selection[def.param] = value.split("|");
  }
  const price = params.get("price");
  if (price) selection.price = [price];
  return selection;
}

export function CatalogView({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [savingFilter, setSavingFilter] = useState(false);
  const { filters, ready } = useStore();

  const selection = useMemo(
    () => parseSelection(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const sort = (searchParams.get("sort") as SortValue) ?? "popular";

  const facets = useMemo(
    () => buildFacets(products, selection),
    [products, selection],
  );
  const filtered = useMemo(
    () => filterProducts(products, selection),
    [products, selection],
  );
  // Страница живёт в адресе: на вторую страницу можно дать ссылку,
  // и поисковик её видит — «показать ещё» этого не умеет.
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(searchParams.get("page")) || 1));
  const visible = useMemo(
    () => sortProducts(filtered, sort).slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, sort, page],
  );

  const selectedCount = Object.values(selection).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  /** Фильтры живут в URL: ссылку можно переслать, а поисковик — проиндексировать. */
  function update(next: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    next(params);
    params.delete("page"); // смена фильтра всегда возвращает на первую страницу
    router.replace(params.size ? `?${params}` : "?", { scroll: false });
  }

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    router.replace(params.size ? `?${params}` : "?", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleValue(param: string, value: string) {
    update((params) => {
      const current = params.get(param)?.split("|") ?? [];
      const nextValues = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      if (nextValues.length) params.set(param, nextValues.join("|"));
      else params.delete(param);
    });
  }

  const filterPanel = (
    <div className="space-y-6">
      <PriceRange
        value={selection.price?.[0] ?? ""}
        onChange={(next) =>
          update((params) => {
            if (next) params.set("price", next);
            else params.delete("price");
          })
        }
      />

      {facets.map((facet) => (
        <FacetBlock
          key={facet.param}
          facet={facet}
          selected={selection[facet.param] ?? []}
          onToggle={(value) => toggleValue(facet.param, value)}
        />
      ))}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 pr-2">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Фильтр</h2>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  update((params) => {
                    facetDefs.forEach((def) => params.delete(def.param));
                    params.delete("price");
                  })
                }
                className="text-sm text-accent transition-colors hover:text-accent-hover"
              >
                Сбросить
              </button>
            )}
          </div>
          {filterPanel}

          {/* Сохранённые наборы параметров: снабженец ищет одно и то же
              из месяца в месяц, и собирать фильтр заново — потерянное время. */}
          <div className="mt-8 border-t border-line pt-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.04em] text-ink-3">
              Мои параметры
            </h3>

            {ready && filters.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {filters.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(item.path)}
                      className="min-h-9 text-left text-accent transition-colors hover:text-accent-hover"
                    >
                      {item.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFilter(item.id)}
                      aria-label={`Удалить набор «${item.name}»`}
                      className="flex size-8 shrink-0 items-center justify-center text-ink-3 transition-colors hover:text-danger"
                    >
                      <Close className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedCount === 0 ? (
              <p className="mt-2 text-sm text-ink-2">
                Отметьте параметры — набор можно будет сохранить.
              </p>
            ) : savingFilter ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = searchParams.toString();
                  saveFilter(
                    filterName.trim() || "Набор параметров",
                    query ? `${pathname}?${query}` : pathname,
                  );
                  setFilterName("");
                  setSavingFilter(false);
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  value={filterName}
                  onChange={(event) => setFilterName(event.target.value)}
                  placeholder="Автоматы 16 А"
                  aria-label="Название набора параметров"
                  className="h-11 min-w-0 flex-1 rounded-md border border-line bg-page px-3 text-base outline-none transition-colors focus:border-accent"
                />
                <Button type="submit" variant="secondary" className="px-4">
                  Сохранить
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSavingFilter(true)}
                className="mt-2 min-h-9 text-sm text-accent transition-colors hover:text-accent-hover"
              >
                Сохранить текущий набор
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink-2">
            Найдено{" "}
            <span className="font-medium text-ink">
              <AnimatedNumber value={filtered.length} />
            </span>{" "}
            {plural(filtered.length, "позиция", "позиции", "позиций")}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="sort">
              Сортировка
            </label>
            <Select
              id="sort"
              value={sort}
              onChange={(event) =>
                update((params) =>
                  event.target.value === "popular"
                    ? params.delete("sort")
                    : params.set("sort", event.target.value),
                )
              }
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-4 text-sm lg:hidden"
            >
              Фильтр
              {selectedCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 font-mono text-xs text-white">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {Object.entries(selection).flatMap(([param, values]) =>
              values.map((value) => (
                <button
                  key={`${param}-${value}`}
                  type="button"
                  onClick={() =>
                    param === "price"
                      ? update((params) => params.delete("price"))
                      : toggleValue(param, value)
                  }
                  className="transition-opacity hover:opacity-80"
                >
                  <Chip>
                    {param === "price" ? priceLabel(value) : value}
                    <Close className="size-3.5" />
                  </Chip>
                </button>
              )),
            )}
            <button
              type="button"
              onClick={() =>
                update((params) => {
                  facetDefs.forEach((def) => params.delete(def.param));
                  params.delete("price");
                })
              }
              className="text-sm text-ink-3 transition-colors hover:text-accent"
            >
              Сбросить всё
            </button>
          </div>
        )}

        {visible.length > 0 ? (
          <ProductGrid products={visible} />
        ) : (
          <Empty
            title="Под такие параметры ничего не подошло"
            hint="Снимите часть фильтров или напишите нам — подберём аналог."
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  update((params) => {
                    facetDefs.forEach((def) => params.delete(def.param));
                    params.delete("price");
                  })
                }
              >
                Сбросить фильтры
              </Button>
            }
          />
        )}

        {pages > 1 && (
          <nav
            aria-label="Страницы каталога"
            className="mt-8 flex items-center justify-center gap-1 sm:gap-2"
          >
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              className="px-4"
            >
              Назад
            </Button>
            {pageNumbers(page, pages).map((item, index) =>
              item === null ? (
                <span
                  key={`gap-${index}`}
                  aria-hidden
                  className="px-1 text-ink-3"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => goToPage(item)}
                  className={`min-h-11 min-w-11 rounded-md px-3 text-base transition-colors duration-150 ${
                    item === page
                      ? "bg-accent text-white"
                      : "text-ink-2 hover:text-accent"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            <Button
              variant="secondary"
              disabled={page === pages}
              onClick={() => goToPage(page + 1)}
              className="px-4"
            >
              Вперёд
            </Button>
          </nav>
        )}
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-page lg:hidden animate-drop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-xl font-semibold">Фильтр</h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex size-11 items-center justify-center text-ink-2 transition-colors hover:text-accent"
              aria-label="Закрыть фильтр"
            >
              <Close />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">{filterPanel}</div>
          <div className="flex gap-3 border-t border-line px-4 py-3">
            <Button
              variant="secondary"
              onClick={() =>
                update((params) => {
                  facetDefs.forEach((def) => params.delete(def.param));
                  params.delete("price");
                })
              }
            >
              Сбросить
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Показать {filtered.length}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FacetBlock({
  facet,
  selected,
  onToggle,
}: {
  facet: {
    param: string;
    label: string;
    values: { value: string; count: number }[];
  };
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(true);
  const values = expanded
    ? facet.values
    : facet.values.slice(0, VISIBLE_VALUES);
  const hidden = facet.values.length - values.length;

  return (
    <div>
      {/* Фасет сворачивается: их до одиннадцати, и в развёрнутом виде колонка
          фильтра длиннее выдачи — до нижних параметров приходилось скроллить
          мимо всех верхних. Выбранные значения в заголовке видно и свёрнутым. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-1 text-left text-xs font-medium uppercase tracking-[0.04em] text-ink-3 transition-colors hover:text-accent"
      >
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-150 ${
            open ? "" : "-rotate-90"
          }`}
        />
        <span className="flex-1">{facet.label}</span>
        {!open && selected.length > 0 && (
          <span className="font-mono normal-case text-accent">
            {selected.length}
          </span>
        )}
      </button>

      {!open ? null : (
        <>
      <ul className="mt-1">
        {values.map((item) => (
          <li key={item.value}>
            <label
              className={`flex min-h-9 items-center gap-2.5 text-base ${
                item.count === 0 && !selected.includes(item.value)
                  ? "cursor-not-allowed text-ink-3"
                  : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(item.value)}
                disabled={item.count === 0 && !selected.includes(item.value)}
                onChange={() => onToggle(item.value)}
                className="size-4 accent-[var(--color-accent)]"
              />
              <span className="flex-1">{item.value}</span>
              <span className="font-mono text-xs text-ink-3">{item.count}</span>
            </label>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 flex min-h-11 items-center text-base text-accent transition-colors hover:text-accent-hover sm:min-h-0 sm:text-sm"
        >
          Показать ещё {hidden}
        </button>
      )}
        </>
      )}
    </div>
  );
}

/**
 * Номера страниц для одной строки: первая, последняя, текущая с соседями,
 * между ними — многоточие. Восемьдесят кнопок подряд занимали пять строк
 * и всё равно не помогали: на 40-ю страницу никто не ходит прицельно.
 */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const around = [current - 1, current, current + 1].filter(
    (item) => item > 1 && item < total,
  );
  const shown = [1, ...around, total];

  const result: (number | null)[] = [];
  for (const [index, item] of shown.entries()) {
    if (index > 0 && item - shown[index - 1] > 1) result.push(null);
    result.push(item);
  }
  return result;
}

/** «1000-50000» → «от 1 000 ₽ до 50 000 ₽» для чипа над выдачей. */
function priceLabel(value: string): string {
  const [min, max] = value.split("-");
  const parts = [];
  if (Number(min) > 0) parts.push(`от ${money(Number(min))}`);
  if (Number(max) > 0) parts.push(`до ${money(Number(max))}`);
  return parts.join(" ") || "Цена";
}

/**
 * Диапазон цены. Границы уезжают в адрес одним параметром «мин-макс»,
 * поэтому ссылку на подборку можно отправить коллеге целиком.
 */
function PriceRange({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [min = "", max = ""] = value.split("-");
  const set = (nextMin: string, nextMax: string) => {
    const clean = (raw: string) => raw.replace(/\D/g, "");
    const result = `${clean(nextMin)}-${clean(nextMax)}`;
    onChange(result === "-" ? "" : result);
  };

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.04em] text-ink-3">
        Цена, ₽
      </legend>
      <div className="flex items-center gap-2">
        <input
          inputMode="numeric"
          value={min === "0" ? "" : min}
          onChange={(event) => set(event.target.value, max)}
          placeholder="от"
          aria-label="Цена от"
          className="h-11 w-full min-w-0 rounded-md border border-line bg-page px-3 text-base tabular outline-none transition-colors duration-150 focus:border-accent"
        />
        <span aria-hidden className="text-ink-3">
          —
        </span>
        <input
          inputMode="numeric"
          value={max === "0" ? "" : max}
          onChange={(event) => set(min, event.target.value)}
          placeholder="до"
          aria-label="Цена до"
          className="h-11 w-full min-w-0 rounded-md border border-line bg-page px-3 text-base tabular outline-none transition-colors duration-150 focus:border-accent"
        />
      </div>
    </fieldset>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Bell, Compare, Copy, Heart, Minus, Plus } from "@/components/icons";
import { Button } from "@/components/ui";
import { money } from "@/lib/format";
import {
  COMPARE_LIMIT,
  addToCart,
  rememberViewed,
  toggleCompare,
  toggleFavorite,
  useStore,
} from "@/lib/store";
import { FORMS_ARE_MOCKED } from "@/lib/site";

/** Кнопка «В корзину» с коротким подтверждением вместо всплывашки. */
export function AddToCart({
  slug,
  qty = 1,
  className = "",
  variant = "primary",
}: {
  slug: string;
  qty?: number;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        addToCart(slug, qty);
        setAdded(true);
      }}
    >
      {added ? "Добавлено" : "В корзину"}
    </Button>
  );
}

/**
 * «Купить» — та же корзина, но сразу к оформлению: снабженцу, который берёт
 * одну позицию, лишний заход в корзину не нужен.
 */
export function BuyNow({
  slug,
  qty = 1,
  className = "",
}: {
  slug: string;
  qty?: number;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className={className}
      onClick={() => {
        addToCart(slug, qty);
        router.push("/checkout");
      }}
    >
      Купить
    </Button>
  );
}

export function FavoriteButton({
  slug,
  withLabel = false,
}: {
  slug: string;
  withLabel?: boolean;
}) {
  const { favorites, ready } = useStore();
  const active = ready && favorites.includes(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm transition-colors duration-150 ${
        withLabel ? "px-3" : "w-11"
      } ${active ? "text-accent" : "text-ink-3 hover:text-accent"}`}
    >
      <Heart filled={active} />
      {withLabel && <span>{active ? "В избранном" : "В избранное"}</span>}
    </button>
  );
}

/** Блок покупки в карточке товара: количество, корзина, избранное. */
export function BuyBlock({ slug, unit }: { slug: string; unit: string }) {
  const [qty, setQty] = useState(1);

  return (
    <div id="buy-block" className="flex flex-wrap items-center gap-3">
      <QtyInput
        value={qty}
        onChange={(next) => setQty(Math.max(1, next))}
        unit={unit}
      />
      <AddToCart
        slug={slug}
        qty={qty}
        className="min-w-40 flex-1 sm:flex-none"
      />
      <FavoriteButton slug={slug} withLabel />
    </div>
  );
}

export function QtyInput({
  value,
  onChange,
  unit,
}: {
  value: number;
  onChange: (next: number) => void;
  unit: string;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-line">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Уменьшить количество"
        className="flex size-11 items-center justify-center text-ink-2 transition-colors hover:text-accent"
      >
        <Minus className="size-4" />
      </button>
      <label className="sr-only" htmlFor={`qty-${unit}-${value}`}>
        Количество
      </label>
      <input
        id={`qty-${unit}-${value}`}
        type="number"
        min={1}
        value={value}
        onChange={(event) =>
          onChange(Number.parseInt(event.target.value, 10) || 1)
        }
        className="h-11 w-14 border-x border-line text-center text-base outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Увеличить количество"
        className="flex size-11 items-center justify-center text-ink-2 transition-colors hover:text-accent"
      >
        <Plus className="size-4" />
      </button>
      <span className="px-3 text-sm text-ink-3">{unit}</span>
    </div>
  );
}

/**
 * Артикул копируется одним нажатием: снабженец переносит его в заявку
 * или в 1С, а не выделяет мышью по буквам.
 */
export function CopyArticle({ article }: { article: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(article).then(
          () => setCopied(true),
          () => setCopied(false),
        );
      }}
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 transition-colors duration-150 hover:text-accent"
      aria-label={`Скопировать артикул ${article}`}
      title={copied ? "Скопировано" : "Скопировать артикул"}
    >
      {article}
      <Copy
        className={`size-3.5 transition-opacity duration-150 ${
          copied
            ? "text-ok opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
        }`}
      />
    </button>
  );
}

/**
 * Липкая полоса покупки на мобильном. Появляется, когда основной блок
 * покупки уехал за экран, — иначе с длинной страницы приходится
 * возвращаться наверх ради одной кнопки.
 */
export function StickyBuyBar({
  product,
}: {
  product: { slug: string; unit: string; price: number; params: string[] };
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("buy-block");
    if (!anchor || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-ink-3">
            {product.params.join(" · ")}
          </p>
          <p className="tabular text-sm font-medium">{money(product.price)}</p>
        </div>
        <AddToCart slug={product.slug} className="px-6" />
      </div>
    </div>
  );
}

/** Запоминает просмотренную позицию: она всплывёт в подсказках поиска. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    rememberViewed(slug);
  }, [slug]);
  return null;
}

/** Добавить позицию в сравнение. Больше четырёх колонок в таблицу не влезает. */
export function CompareButton({
  slug,
  withLabel = false,
}: {
  slug: string;
  withLabel?: boolean;
}) {
  const { compare, ready } = useStore();
  const active = ready && compare.includes(slug);
  const full = ready && !active && compare.length >= COMPARE_LIMIT;

  return (
    <button
      type="button"
      onClick={() => toggleCompare(slug)}
      disabled={full}
      aria-pressed={active}
      title={full ? `В сравнении уже ${COMPARE_LIMIT} позиции` : undefined}
      aria-label={active ? "Убрать из сравнения" : "Добавить к сравнению"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:text-ink-3 ${
        withLabel ? "px-3" : "w-11"
      } ${active ? "text-accent" : "text-ink-3 hover:text-accent"}`}
    >
      <Compare className="size-5" />
      {withLabel && <span>{active ? "В сравнении" : "Сравнить"}</span>}
    </button>
  );
}

/**
 * Заявка на поступление для позиций под заказ. Отправка отключена, как
 * и у остальных форм: почтового канала у проекта пока нет.
 */
export function RestockNotify({ article }: { article: string }) {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <p className="mt-4 rounded-md bg-surface px-4 py-3 text-sm text-ink-2">
        Сообщим, когда {article} появится в наличии.
        {FORMS_ARE_MOCKED && " Демо-режим: письмо никуда не отправлено."}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (contact.trim().length < 5) {
          setError("Телефон или почта для ответа");
          return;
        }
        setError("");
        setSent(true);
      }}
      className="mt-4"
    >
      <label
        htmlFor="restock"
        className="mb-1.5 flex items-center gap-2 text-sm text-ink-2"
      >
        <Bell className="size-4" />
        Сообщить о поступлении
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="restock"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Телефон или почта"
          className="h-11 min-w-52 flex-1 rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 focus:border-accent"
        />
        <Button type="submit" variant="secondary">
          Сообщить
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </form>
  );
}

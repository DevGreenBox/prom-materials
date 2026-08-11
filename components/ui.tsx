import Image from "next/image";
import Link from "next/link";

import { ArrowRight, ChevronDown } from "@/components/icons";
import type { Product } from "@/lib/catalog";
import { money } from "@/lib/format";

/**
 * Единственный контейнер сайта. Модуль макета: 1440 — поля 100 — контент 1240,
 * 12 колонок по 85 с жёлобом 20. Шире 1440 ничего не растягиваем, поля
 * сжимаются на узких экранах, чтобы колонка не схлопывалась.
 */
export function Container({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-[100px] ${className}`}
    >
      {children}
    </div>
  );
}

/** Сетка макета: 12 колонок, жёлоб 20. */
export function Grid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-x-5 lg:grid-cols-12 ${className}`}>
      {children}
    </div>
  );
}

const buttonStyles = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border border-line bg-page text-ink hover:border-accent hover:text-accent",
  ghost: "text-accent hover:text-accent-hover",
} as const;

type ButtonProps = {
  variant?: keyof typeof buttonStyles;
  className?: string;
  children: React.ReactNode;
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md px-5 text-base font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${buttonBase} ${buttonStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * Заголовок секции. Без надстрочников и без нумерации: номера блоков нужны
 * в схеме страницы, а на самой странице они ничего не сообщают читателю.
 */
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 className="h2">{children}</h2>
      {action}
    </div>
  );
}

/**
 * Параметрическая строка — главный приём дизайн-системы. Одинаковая
 * в карточке, поиске, корзине и накладной: те же слова, что и в фильтре.
 */
export function ParamLine({
  params,
  className = "",
}: {
  params: string[];
  className?: string;
}) {
  if (params.length === 0) return null;
  return (
    <p className={`font-mono text-sm leading-5 text-ink-2 ${className}`}>
      {params.join(" · ")}
    </p>
  );
}

/**
 * Наличие. Срок поставки не показываем: реальных сроков у нас нет,
 * а число на витрине читается как обещание.
 */
export function Stock({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm ${inStock ? "text-ok" : "text-warn"}`}
    >
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${inStock ? "bg-ok" : "bg-warn"}`}
      />
      {inStock ? "в наличии" : "под заказ"}
    </span>
  );
}

/**
 * Цена берётся из объявления и показывается как есть. Оптовая скидка
 * обсуждается отдельно, поэтому «от» и зачёркнутых старых цен здесь нет.
 */
export function Price({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <span
      className={
        large
          ? "tabular text-[28px] font-semibold leading-9 tracking-[-0.02em]"
          : "tabular whitespace-nowrap text-base font-medium"
      }
    >
      {money(value)}
    </span>
  );
}

/**
 * Шильдик вместо фотографии — для позиций, снимков которых у нас нет.
 * Пустой серый квадрат был бы самым дешёвым местом в макете, поэтому
 * показываем то, что у позиции есть: номинал крупной моноширинной строкой.
 * Занимает столько же места, сколько фотография, — сетка не разъезжается.
 */
export function Nameplate({
  product,
  className = "",
  compact = false,
}: {
  product: Pick<Product, "article" | "brand" | "params">;
  className?: string;
  compact?: boolean;
}) {
  const [main, ...rest] = product.params;
  // У части объявлений номиналов в названии нет. Тогда на шильдике стоит
  // производитель, а если и его нет — код позиции: обе строки настоящие.
  const primary = main ?? (product.brand || product.article);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 overflow-hidden rounded-md bg-surface px-2 text-center ${className}`}
    >
      <span
        className={`font-mono leading-tight text-ink ${compact ? "text-sm" : "text-xl"}`}
      >
        {primary}
      </span>
      {!compact && rest.length > 0 && (
        <span className="font-mono text-xs leading-tight text-ink-3">
          {rest.slice(0, 2).join(" · ")}
        </span>
      )}
    </div>
  );
}

/**
 * Маленькое превью для строк списков (корзина, сравнение, история просмотра):
 * первый снимок, а если снимков нет — шильдик. Галерея в такой размер
 * не помещается, да и переключать её там незачем.
 */
export function Thumb({
  product,
  className = "",
}: {
  product: Pick<Product, "images" | "name" | "article" | "brand" | "params">;
  className?: string;
}) {
  if (product.images.length === 0) {
    return <Nameplate product={product} className={className} compact />;
  }

  return (
    <div className={`relative overflow-hidden rounded-md bg-surface ${className}`}>
      <Image
        src={product.images[0]}
        alt={product.name}
        fill
        sizes="120px"
        className="object-contain"
      />
    </div>
  );
}

/**
 * Выпадающий список. Системную стрелку убираем и рисуем свою из общего
 * набора: у родной другая толщина и другая форма, и рядом с нашими иконками
 * она читалась как чужая деталь. Кегль и высота — как у остальных полей.
 */
export function Select({
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        {...rest}
        className="h-11 w-full appearance-none rounded-md border border-line bg-page pl-3 pr-10 text-base outline-none transition-colors duration-150 hover:border-accent focus:border-accent"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
      />
    </span>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; name: string }[];
}) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-5 text-base text-ink-3 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="font-mono text-xs text-ink-3">
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-accent"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-ink-2">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Ссылка «дальше»: стрелка из общего набора, а не символ с клавиатуры. */
export function MoreLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-1.5 text-base text-accent transition-colors duration-150 hover:text-accent-hover sm:min-h-0 sm:text-sm"
    >
      {children}
      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2.5 py-1 text-sm text-accent">
      {children}
    </span>
  );
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-surface px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {hint && (
        <p className="mx-auto mt-1 max-w-[52ch] text-sm text-ink-2">{hint}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

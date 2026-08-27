"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Burger,
  Cart,
  ChevronRight,
  Close,
  Compare,
  Heart,
  User,
} from "@/components/icons";
import { SearchBox } from "@/components/SearchBox";
import { Container, MoreLink } from "@/components/ui";
import { countIn, sections } from "@/lib/catalog";
import { DEMO_CATALOG, site } from "@/lib/site";
import { useStore } from "@/lib/store";

// ponytail: каталог и поиск работают по статическому JSON прямо в браузере.
// На 1882 позициях это ещё мгновенно; если ассортимент вырастет в разы,
// поиск и фильтрацию переносим на сервер (route handler + индекс).

/** Разделы сайта во второй строке шапки и в мобильном меню. */
const siteNav = [
  { href: "/catalog", name: "Каталог" },
  { href: "/delivery", name: "Доставка" },
  { href: "/payment", name: "Оплата" },
  { href: "/reviews", name: "Отзывы" },
  { href: "/about", name: "О компании" },
  { href: "/contacts", name: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Любая навигация закрывает меню: иначе панель висит поверх новой страницы.
  // Сравнение прямо в рендере вместо эффекта — без лишнего цикла перерисовки.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!menuOpen && !mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, mobileOpen]);

  return (
    <>
      {/* Демо-полоса не липкая: при прокрутке остаётся только поиск и меню. */}
      {DEMO_CATALOG && (
        <div className="no-print border-b border-line bg-surface text-ink-2">
          <Container className="flex min-h-8 flex-wrap items-center justify-center gap-2 py-1.5 text-center text-sm">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
              демо
            </span>
            <span className="sm:hidden">Демо-каталог</span>
            <span className="hidden sm:inline">
              Каталог демонстрационный — ждём ваш ассортимент
            </span>
          </Container>
        </div>
      )}

      <header className="no-print sticky top-0 z-50 border-b border-line bg-page/95 backdrop-blur">
        <Container className="flex h-16 items-center gap-2 min-[360px]:gap-3 lg:gap-5">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold leading-tight tracking-tight min-[360px]:text-xl"
          >
            Пром<span className="text-accent">-</span>Материалы
          </Link>

          <CatalogMenu open={menuOpen} setOpen={setMenuOpen} />

          <div className="hidden flex-1 lg:block">
            <SearchBox />
          </div>

          <a
            href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
            className="ml-auto hidden whitespace-nowrap font-medium transition-colors hover:text-accent xl:block"
          >
            {site.phone}
          </a>

          <nav className="ml-auto flex items-center gap-1 xl:ml-4">
            <IconLink
              href="/favorites"
              label="Избранное"
              counter="favorites"
              className="hidden sm:flex"
            >
              <Heart />
            </IconLink>
            <IconLink
              href="/compare"
              label="Сравнение"
              counter="compare"
              className="hidden sm:flex"
            >
              <Compare />
            </IconLink>
            <IconLink href="/cart" label="Корзина" counter="cart">
              <Cart />
            </IconLink>
            <IconLink href="/account" label="Кабинет">
              <User />
            </IconLink>

            {/* Бургер справа: телефон держат в правой руке, и до левого
                верхнего угла большим пальцем не дотянуться. */}
            <button
              type="button"
              aria-label="Меню"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink transition-colors hover:text-accent lg:hidden"
            >
              <Burger open={mobileOpen} />
            </button>
          </nav>
        </Container>

        {/* Вторая строка — разделы сайта, а не каталога: разделы каталога
            и так открываются кнопкой «Каталог» слева, и дублировать их
            строкой ниже значит показывать одно и то же дважды. */}
        <div className="hidden border-t border-line xl:block">
          <Container className="flex h-11 items-center gap-6 text-sm">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-2 transition-colors hover:text-accent"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/corporate" className="ml-auto font-medium text-accent">
              Оптом и юрлицам
            </Link>
          </Container>
        </div>

        <div className="border-t border-line lg:hidden">
          <Container className="py-2">
            <SearchBox />
          </Container>
        </div>

      </header>

      {/* Меню живёт вне <header>: у шапки backdrop-blur, а он делает элемент
          контейнером для position: fixed — панель внутри неё схлопывалась
          до высоты самой шапки. */}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}

/**
 * Каталог: наведение открывает окно с разделами, наведение на раздел —
 * его ассортимент справа. Клик работает так же (тач-устройства и клавиатура),
 * закрытие с задержкой, чтобы курсор успел дойти по диагонали.
 */
function CatalogMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [active, setActive] = useState(sections[0].slug);
  const closeTimer = useRef<number | undefined>(undefined);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const activeSection =
    sections.find((section) => section.slug === active) ?? sections[0];

  return (
    <div
      className="hidden lg:block"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="catalog-menu"
        aria-haspopup="true"
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onClick={() => setOpen(!open)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-base font-medium transition-colors duration-150 ${
          open
            ? "bg-accent-hover text-white"
            : "bg-accent text-white hover:bg-accent-hover"
        }`}
      >
        <Burger open={open} className="size-5" />
        Каталог
      </button>

      {open && (
        <div
          id="catalog-menu"
          className="absolute inset-x-0 top-full border-y border-line bg-page shadow-[0_8px_24px_rgba(22,32,43,0.12)] animate-drop"
        >
          <Container className="grid grid-cols-[300px_1fr]">
            <ul className="border-r border-line py-3">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={`/catalog/${section.slug}`}
                    onMouseEnter={() => setActive(section.slug)}
                    onFocus={() => setActive(section.slug)}
                    className={`flex items-center justify-between gap-3 py-2.5 pr-4 pl-1 text-base transition-colors duration-150 ${
                      section.slug === active
                        ? "text-accent"
                        : "text-ink hover:text-accent"
                    }`}
                  >
                    {section.name}
                    <ChevronRight className="size-4 text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>

            <div key={activeSection.slug} className="py-5 pl-8 animate-drop">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold">{activeSection.name}</h2>
                <MoreLink href={`/catalog/${activeSection.slug}`}>
                  Все {countIn({ section: activeSection.slug })} позиций
                </MoreLink>
              </div>
              <p className="mb-5 max-w-[64ch] text-sm text-ink-2">
                {activeSection.summary}
              </p>
              <ul className="grid grid-cols-3 gap-x-8 gap-y-1">
                {activeSection.groups.map((group) => (
                  <li key={group.slug}>
                    <Link
                      href={`/catalog/${activeSection.slug}/${group.slug}`}
                      className="flex items-baseline justify-between gap-2 py-1.5 text-base transition-colors duration-150 hover:text-accent"
                    >
                      {group.name}
                      <span className="font-mono text-xs text-ink-3">
                        {countIn({ group: group.slug })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

/**
 * Мобильное меню — панель справа, из-под той же кнопки, что её открывает.
 * Закрывается тапом по затемнению, крестиком и горизонтальным свайпом:
 * на телефоне закрыть панель пальцем быстрее, чем целиться в крестик.
 *
 * Строки крупные (48 px, кегль 16): в выпадающем списке из полусотни
 * ссылок мелкий текст не прочитать и не попасть по нему.
 */
function MobileMenu({ onClose }: { onClose: () => void }) {
  const startX = useRef<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(22,32,43,0.45)]"
      />

      <div
        className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-page animate-slide-in"
        onTouchStart={(event) => {
          startX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const from = startX.current;
          startX.current = null;
          if (from === null) return;
          if (Math.abs(event.changedTouches[0].clientX - from) > 60) onClose();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-base font-medium">Меню</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="-mr-2 flex size-11 items-center justify-center text-ink-2 transition-colors hover:text-accent"
          >
            <Close />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <ul>
            {sections.map((section) => (
              <li key={section.slug} className="border-b border-line">
                <Link
                  href={`/catalog/${section.slug}`}
                  onClick={onClose}
                  className="flex min-h-12 items-center justify-between gap-3 text-base font-medium"
                >
                  {section.name}
                  <span className="font-mono text-sm text-ink-3">
                    {countIn({ section: section.slug })}
                  </span>
                </Link>
                <ul className="pb-2">
                  {section.groups.map((group) => (
                    <li key={group.slug}>
                      <Link
                        href={`/catalog/${section.slug}/${group.slug}`}
                        onClick={onClose}
                        className="flex min-h-11 items-center text-base text-ink-2"
                      >
                        {group.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="mt-2 grid text-base">
            <Link
              href="/corporate"
              onClick={onClose}
              className="flex min-h-12 items-center font-medium text-accent"
            >
              Оптом и юрлицам
            </Link>
            {siteNav
              .filter((item) => item.href !== "/catalog")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-12 items-center"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </div>

        <a
          href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
          className="flex min-h-14 items-center justify-center gap-2 border-t border-line bg-surface text-base font-medium"
        >
          {site.phone}
        </a>
      </div>
    </div>
  );
}

function IconLink({
  href,
  label,
  counter,
  className = "",
  children,
}: {
  href: string;
  label: string;
  counter?: "cart" | "favorites" | "compare";
  className?: string;
  children: React.ReactNode;
}) {
  const { cartCount, favorites, compare, ready } = useStore();
  const counts = {
    cart: cartCount,
    favorites: favorites.length,
    compare: compare.length,
  };
  const count = !ready || !counter ? 0 : counts[counter];

  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 hover:text-accent ${className}`}
    >
      {children}
      {count > 0 && (
        <span className="absolute right-1 top-1 min-w-4 rounded-full bg-accent px-1 text-center font-mono text-[10px] leading-4 text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

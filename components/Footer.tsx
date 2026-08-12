import Link from "next/link";

import { Container } from "@/components/ui";
import { sections } from "@/lib/catalog";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Покупателю",
    links: [
      { href: "/delivery", name: "Доставка" },
      { href: "/payment", name: "Оплата" },
      { href: "/corporate", name: "Оптом и юрлицам" },
      { href: "/reviews", name: "Отзывы" },
      { href: "/account", name: "Личный кабинет" },
    ],
  },
  {
    title: "Компания",
    links: [
      { href: "/about", name: "О компании" },
      { href: "/contacts", name: "Контакты" },
      { href: "/offer", name: "Условия продажи" },
      { href: "/privacy", name: "Обработка данных" },
    ],
  },
];

/**
 * Подвал. Верхней границы у него нет: фон отделяет его от белой страницы сам,
 * а под блоком на таком же сером фоне (форма на главной) линия читалась швом.
 */
export function Footer() {
  return (
    <footer className="no-print bg-surface">
      <Container className="grid gap-x-5 gap-y-8 pb-10 pt-12 sm:grid-cols-2 lg:grid-cols-12 lg:pb-12 lg:pt-16 [&>*]:lg:col-span-3">
        <div>
          <p className="text-xl font-semibold">
            Пром<span className="text-accent">-</span>Материалы
          </p>
          <p className="mt-2 max-w-[32ch] text-sm text-ink-2">
            Промышленная автоматика и электрооборудование. Отгрузка физическим и
            юридическим лицам.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.04em] text-ink-3">
            Каталог
          </p>
          <ul className="space-y-0.5 text-base sm:space-y-1.5 sm:text-sm">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={`/catalog/${section.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.04em] text-ink-3">
              {column.title}
            </p>
            <ul className="space-y-0.5 text-base sm:space-y-1.5 sm:text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center transition-colors hover:text-accent sm:min-h-0"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {column.title === "Компания" && (
              <div className="mt-4 space-y-1 text-sm text-ink-2">
                <p>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
                    {site.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </p>
                <p>{site.hours}</p>
              </div>
            )}
          </div>
        ))}
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-ink-3">
          <p>
            {`© ${new Date().getFullYear()} ${site.legalName}. Реквизиты и контакты — демонстрационные.`}
          </p>
          <p>Сайт не является публичной офертой.</p>
        </Container>
      </div>
    </footer>
  );
}

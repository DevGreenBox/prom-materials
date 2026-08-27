import Image from "next/image";
import Link from "next/link";

import type { Section } from "@/lib/catalog";

export type SectionTile = {
  section: Section;
  count: number;
  image: string | null;
  Icon: (props: { className?: string }) => React.ReactNode;
};

/**
 * Разделы каталога плитками. Название и счётчик стоят на месте всегда,
 * а при наведении поверх нижней части плитки проявляется список подгрупп.
 *
 * Раньше плитка переворачивалась в 3D. От переворота пришлось отказаться:
 * в Safari `backface-visibility` в связке с вложенными трансформациями
 * не срабатывает, и лицевая надпись просвечивала сквозь оборот зеркально —
 * поверх названия проступало «ичиктад и ПИК». Проявление не полагается
 * на трёхмерность и ведёт себя одинаково во всех браузерах.
 *
 * Снимка раздела может не быть — тогда стоит знак из общего набора.
 * Файлы кладутся в `public/images/sections/<слаг>.webp` и подхватываются сами.
 */
export function SectionTiles({ tiles }: { tiles: SectionTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {tiles.map(({ section, count, image, Icon }) => (
        <div
          key={section.slug}
          className="group relative h-56 overflow-hidden rounded-md border border-line bg-surface transition-colors duration-150 hover:border-accent sm:h-64"
        >
          {/* Подложка: снимок раздела или знак в нижнем углу. */}
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 45vw, 300px"
              className="object-cover object-bottom transition-opacity duration-200 sm:group-hover:opacity-0"
            />
          ) : (
            <Icon className="pointer-events-none absolute bottom-4 right-4 size-16 text-accent transition-opacity duration-200 sm:group-hover:opacity-0" />
          )}

          {/* Клик по свободному месту плитки ведёт в раздел. */}
          <Link
            href={`/catalog/${section.slug}`}
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 z-10"
          />

          <Link
            href={`/catalog/${section.slug}`}
            className="absolute inset-x-4 top-4 z-30 block"
          >
            <span className="block hyphens-auto text-lg font-semibold leading-6 transition-colors group-hover:text-accent sm:text-xl sm:leading-7">
              {section.name}
            </span>
            <span className="mt-1 block font-mono text-sm text-ink-3">
              {count} позиций
            </span>
          </Link>

          {/* Подгруппы начинаются ниже заголовка — он остаётся на месте. */}
          <ul className="pointer-events-none absolute inset-x-0 bottom-0 top-[5.75rem] z-20 space-y-1 overflow-hidden bg-surface px-4 pb-4 text-base text-ink-2 opacity-0 transition-opacity duration-200 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100">
            {section.groups.slice(0, 5).map((group) => (
              <li key={group.slug} className="truncate">
                <Link
                  href={`/catalog/${section.slug}/${group.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

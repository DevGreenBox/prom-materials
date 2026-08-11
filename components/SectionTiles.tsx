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
 * Разделы каталога плитками. На широком экране плитка переворачивается
 * при наведении и показывает подгруппы: лицевая сторона отвечает «что это»,
 * оборот — «куда именно идти», и оба ответа занимают одно место.
 *
 * Переворот только там, где есть курсор. На тач-устройстве наведения нет,
 * поэтому плитка остаётся обычной ссылкой в раздел, а подгруппы там
 * открываются из меню.
 *
 * Снимка раздела может не быть — тогда на лицевой стороне стоит знак
 * из общего набора. Файлы кладутся в `public/images/sections/<слаг>.webp`
 * и подхватываются сами.
 */
export function SectionTiles({ tiles }: { tiles: SectionTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {tiles.map(({ section, count, image, Icon }) => (
        <div
          key={section.slug}
          className="group h-56 [perspective:1200px] sm:h-64"
        >
          <div className="relative size-full transition-transform duration-500 [transform-style:preserve-3d] group-focus-within:[transform:rotateY(180deg)] sm:group-hover:[transform:rotateY(180deg)]">
            {/* Лицевая сторона */}
            <Link
              href={`/catalog/${section.slug}`}
              className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-md border border-line bg-surface p-4 [backface-visibility:hidden]"
            >
              <span className="relative z-10">
                <span className="block text-xl font-semibold leading-7">
                  {section.name}
                </span>
                <span className="mt-1 block font-mono text-sm text-ink-3">
                  {count} позиций
                </span>
              </span>

              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover object-bottom"
                />
              ) : (
                <Icon className="size-16 self-end text-accent" />
              )}
            </Link>

            {/* Оборот */}
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-md border border-accent bg-page p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Link
                href={`/catalog/${section.slug}`}
                className="text-xl font-semibold leading-7 text-accent"
              >
                {section.name}
              </Link>
              <ul className="mt-2 space-y-1 overflow-hidden text-base text-ink-2">
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
          </div>
        </div>
      ))}
    </div>
  );
}

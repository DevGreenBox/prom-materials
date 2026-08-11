import { existsSync } from "node:fs";
import path from "node:path";

import Link from "next/link";

import popularQueriesData from "@/content/popular-queries.json";
import {
  DeliveryRates,
  WholesaleCalculator,
} from "@/components/Calculators";
import {
  Breaker,
  Cabinet,
  Cylinder,
  Drive,
  Gauge,
  Panel,
  Plus,
  Pump,
  Valve,
} from "@/components/icons";
import { FeaturedTabs } from "@/components/FeaturedTabs";
import { RequestForm } from "@/components/RequestForm";
import { SectionTiles } from "@/components/SectionTiles";
import { SearchBox } from "@/components/SearchBox";
import { Reviews } from "@/components/Reviews";
import { BrandList } from "@/components/BrandList";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Container, MoreLink, SectionTitle } from "@/components/ui";
import { site } from "@/lib/site";
import { countIn, products, sections } from "@/lib/catalog";

// Список лежит в content/, потому что его проверяет scripts/check-content.mjs:
// ссылка на главной не должна вести в пустую выдачу.
const popularQueries = popularQueriesData as string[];

// Производителя в названии объявления указывают не всегда — пустые
// значения в список не выводим.
const brands = [...new Set(products.map((product) => product.brand))]
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, "ru"))
  .map((brand) => ({
    name: brand,
    count: products.filter((product) => product.brand === brand).length,
  }));

const faq = [
  {
    q: "Работаете с юридическими лицами?",
    a: "Да. Счёт, накладная и УПД — в личном кабинете сразу после оформления.",
  },
  {
    q: "Позиции есть в наличии?",
    a: "Каталог собран из наших действующих объявлений: всё, что здесь опубликовано, есть в наличии.",
  },
  {
    q: "Можно подобрать аналог?",
    a: "Пришлите код позиции или параметры — подберём замену по номиналу и типу присоединения.",
  },
  {
    q: "Как считается доставка?",
    a: "По направлению: самовывоз, курьер по Москве и области, ТК в регионы. Расчёт — в корзине.",
  },
];

/** N позиций, равномерно разнесённых по списку. */
function spread<T>(list: T[], count: number): T[] {
  if (list.length <= count) return list;
  const step = list.length / count;
  return Array.from({ length: count }, (_, index) => list[Math.floor(index * step)]);
}

/**
 * Снимок раздела, если он лежит в public/images/sections. Проверяем файл
 * на сборке: пока изображений нет, плитки показывают знак из общего набора,
 * а как только файлы появятся — подхватятся сами, без правки кода.
 */
function sectionImage(slug: string): string | null {
  const file = `images/sections/${slug}.webp`;
  return existsSync(path.join(process.cwd(), "public", file)) ? `/${file}` : null;
}

/** Знак раздела. Ключи — слаги из content/catalog/sections.json. */
const sectionIcons: Record<string, (props: { className?: string }) => React.ReactNode> = {
  "kip-i-avtomatika": Gauge,
  "privodnaya-tehnika": Drive,
  "upravlenie-i-vizualizatsiya": Panel,
  elektrooborudovanie: Breaker,
  "armatura-i-privody": Valve,
  nasosy: Pump,
  pnevmatika: Cylinder,
  "prochee-oborudovanie": Cabinet,
};

export default function HomePage() {
  // Три среза одного каталога. Ни один не выдуман: наличие берётся из
  // объявления, цена и производитель — тоже. По шесть позиций: в сетке
  // из трёх колонок восемь оставляли дыру в последнем ряду.
  const inStock = products.filter((product) => product.inStock);
  const tabs = [
    { id: "sklad", label: "В наличии", products: inStock.slice(0, 6) },
    {
      id: "dostupnye",
      label: "До 30 000 ₽",
      // Берём восемь позиций, разнесённых по всему диапазону: подряд идущие
      // после сортировки все стоили ровно 30 000 и выглядели как ошибка.
      products: spread(
        inStock
          .filter((product) => product.price <= 30_000)
          .sort((a, b) => b.price - a.price),
        6,
      ),
    },
    {
      id: "kip",
      label: "КИП и датчики",
      products: inStock
        .filter((product) => product.section === "kip-i-avtomatika")
        .slice(0, 6),
    },
  ];

  return (
    <>
      {/*
        Первый экран: утверждение и поиск. Подбор по параметрам переехал
        в каталог — там он рядом с выдачей, которую меняет.
        TODO(client): первый экран заменяется на присланный референс.
      */}
      <section className="relative isolate border-b border-line bg-surface bg-right bg-no-repeat lg:bg-[url('/images/hero.webp')] lg:bg-cover">
        {/* Вуаль слева: фото светлое, но заголовок не должен зависеть от того,
            как кадр обрежется на конкретной ширине. На мобильном фона нет —
            в кадр попадала бы пустая часть, а вес грузился бы впустую. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-surface via-surface/80 to-transparent lg:block"
        />
        <Container className="relative grid items-end gap-x-5 gap-y-10 py-12 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-8">
            <h1 className="h1 max-w-[20ch]">
              Промышленная автоматика и электрооборудование
            </h1>
            <p className="lead mt-6">
              КИП и датчики, приводная техника, контроллеры и панели
              оператора, насосы, пневматика. Отгружаем в день заказа.
            </p>

            {/* Тот же поиск, что в шапке: с подсказками по мере ввода.
                Раньше здесь стояла форма без подсказок — главное поле сайта
                работало хуже, чем поле в шапке. */}
            <div className="mt-8 max-w-xl">
              <SearchBox size="lg" />
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-base text-ink-2 sm:gap-y-2 sm:text-sm">
              {popularQueries.map((query) => (
                <li key={query}>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="flex min-h-11 items-center underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent sm:min-h-0"
                  >
                    {query}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </Container>
      </section>

      {/* Разделы плитками: лицевая сторона отвечает «что это», оборот
          при наведении — «куда именно идти». Два ряда по четыре. */}
      <Container className="py-12 lg:py-16">
        <Reveal>
          <SectionTitle
            action={<MoreLink href="/catalog">Весь каталог</MoreLink>}
          >
            С чего начать подбор
          </SectionTitle>
        </Reveal>

        <SectionTiles
          tiles={sections.map((section) => ({
            section,
            count: countIn({ section: section.slug }),
            image: sectionImage(section.slug),
            Icon: sectionIcons[section.slug] ?? Cabinet,
          }))}
        />
      </Container>

      {/* Лента из каталога. Карусели здесь нет: горизонтальная лента прячет
          половину карточек за краем экрана, а под сеткой стоит прямой вход
          в каталог — там их все 1882. */}
      <Container className="py-12 lg:py-16">
        <Reveal>
          <SectionTitle>Нужный прибор в каталоге</SectionTitle>
        </Reveal>
        <FeaturedTabs tabs={tabs} />
        <div className="mt-8">
          <ButtonLink href="/catalog">В каталог</ButtonLink>
        </div>
      </Container>

      {/* Оптом и юрлицам — единственный цветной блок на странице. */}
      <Container className="pb-12 lg:pb-16">
        <Reveal>
          <div className="rounded-md bg-accent-soft p-6 lg:p-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
              <div className="lg:col-span-7">
                <h2 className="h2">Юрлицам: счёт и накладная без переписки</h2>
                <p className="mt-3 text-ink-2">
                  Реквизиты сохраняются один раз. Отгружаем самовывозом или
                  до терминала транспортной компании.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href="/corporate">Условия для юрлиц</ButtonLink>
                  <ButtonLink href="/cart" variant="secondary">
                    Запросить счёт
                  </ButtonLink>
                </div>
              </div>

              <WholesaleCalculator />
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Производители: список длинный, поэтому первые двенадцать открыты,
          остальные — за раскрывающейся строкой, чтобы блок не растягивал
          страницу на два экрана. */}
      <Container className="pb-12 lg:pb-16">
        <Reveal>
          <SectionTitle>Марки, с которыми работаем</SectionTitle>
          <BrandList brands={brands} />
        </Reveal>
      </Container>

      {/* Доставка и оплата — три колонки текста. */}
      <section className="border-y border-line bg-surface">
        <Container className="py-12 lg:py-16">
          <Reveal>
            <SectionTitle
              action={<MoreLink href="/delivery">Подробнее</MoreLink>}
            >
              Как получить и как оплатить
            </SectionTitle>
            <DeliveryRates />
          </Reveal>
        </Container>
      </section>

      {/* Отзывы настоящие, выгружаются скриптом. Полный список — на /reviews. */}
      <Container className="py-12 lg:py-16">
        <Reveal>
          <Reviews />
        </Reveal>
      </Container>

      {/* Частые вопросы — в два столбца: список короткий, и в одну колонку
          он растягивал страницу впустую. */}
      <Container className="py-12 lg:py-16">
        <Reveal>
          <SectionTitle
            action={
              <MoreLink href="/contacts">Не нашли ответ — спросите</MoreLink>
            }
          >
            Спрашивают чаще всего
          </SectionTitle>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <div className="divide-y divide-[var(--color-line)] border-y border-line">
              {faq.slice(0, Math.ceil(faq.length / 2)).map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <Plus className="size-4 shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 max-w-[68ch] text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
            <div className="divide-y divide-[var(--color-line)] border-y border-line max-sm:border-t-0">
              {faq.slice(Math.ceil(faq.length / 2)).map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <Plus className="size-4 shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 max-w-[68ch] text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Финальный блок — форма вопроса. Сценарий тот же (снабженец
          присылает список), но заголовок спрашивает, а не требует. */}
      <section className="border-t border-line bg-surface">
        <Container className="py-12 lg:py-16">
          <Reveal>
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
              <div className="lg:col-span-5">
                <SectionTitle>Появились вопросы?</SectionTitle>
                <p className="max-w-[46ch] text-ink-2">
                  Спросите про наличие, аналог или условия отгрузки. Можно
                  прислать список артикулов — посчитаем и вернёмся с ценой.
                </p>
                <p className="mt-4 text-ink-2">
                  Или сразу:{" "}
                  <a
                    href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                    className="font-medium text-ink"
                  >
                    {site.phone}
                  </a>
                  , {site.hours}
                </p>
              </div>

              <div className="mt-8 lg:col-span-7 lg:mt-0">
                <RequestForm topic="Вопрос с главной" />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

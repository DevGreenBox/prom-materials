import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BuyBlock,
  CompareButton,
  CopyArticle,
  RestockNotify,
  StickyBuyBar,
  ViewTracker,
} from "@/components/CartActions";
import { ProductGrid } from "@/components/ProductCard";
import { ProductGallery } from "@/components/Photos";
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  ParamLine,
  MoreLink,
  Price,
  SectionTitle,
} from "@/components/ui";
import {
  getProduct,
  groupOf,
  products,
  productsOf,
  sectionOf,
} from "@/lib/catalog";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { typo } from "@/lib/typo";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    // Номиналы в заголовок не добавляем: они уже стоят в названии объявления,
    // и в выдаче получалось «DN65 … Ду 65».
    title: `${product.name} — код ${product.article}`,
    description: [
      product.name,
      product.params.join(", "),
      `Код ${product.article}`,
      product.brand && `производитель ${product.brand}`,
      `${money(product.price)}, отгрузка из Москвы.`,
    ]
      .filter(Boolean)
      .join(". "),
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const section = sectionOf(product);
  const group = groupOf(product);
  // Три штуки: сетка каталога — три колонки, четвёртая карточка оставляла
  // дыру в ряду.
  const similar = productsOf({ group: product.group })
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.article,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: `${section?.name} / ${group?.name}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: site.legalName },
    },
  };

  return (
    <Container className="py-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewTracker slug={product.slug} />

      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { href: "/catalog", name: "Каталог" },
          ...(section
            ? [{ href: `/catalog/${section.slug}`, name: section.name }]
            : []),
          ...(section && group
            ? [
                {
                  href: `/catalog/${section.slug}/${group.slug}`,
                  name: group.name,
                },
              ]
            : []),
          { name: product.article },
        ]}
      />

      <div className="grid gap-x-5 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ProductGallery product={product} />
        </div>

        <div className="lg:col-span-8">
          <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
            {product.brand && (
              <span className="font-medium text-ink">{product.brand}</span>
            )}
            <CopyArticle article={product.article} />
          </p>
          <h1 className="h1">{typo(product.name)}</h1>

          <ParamLine params={product.params} className="mt-4 text-base" />

          <div className="mt-6 border-y border-line py-5">
            <Price value={product.price} large />
            <p className="mt-1 flex items-center gap-2 text-base text-ink-2">
              <span
                aria-hidden
                className={`size-2 shrink-0 rounded-full ${product.inStock ? "bg-ok" : "bg-warn"}`}
              />
              {product.inStock ? "В наличии" : "Под заказ"}
            </p>

            <div className="mt-5">
              <BuyBlock slug={product.slug} unit={product.unit} />
            </div>
            <div className="-ml-3 mt-1">
              <CompareButton slug={product.slug} withLabel />
            </div>
            {!product.inStock && <RestockNotify article={product.article} />}
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-2">
            {product.unit !== "шт" && <span>Единица: {product.unit}</span>}
            {product.address && <span>Склад: {product.address}</span>}
            <span>Код позиции: {product.article}</span>
          </p>
        </div>
      </div>

      <section className="mt-12 grid gap-x-5 gap-y-8 lg:mt-16 lg:grid-cols-12">
        {/* min-w-0: без него минимальная ширина колонки равна min-width
            таблицы характеристик, и на телефоне страница уезжала вправо
            вместо того, чтобы таблица прокручивалась внутри себя. */}
        <div className="min-w-0 lg:col-span-7">
          <SectionTitle>Характеристики</SectionTitle>
          {Object.keys(product.specs).length === 0 ? (
            <p className="text-base text-ink-2">
              Паспортные данные по этой позиции уточняет менеджер: напишите или
              позвоните, назвав код {product.article}.
            </p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base sm:min-w-[380px]">
              <tbody>
                {Object.entries(product.specs).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={index % 2 === 1 ? "bg-surface" : undefined}
                  >
                    <th
                      scope="row"
                      className="w-1/2 px-3 py-2.5 text-left font-normal text-ink-2"
                    >
                      {key}
                    </th>
                    <td className="px-3 py-2.5 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          <p className="mt-3 text-sm text-ink-2">
            Паспорт, сертификат и габаритный чертёж — по запросу у менеджера.
          </p>
        </div>

        <div className="lg:col-span-5">
          <SectionTitle>Доставка и оплата</SectionTitle>
          <ul className="space-y-3 text-base text-ink-2">
            <li>Самовывоз на Бурцевской — в день заказа.</li>
            <li>Курьером по Москве и области — 1–2 рабочих дня.</li>
            <li>В регионы — транспортной компанией до терминала.</li>
            <li>
              Оплата: счёт для юрлиц, карта или наличные при получении для
              физлиц.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/delivery" variant="secondary">
              Условия доставки
            </ButtonLink>
            <ButtonLink href="/corporate" variant="secondary">
              Юридическим лицам
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* На мобильном страница длинная: за характеристиками кнопка покупки
          уезжает, и приходится скроллить обратно наверх. */}
      <StickyBuyBar product={product} />

      {similar.length > 0 && (
        <section className="mt-12 lg:mt-16">
          <SectionTitle
            action={
              section && group ? (
                <MoreLink href={`/catalog/${section.slug}/${group.slug}`}>
                  Вся подгруппа
                </MoreLink>
              ) : undefined
            }
          >
            Похожие номиналы
          </SectionTitle>
          {/* Та же сетка, что в каталоге: у собственной не было колонки
              для телефона, и карточка растягивалась по содержимому,
              утаскивая за собой всю страницу. */}
          <ProductGrid products={similar} />
        </section>
      )}
    </Container>
  );
}

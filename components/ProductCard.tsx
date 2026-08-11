import Link from "next/link";

import {
  AddToCart,
  BuyNow,
  CompareButton,
  FavoriteButton,
} from "@/components/CartActions";
import { QuickView } from "@/components/QuickView";
import { CardPhotos } from "@/components/Photos";
import { ParamLine, Price } from "@/components/ui";
import { groupOf, type Product } from "@/lib/catalog";

/**
 * Позиция в выдаче. Карточка обведена: на выдаче из двух десятков позиций
 * границы читаются как отдельные объекты, а линия снизу сливала их
 * в сплошной список.
 *
 * Раскладка одна на все случаи: отдельной «строчной» больше нет — на одной
 * найденной позиции она растягивала карточку на всю ширину выдачи.
 *
 * Снимок лежит на светлой плашке, в её углу — подгруппа: названия объявлений
 * авторские и не всегда говорят, что это за прибор.
 */
export function ProductCard({
  product,
  showGroup = true,
}: {
  product: Product;
  showGroup?: boolean;
}) {
  const group = showGroup ? groupOf(product) : undefined;

  return (
    <article className="group relative flex gap-4 rounded-md border border-line p-3 transition-colors duration-150 hover:border-accent sm:flex-col">
      {/* Иконки лежат поверх снимка, поэтому у них своя подложка: на светлом
          фото контур пропадал совсем. */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <span className="rounded-full bg-page/90 backdrop-blur-[2px]">
          <FavoriteButton slug={product.slug} />
        </span>
        <span className="rounded-full bg-page/90 backdrop-blur-[2px]">
          <CompareButton slug={product.slug} />
        </span>
        <span className="hidden rounded-full bg-page/90 backdrop-blur-[2px] sm:inline-flex">
          <QuickView product={product} />
        </span>
      </div>

      <div className="relative shrink-0 sm:mb-1">
        <CardPhotos
          product={product}
          href={`/product/${product.slug}`}
          className="h-20 w-24 sm:h-40 sm:w-full"
        />
        {group && (
          <span className="pointer-events-none absolute left-2 top-2 hidden max-w-[70%] truncate rounded-full bg-page/90 px-2.5 py-1 text-xs text-ink-2 sm:block">
            {group.name}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mb-1 flex items-baseline gap-2 truncate pr-24 text-xs text-ink-3">
          <span className="font-medium text-ink-2">{product.brand}</span>
          <span className="font-mono">{product.article}</span>
        </p>

        {/* Названия объявлений длинные и разной длины: без ограничения
            строк ряды карточек разъезжаются по высоте. */}
        <h3 className="line-clamp-2 text-base font-medium leading-6">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>

        {/* Номиналы слева, цена справа. Пустой блок под номиналы остаётся:
            без него у позиций без параметров цена прыгала к левому краю. */}
        {/* Номиналы и цена — в две строки. В одну строку в колонке шириной
            в четверть экрана характеристика обрезалась до «электро». */}
        <div className="mt-2 min-w-0">
          <ParamLine params={product.params} className="truncate" />
          <div className="mt-1">
            <Price value={product.price} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:mt-auto sm:pt-3">
          <AddToCart
            slug={product.slug}
            variant="secondary"
            className="flex-1 px-3"
          />
          <BuyNow slug={product.slug} className="flex-1 px-3" />
        </div>
      </div>
    </article>
  );
}

/**
 * Три колонки на широком экране: в четырёх кнопки «В корзину» и «Купить»
 * не помещались в ряд и вылезали за рамку карточки.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  // Внутри одной подгруппы чип с её названием стоял бы на каждой карточке
  // и не сообщал ничего: показываем его только в смешанной выдаче.
  const showGroup = new Set(products.map((product) => product.group)).size > 1;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          showGroup={showGroup}
        />
      ))}
    </div>
  );
}

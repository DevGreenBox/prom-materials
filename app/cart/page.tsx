"use client";

import Link from "next/link";
import { useState } from "react";

import { QtyInput } from "@/components/CartActions";
import { DeliveryPicker } from "@/components/DeliveryPicker";
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Container,
  Empty,
  ParamLine,
  Thumb,
  Price,
  Stock,
} from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { deliveryReady } from "@/lib/delivery";
import { money, plural } from "@/lib/format";
import {
  clearCart,
  removeFromCart,
  saveList,
  setQty,
  useStore,
} from "@/lib/store";

export default function CartPage() {
  const { cart, ready, cartCount, cartSum, delivery } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [listName, setListName] = useState("");
  const [saved, setSaved] = useState(false);

  const lines = cart.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ line, product }] : [];
  });

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Корзина" }]}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="h1">Корзина</h1>
        {lines.length > 0 &&
          (confirmClear ? (
            // Единственное необратимое действие на сайте — спрашиваем.
            <span className="flex items-center gap-3 text-sm">
              <span className="text-ink-2">Очистить корзину?</span>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setConfirmClear(false);
                }}
                className="text-danger transition-colors hover:underline"
              >
                Да, очистить
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-ink-3 transition-colors hover:text-accent"
              >
                Отмена
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-sm text-ink-3 transition-colors hover:text-danger"
            >
              Очистить корзину
            </button>
          ))}
      </div>

      {!ready ? (
        <div className="skeleton mt-8 h-40 rounded-md" />
      ) : lines.length === 0 ? (
        <div className="mt-8">
          <Empty title="Корзина пуста" hint="Подберите позиции в каталоге." />
          <div className="mt-4">
            <ButtonLink href="/catalog">В каталог</ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-5">
          <ul className="divide-y divide-[var(--color-line)] border-y border-line lg:col-span-8">
            {lines.map(({ line, product }) => (
              <li key={line.slug} className="flex gap-4 py-4">
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <Thumb
                    product={product}
                    className="hidden h-16 w-24 sm:flex"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2 text-xs text-ink-3">
                    <span className="font-medium text-ink-2">
                      {product.brand}
                    </span>
                    <span className="font-mono">{product.article}</span>
                  </p>
                  <h2 className="text-base font-medium leading-6">
                    <Link
                      href={`/product/${product.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {product.name}
                    </Link>
                  </h2>
                  <ParamLine params={product.params} className="mt-1" />
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-4">
                    <Price value={product.price} />
                    <Stock inStock={product.inStock} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <QtyInput
                      value={line.qty}
                      onChange={(next) => setQty(line.slug, next)}
                      unit={product.unit}
                    />
                    <span className="tabular text-sm text-ink-2">
                      {money(product.price * line.qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.slug)}
                      className="ml-auto text-sm text-ink-3 transition-colors hover:text-danger"
                    >
                      Убрать
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="mt-8 rounded-md border border-line p-5 lg:col-span-4 lg:sticky lg:top-28 lg:mt-0">
            <h2 className="text-xl font-semibold">Итого</h2>

            <dl className="mt-4 space-y-2 text-base">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Позиций</dt>
                <dd className="tabular">
                  {cartCount} {plural(cartCount, "штука", "штуки", "штук")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Товары</dt>
                <dd className="tabular">{money(cartSum)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.04em] text-ink-3">
                Доставка
              </p>
              <DeliveryPicker places={lines.length} />
            </div>

            {/* Итог стоит после выбора направления: сумма зависит от него,
                и сверху она читалась как окончательная ещё до выбора. */}
            <div className="mt-5 flex justify-between gap-4 border-t border-line pt-4 text-xl font-semibold">
              <span>Итого</span>
              <span className="tabular">{money(cartSum + delivery.cost)}</span>
            </div>

            {deliveryReady(delivery) ? (
              <ButtonLink href="/checkout" className="mt-5 w-full">
                Оформить заказ
              </ButtonLink>
            ) : (
              <p className="mt-5 rounded-md bg-surface px-4 py-3 text-sm text-ink-2">
                Выберите способ доставки — и переходите к оформлению.
              </p>
            )}

            <p className="mt-3 text-sm text-ink-3">
              Цены — из наших объявлений. При объёме менеджер пересчитает.
            </p>

            {/* Список закупки: собранное по объекту нужно вернуть через неделю,
                а не собирать заново. Живёт в кабинете. */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (saveList(listName)) {
                  setListName("");
                  setSaved(true);
                }
              }}
              className="mt-5 border-t border-line pt-5"
            >
              <label
                htmlFor="list-name"
                className="mb-2 block text-sm text-ink-2"
              >
                Сохранить как список закупки
              </label>
              <div className="flex gap-2">
                <input
                  id="list-name"
                  value={listName}
                  onChange={(event) => {
                    setListName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Щит ВРУ, объект на Мира"
                  className="h-11 min-w-0 flex-1 rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 focus:border-accent"
                />
                <Button type="submit" variant="secondary">
                  {saved ? "Сохранено" : "Сохранить"}
                </Button>
              </div>
              {saved && (
                <p className="mt-2 text-sm text-ink-2">
                  Список в{" "}
                  <Link href="/account" className="text-accent">
                    личном кабинете
                  </Link>
                  .
                </p>
              )}
            </form>
          </aside>
        </div>
      )}
    </Container>
  );
}

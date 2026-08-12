"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Container,
  Empty,
  ParamLine,
} from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { deliveryLabel } from "@/lib/delivery";
import { date, money, plural } from "@/lib/format";
import { repeatOrder, useStore } from "@/lib/store";

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const { orders, ready } = useStore();
  const order = orders.find((item) => item.id === params.id);

  if (!ready) {
    return (
      <Container className="py-8 lg:py-10">
        <div className="skeleton h-64 rounded-md" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-8 lg:py-10">
        <Breadcrumbs
          items={[
            { href: "/", name: "Главная" },
            { href: "/account", name: "Личный кабинет" },
            { name: "Заказ" },
          ]}
        />
        <Empty
          title="Заказ не найден"
          hint="Заказы демо-режима хранятся в браузере: в другом браузере или после очистки данных их не будет."
        />
        <div className="mt-4">
          <ButtonLink href="/account">К списку заказов</ButtonLink>
        </div>
      </Container>
    );
  }
  const lines = order.lines.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ line, product }] : [];
  });
  const goodsSum = lines.reduce(
    (sum, { line, product }) => sum + product.price * line.qty,
    0,
  );

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { href: "/account", name: "Личный кабинет" },
          { name: `Заказ № ${order.number}` },
        ]}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="h1">Заказ № {order.number}</h1>
          <p className="mt-3 text-ink-2">
            от {date(order.createdAt)} · {order.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => repeatOrder(order.id)}>
            Повторить заказ
          </Button>
          <ButtonLink
            href={`/account/orders/${order.id}/invoice`}
            variant="secondary"
          >
            Накладная
          </ButtonLink>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-5">
        <ul className="divide-y divide-[var(--color-line)] border-y border-line lg:col-span-8">
          {lines.map(({ line, product }) => (
            <li key={line.slug} className="py-4">
              <p className="flex items-baseline gap-2 text-xs text-ink-3">
                <span className="font-medium text-ink-2">{product.brand}</span>
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
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span className="font-mono">
                  {line.qty} {product.unit}
                </span>
                <span className="tabular text-ink-2">
                  {money(product.price * line.qty)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <aside className="mt-8 space-y-4 lg:col-span-4 lg:mt-0">
          <div className="rounded-md border border-line p-5">
            <h2 className="text-xl font-semibold">Итого</h2>
            <dl className="mt-3 space-y-2 text-base">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Позиций</dt>
                <dd className="tabular">
                  {lines.length}{" "}
                  {plural(lines.length, "позиция", "позиции", "позиций")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Товары</dt>
                <dd className="tabular">{money(goodsSum)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Доставка</dt>
                <dd className="tabular">
                  {order.delivery.cost === 0
                    ? "бесплатно"
                    : money(order.delivery.cost)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-lg font-semibold">
                <dt>Итого</dt>
                <dd className="tabular">{money(goodsSum + order.delivery.cost)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border border-line p-5">
            <h2 className="text-xl font-semibold">Получатель</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {order.customer.company && (
                <div>
                  <dt className="text-ink-3">Организация</dt>
                  <dd>
                    {order.customer.company}, ИНН{" "}
                    <span className="font-mono">{order.customer.inn}</span>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-ink-3">Контакт</dt>
                <dd>
                  {order.customer.name}, {order.customer.phone}
                </dd>
              </div>
              <div>
                <dt className="text-ink-3">Доставка</dt>
                <dd>
                  {deliveryLabel(order.delivery)}
                  {order.customer.address ? `, ${order.customer.address}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </Container>
  );
}

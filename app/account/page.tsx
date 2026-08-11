"use client";

import Link from "next/link";

import { Trash } from "@/components/icons";
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  Empty,
  MoreLink,
} from "@/components/ui";
import { zones } from "@/lib/delivery";
import { date, money, plural } from "@/lib/format";
import { deleteList, listToCart, repeatOrder, useStore } from "@/lib/store";

export default function AccountPage() {
  const { orders, favorites, lists, ready } = useStore();
  const lastCompany = orders.find((order) => order.customer.kind === "company");

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Мои заказы" }]}
      />

      <h1 className="h1">Мои заказы</h1>
      <p className="mt-2 max-w-[68ch] text-ink-2">
        Демо-режим: заказы и реквизиты хранятся в этом браузере.
      </p>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-5">
        <section className="lg:col-span-8">
          <h2 className="mb-4 text-xl font-semibold">Заказы</h2>

          {!ready ? (
            <div className="skeleton h-32 rounded-md" />
          ) : orders.length === 0 ? (
            <>
              <Empty
                title="Заказов пока нет"
                hint="Оформленный заказ появится здесь."
              />
              <div className="mt-4">
                <ButtonLink href="/catalog">В каталог</ButtonLink>
              </div>
            </>
          ) : (
            <ul className="divide-y divide-[var(--color-line)] border-y border-line">
              {orders.map((order) => {
                const positions = order.lines.length;
                const zone = zones.find((item) => item.id === order.zone);
                return (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4"
                  >
                    <div className="min-w-40">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-medium transition-colors hover:text-accent"
                      >
                        Заказ № {order.number}
                      </Link>
                      <p className="text-sm text-ink-2">
                        {date(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-ink-2">
                      {positions}{" "}
                      {plural(positions, "позиция", "позиции", "позиций")}
                    </p>
                    <p className="text-sm text-ink-2">{zone?.name}</p>
                    <p className="text-sm">
                      Доставка:{" "}
                      <span className="tabular">
                        {order.deliveryCost === 0
                          ? "бесплатно"
                          : money(order.deliveryCost)}
                      </span>
                    </p>
                    <span className="rounded-md bg-accent-soft px-2.5 py-1 text-sm text-accent">
                      {order.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => repeatOrder(order.id)}
                      className="ml-auto text-sm text-accent transition-colors hover:text-accent-hover"
                    >
                      Повторить заказ
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="mt-8 space-y-4 lg:col-span-4 lg:mt-0">
          <div className="rounded-md border border-line p-5">
            <h2 className="text-xl font-semibold">Списки закупки</h2>
            {!ready ? (
              <div className="skeleton mt-3 h-16 rounded-md" />
            ) : lists.length === 0 ? (
              <p className="mt-2 text-sm text-ink-2">
                Сохранённая корзина появится здесь.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {lists.map((list) => (
                  <li
                    key={list.id}
                    className="border-t border-line pt-3 first:border-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{list.name}</p>
                        <p className="text-ink-3">
                          {list.lines.length}{" "}
                          {plural(
                            list.lines.length,
                            "позиция",
                            "позиции",
                            "позиций",
                          )}{" "}
                          · {date(list.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteList(list.id)}
                        aria-label={`Удалить список «${list.name}»`}
                        className="flex size-8 items-center justify-center text-ink-3 transition-colors hover:text-danger"
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => listToCart(list.id)}
                      className="mt-1 text-accent transition-colors hover:text-accent-hover"
                    >
                      В корзину
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-line p-5">
            <h2 className="text-xl font-semibold">Реквизиты</h2>
            {lastCompany ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-ink-3">Организация</dt>
                  <dd>{lastCompany.customer.company}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">ИНН</dt>
                  <dd className="font-mono">{lastCompany.customer.inn}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Контакт</dt>
                  <dd>
                    {lastCompany.customer.name}, {lastCompany.customer.phone}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-ink-2">
                Появятся после первого заказа от юрлица.
              </p>
            )}
          </div>

          <div className="rounded-md border border-line p-5">
            <h2 className="text-xl font-semibold">Избранное</h2>
            <p className="mt-2 text-sm text-ink-2">
              {ready
                ? `${favorites.length} ${plural(favorites.length, "позиция", "позиции", "позиций")}`
                : "—"}
            </p>
            <div className="mt-2">
              <MoreLink href="/favorites">Открыть</MoreLink>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

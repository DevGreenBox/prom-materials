"use client";

import { useParams } from "next/navigation";

import { ArrowLeft } from "@/components/icons";
import { Button, ButtonLink, Container, Empty } from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { zones } from "@/lib/delivery";
import { date, money } from "@/lib/format";
import { site } from "@/lib/site";
import { useStore } from "@/lib/store";

/**
 * Расходная накладная. Формируется из заказа и печатается браузером —
 * PDF-библиотеку не тянем: печать в PDF есть в любой ОС.
 * Цены — из объявлений; реквизиты продавца заказчик ещё не давал.
 */
export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const { orders, ready } = useStore();
  const order = orders.find((item) => item.id === params.id);

  if (!ready) {
    return (
      <Container className="py-8">
        <div className="skeleton h-64 rounded-md" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-8 lg:py-10">
        <Empty
          title="Заказ не найден"
          hint="Накладная формируется только для существующего заказа."
        />
        <div className="mt-4">
          <ButtonLink href="/account">К списку заказов</ButtonLink>
        </div>
      </Container>
    );
  }

  const zone = zones.find((item) => item.id === order.zone);
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
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={`/account/orders/${order.id}`} variant="secondary">
          <ArrowLeft className="size-4" />К заказу
        </ButtonLink>
        <Button onClick={() => window.print()}>Печать или PDF</Button>
      </div>

      <article className="rounded-md border border-line p-6 print:border-0 print:p-0">
        <header className="border-b border-line pb-4">
          <h1 className="text-xl font-semibold">
            Расходная накладная № {order.number} от {date(order.createdAt)}
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Форма демонстрационная: реквизиты продавца не заполнены.
          </p>
        </header>

        <div className="grid gap-6 border-b border-line py-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-ink-3">Поставщик</p>
            <p className="mt-1">{site.legalName}</p>
            <p className="text-ink-2">ИНН {site.inn}</p>
            <p className="text-ink-2">{site.address}</p>
          </div>
          <div>
            <p className="text-ink-3">Покупатель</p>
            <p className="mt-1">
              {order.customer.company ?? order.customer.name}
            </p>
            {order.customer.inn && (
              <p className="text-ink-2">ИНН {order.customer.inn}</p>
            )}
            <p className="text-ink-2">
              {zone?.name}
              {order.customer.address ? `, ${order.customer.address}` : ""}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto py-4">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-2">
                <th className="py-2 pr-3 font-normal">№</th>
                <th className="py-2 pr-3 font-normal">Наименование</th>
                <th className="py-2 pr-3 font-normal">Артикул</th>
                <th className="py-2 pr-3 font-normal">Кол-во</th>
                <th className="py-2 pr-3 font-normal">Ед.</th>
                <th className="py-2 pr-3 text-right font-normal">Цена</th>
                <th className="py-2 text-right font-normal">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(({ line, product }, index) => (
                <tr key={line.slug} className="border-b border-line align-top">
                  <td className="py-2 pr-3 tabular">{index + 1}</td>
                  <td className="py-2 pr-3">
                    {product.brand} {product.name}
                    <span className="mt-0.5 block font-mono text-xs text-ink-3">
                      {product.params.join(" · ")}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {product.article}
                  </td>
                  <td className="py-2 pr-3 tabular">{line.qty}</td>
                  <td className="py-2 pr-3">{product.unit}</td>
                  <td className="py-2 pr-3 text-right tabular">
                    {money(product.price)}
                  </td>
                  <td className="py-2 text-right tabular">
                    {money(product.price * line.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td colSpan={5} className="py-2 pr-3">
                  Товары
                </td>
                <td className="py-2 pr-3 text-right" />
                <td className="py-2 text-right tabular">{money(goodsSum)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="py-1 pr-3 text-ink-2">
                  Доставка ({zone?.name})
                </td>
                <td className="py-1 pr-3 text-right" />
                <td className="py-1 text-right tabular">
                  {order.deliveryCost === 0
                    ? "бесплатно"
                    : money(order.deliveryCost)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={5} className="py-2 pr-3">
                  Всего к оплате
                </td>
                <td className="py-2 pr-3 text-right" />
                <td className="py-2 text-right tabular">
                  {money(goodsSum + order.deliveryCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <footer className="grid gap-8 pt-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-ink-2">Отпустил</p>
            <p className="mt-8 border-t border-line pt-1 text-ink-3">
              подпись, расшифровка
            </p>
          </div>
          <div>
            <p className="text-ink-2">Получил</p>
            <p className="mt-8 border-t border-line pt-1 text-ink-3">
              подпись, расшифровка
            </p>
          </div>
        </footer>
      </article>
    </Container>
  );
}

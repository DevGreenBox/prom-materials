"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BuyBlock } from "@/components/CartActions";
import { Close, Eye } from "@/components/icons";
import { ProductGallery } from "@/components/Photos";
import { ParamLine, Price, Stock } from "@/components/ui";
import type { Product } from "@/lib/catalog";

/**
 * Быстрый просмотр: характеристики и покупка без ухода из выдачи.
 * Диалог нативный (`<dialog>`) — фокус, Esc и подложка достаются даром,
 * своей реализации модалки не пишем.
 */
export function QuickView({ product }: { product: Product }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {/* Иконка, а не строка с подписью: в карточке ряд кнопок «В корзину» +
          «Купить» занимает всю ширину, и подпись из неё вываливалась. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Быстрый просмотр"
        className="inline-flex size-11 items-center justify-center text-ink-3 transition-colors duration-150 hover:text-accent"
      >
        <Eye className="size-5" />
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Клик по подложке — это клик по самому диалогу, а не по его содержимому.
          if (event.target === ref.current) setOpen(false);
        }}
        className="m-auto max-h-[90vh] w-[min(44rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-line bg-page p-0 backdrop:bg-[rgba(22,32,43,0.45)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <p className="flex flex-wrap items-baseline gap-x-3 text-sm text-ink-2">
            <span className="font-medium text-ink">{product.brand}</span>
            <span className="font-mono text-xs text-ink-3">
              {product.article}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="-mr-2 -mt-1 flex size-9 items-center justify-center text-ink-3 transition-colors hover:text-accent"
          >
            <Close />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-[160px_1fr]">
          {/* На узком экране снимок не должен занимать пол-окна: место
              нужно характеристикам, ради которых просмотр и открывают. */}
          <ProductGallery product={product} mainClassName="h-32 w-full sm:h-40" />

          <div>
            <h2 className="text-xl font-semibold leading-7">
              <Link
                href={`/product/${product.slug}`}
                className="transition-colors hover:text-accent"
              >
                {product.name}
              </Link>
            </h2>
            <ParamLine params={product.params} className="mt-2" />

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Price value={product.price} />
              <Stock inStock={product.inStock} />
            </div>

            <table className="mt-4 w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={index % 2 === 1 ? "bg-surface" : undefined}
                  >
                    <th
                      scope="row"
                      className="w-1/2 px-2 py-1.5 text-left font-normal text-ink-2"
                    >
                      {key}
                    </th>
                    <td className="px-2 py-1.5 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5">
              <BuyBlock slug={product.slug} unit={product.unit} />
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="mt-4 inline-block text-sm text-accent transition-colors hover:text-accent-hover"
            >
              Открыть страницу позиции
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}

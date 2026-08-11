"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Nameplate } from "@/components/ui";
import type { Product } from "@/lib/catalog";

type PhotoProduct = Pick<Product, "images" | "name" | "article" | "brand" | "params">;

/**
 * Фотографии в карточке каталога. Снимков у позиции до пяти, и показать
 * только первый — значит спрятать половину товара: на б/у оборудовании
 * второй кадр это шильдик с паспортными данными, третий — присоединение.
 *
 * Кадр переключается положением курсора по ширине снимка (так же ведут
 * себя карточки на маркетплейсах, жест уже знаком) и точками снизу,
 * по которым можно попасть пальцем.
 */
export function CardPhotos({
  product,
  href,
  className = "",
}: {
  product: PhotoProduct;
  href: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const photos = product.images;

  if (photos.length === 0) {
    return (
      <Link href={href} className={`block ${className}`} tabIndex={-1} aria-hidden>
        <Nameplate product={product} className="size-full" />
      </Link>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-surface ${className}`}
      onMouseMove={(event) => {
        // Кадр переключается позицией курсора по ширине снимка: отдельные
        // полосы поверх изображения перехватывали бы клик по карточке.
        const box = event.currentTarget.getBoundingClientRect();
        const share = (event.clientX - box.left) / box.width;
        setActive(Math.min(photos.length - 1, Math.max(0, Math.floor(share * photos.length))));
      }}
      onMouseLeave={() => setActive(0)}
    >
      {photos.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === 0 ? product.name : `${product.name} — фото ${index + 1}`}
          fill
          sizes="(max-width: 640px) 45vw, 300px"
          className={`object-contain transition-opacity duration-150 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          priority={false}
        />
      ))}

      <Link
        href={href}
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0"
      />

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
            {photos.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`Фото ${index + 1}`}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(index);
                }}
                className={`h-1 w-5 rounded-full transition-colors duration-150 ${
                  index === active ? "bg-accent" : "bg-ink-3/35"
                }`}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Галерея на странице позиции: крупный снимок и лента миниатюр под ним.
 * Миниатюры показываем только когда снимков больше одного — одинокая
 * миниатюра под своим же изображением выглядит как недогруженная сетка.
 */
export function ProductGallery({
  product,
  mainClassName = "h-64 w-full lg:h-96",
}: {
  product: PhotoProduct;
  mainClassName?: string;
}) {
  const [active, setActive] = useState(0);
  const photos = product.images;

  if (photos.length === 0) {
    return <Nameplate product={product} className={mainClassName} />;
  }

  return (
    <div>
      <div className={`relative overflow-hidden rounded-md bg-surface ${mainClassName}`}>
        <Image
          src={photos[active]}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 400px"
          className="object-contain"
          priority
        />
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {photos.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Фото ${index + 1}`}
                aria-current={index === active}
                className={`relative block size-14 overflow-hidden rounded-md border bg-surface transition-colors duration-150 sm:size-16 ${
                  index === active
                    ? "border-accent"
                    : "border-line hover:border-accent"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

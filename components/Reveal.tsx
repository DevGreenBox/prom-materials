"use client";

import { useEffect, useRef } from "react";

/**
 * Появление блока при прокрутке.
 *
 * Скрытое состояние навешивается скриптом и только тем блокам, которые
 * в момент загрузки находятся ниже экрана. Поэтому: без JS, с отключённой
 * анимацией, при печати и в поисковом роботе контент виден всегда, а мигания
 * «показали — спрятали — показали» пользователь не видит (блок за экраном).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Блок уже на экране — анимировать нечего, иначе получим мигание.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    node.classList.add("reveal", "reveal-hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.classList.remove("reveal-hidden");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

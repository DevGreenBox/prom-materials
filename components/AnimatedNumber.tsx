"use client";

import { useEffect, useRef } from "react";

/**
 * Число доезжает до нового значения за 200 мс вместо мгновенного скачка:
 * глаз успевает заметить, что счётчик отреагировал на фильтр.
 *
 * Значение пишется прямо в узел, а не через состояние: анимация — это
 * работа с DOM, и лишние перерисовки на каждый кадр здесь не нужны.
 * В разметке всегда стоит конечное число, поэтому без JS и при
 * `prefers-reduced-motion` виден правильный результат.
 */
export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const from = shown.current;
    shown.current = value;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || from === value) {
      node.textContent = String(value);
      return;
    }

    const start = performance.now();
    const duration = 200;
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      node.textContent = String(Math.round(from + (value - from) * progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span ref={ref} className="tabular">
      {value}
    </span>
  );
}

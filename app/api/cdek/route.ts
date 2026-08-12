import { NextResponse } from "next/server";

import { cdekCities, cdekPoints, cdekTariff, cdekReady } from "@/lib/cdek";

/**
 * Единственная точка выхода к СДЭК. Ключи остаются на сервере, браузер
 * ходит сюда: `?action=cities|points|tariff`.
 *
 * Пока ключей нет, отвечаем 503 с понятным телом — блок доставки покажет
 * самовывоз и предложит расчёт через менеджера вместо выдуманной ставки.
 */
export async function GET(request: Request) {
  if (!cdekReady) {
    return NextResponse.json(
      { error: "Расчёт СДЭК не подключён: нет ключей интеграции." },
      { status: 503 },
    );
  }

  const params = new URL(request.url).searchParams;
  const action = params.get("action");

  try {
    if (action === "cities") {
      return NextResponse.json(await cdekCities(params.get("q") ?? ""));
    }

    if (action === "points") {
      const city = Number(params.get("city"));
      if (!city) return NextResponse.json({ error: "Не указан город" }, { status: 400 });
      return NextResponse.json(await cdekPoints(city));
    }

    if (action === "tariff") {
      const city = Number(params.get("city"));
      const mode = params.get("mode") === "courier" ? "courier" : "pvz";
      const places = Number(params.get("places")) || 1;
      if (!city) return NextResponse.json({ error: "Не указан город" }, { status: 400 });
      return NextResponse.json(await cdekTariff(city, mode, places));
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (error) {
    // Наружу отдаём человеческий текст: адрес СДЭК и коды ошибок покупателю
    // ни о чём не говорят, а в логе сервера сообщение остаётся целиком.
    console.error("СДЭК:", error);
    return NextResponse.json(
      { error: "СДЭК сейчас не отвечает. Попробуйте ещё раз или напишите нам." },
      { status: 502 },
    );
  }
}

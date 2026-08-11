/**
 * Единственный набор иконок сайта. Одна сетка 20×20, одна толщина штриха 1.5,
 * одни скругления. Текстовых стрелок, «крестиков», плюсов и эмодзи в разметке
 * нет: у них другая толщина и другой ритм, и это сразу читается как «набрано
 * с клавиатуры».
 */
type IconProps = { className?: string; strokeWidth?: number };

function Icon({
  className = "size-5",
  // Крупные знаки набираются тоньше: штрих 1,5 на размере 96 выглядит
  // как обводка, а не как линия.
  strokeWidth = 1.5,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" />
    </Icon>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 10H5m4.5-4.5L5 10l4.5 4.5" />
    </Icon>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8 5 5 5-5 5" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 8 5 5 5-5" />
    </Icon>
  );
}

export function Close(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5.5 5.5 9 9m0-9-9 9" />
    </Icon>
  );
}

export function Plus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 5v10M5 10h10" />
    </Icon>
  );
}

export function Minus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 10h10" />
    </Icon>
  );
}

export function Burger({ open, className }: IconProps & { open?: boolean }) {
  return open ? (
    <Close className={className} />
  ) : (
    <Icon className={className}>
      <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
    </Icon>
  );
}

export function Search(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="4.5" />
      <path d="m12.5 12.5 4 4" />
    </Icon>
  );
}

export function Heart({ filled, className }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className ?? "size-5"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 16.2 4.9 11.4a3.4 3.4 0 0 1 4.7-4.9l.4.4.4-.4a3.4 3.4 0 1 1 4.7 4.9L10 16.2Z" />
    </svg>
  );
}

/**
 * Звезда для оценок. Контурная и заполненная — одна и та же форма, разница
 * только в заливке: половинок в данных Авито нет, оценка всегда целая.
 */
export function Star({ filled, className }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className ?? "size-5"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m10 2.8 2.24 4.54 5.01.73-3.62 3.53.85 4.99L10 14.24l-4.48 2.35.85-4.99L2.75 8.07l5.01-.73L10 2.8Z" />
    </svg>
  );
}

/** Счёт для юрлица: бланк с печатью-кружком. */
export function Invoice(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 2.5h7l3 3v12l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V2.5Z" />
      <path d="M11.5 2.5v3.5H15M7.5 8.5h5M7.5 11.5h3" />
    </Icon>
  );
}

/** Оплата физлицом: карта с полосой. */
export function Card(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="4.5" width="16" height="11" rx="2" />
      <path d="M2 8.5h16M5 12.5h3" />
    </Icon>
  );
}

/** Документы к отгрузке: два листа. */
export function Papers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 2.5h6l3 3v9a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" />
      <path d="M12 2.5v3.5h3.5" />
      <path d="M13 15.5v1a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-11" />
    </Icon>
  );
}

/**
 * Городская застройка: три здания разной высоты с сеткой окон. Знак стоит
 * крупно и без рамки, поэтому в нём есть ритм окон — на большом размере
 * силуэт из трёх прямоугольников выглядел бы пустым.
 */
export function Buildings(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M1.5 17.5h17" />
      <rect x="2.5" y="8.5" width="5" height="9" />
      <rect x="7.5" y="3.5" width="5.5" height="14" />
      <rect x="13" y="10.5" width="4.5" height="7" />
      <path d="M4 11h2M4 13.5h2" />
      <path d="M9 6h1M11 6h1M9 9h1M11 9h1M9 12h1M11 12h1M9 15h3" />
      <path d="M14.5 13h1.5M14.5 15.5h1.5" />
    </Icon>
  );
}

/* ── Знаки разделов каталога: та же сетка 20×20 и тот же штрих. ────────── */

/** КИП и датчики: манометр — циферблат со стрелкой на штуцере. */
export function Gauge(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="8.5" r="6" />
      <path d="M10 8.5 13 5.5" />
      <path d="M10 2.5v1M4.6 5.4l.9.5M15.4 5.4l-.9.5" />
      <path d="M8 14.4v2.1h4v-2.1" />
      <path d="M7.5 18.5h5" />
    </Icon>
  );
}

/** Приводная техника: электродвигатель с клеммной коробкой и валом. */
export function Drive(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="7" width="9" height="8" rx="1.5" />
      <rect x="5" y="4.5" width="4" height="2.5" rx="0.5" />
      <path d="M11.5 11h3.5" />
      <path d="M15 9.5h2.5v3H15z" />
      <path d="M4.5 15v1.5M9.5 15v1.5" />
    </Icon>
  );
}

/** Управление и визуализация: панель оператора — экран и кнопки сбоку. */
export function Panel(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="4" width="16" height="12" rx="1.5" />
      <rect x="4" y="6" width="9" height="8" rx="0.5" />
      <circle cx="15.5" cy="7.5" r="0.9" />
      <circle cx="15.5" cy="10.5" r="0.9" />
      <path d="M14.5 13.5h2" />
    </Icon>
  );
}

/** Электрооборудование: модульный автомат с рукояткой и выводами. */
export function Breaker(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5.5" y="4" width="9" height="12" rx="1" />
      <path d="M5.5 9h9" />
      <rect x="8.5" y="10.5" width="3" height="3.5" rx="0.5" />
      <path d="M8 2v2M12 2v2M8 16v2M12 16v2" />
    </Icon>
  );
}

/** Арматура и приводы: шаровой кран с рукояткой и фланцами. */
export function Valve(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="12" r="3.5" />
      <path d="M3.5 12h3M13.5 12h3" />
      <path d="M3.5 10v4M16.5 10v4" />
      <path d="M10 8.5V5" />
      <path d="M6.5 4h7" />
    </Icon>
  );
}

/** Насосное оборудование: улитка с патрубками и двигателем сверху. */
export function Pump(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8.5" cy="12.5" r="4.5" />
      <path d="M8.5 8v-2M4 12.5H2" />
      <path d="M13 12.5h4.5v-3" />
      <rect x="6" y="2.5" width="5" height="3.5" rx="0.5" />
    </Icon>
  );
}

/** Пневматика: цилиндр со штоком, проушиной и портами. */
export function Cylinder(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="7" width="8.5" height="6" rx="1" />
      <path d="M5 7V5.5M9.5 7V5.5" />
      <path d="M11.5 10h3.5" />
      <circle cx="16.5" cy="10" r="1.5" />
      <path d="M3 13v1.5M11.5 13v1.5" />
    </Icon>
  );
}

/** Прочее оборудование: щит с дверцей, ручкой и рейкой внутри. */
export function Cabinet(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="14" height="14" rx="1" />
      <path d="M11.5 3v14" />
      <path d="M5.5 7h4M5.5 10h4" />
      <path d="M13 9.5v2" />
    </Icon>
  );
}

export function Compare(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7.5h13m-3.5-3.5L16 7.5 12.5 11M17 12.5H4m3.5-3.5L4 12.5 7.5 16" />
    </Icon>
  );
}

export function Eye(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 10S5.5 5 10 5s7.5 5 7.5 5-3 5-7.5 5-7.5-5-7.5-5Z" />
      <circle cx="10" cy="10" r="2" />
    </Icon>
  );
}

export function Bell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9a4 4 0 1 1 8 0c0 3 1 4 1 4H5s1-1 1-4Z" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" />
    </Icon>
  );
}

export function Copy(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="7" width="9" height="9" rx="1.5" />
      <path d="M13 4.5H5.5A1.5 1.5 0 0 0 4 6v7" />
    </Icon>
  );
}

export function Trash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6" />
    </Icon>
  );
}

export function Cart(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 4h2l2.2 8.2h7.4L17 6.8H6.2" />
      <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function User(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="7.5" r="3" />
      <path d="M4 16.5c1.1-2.8 3.3-4.2 6-4.2s4.9 1.4 6 4.2" />
    </Icon>
  );
}

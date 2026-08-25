/**
 * Сборка каталога из выгрузки объявлений Avito (content/avito/items.json).
 *
 * Avito отдаёт только название, цену, категорию и ссылку — характеристик и
 * фотографий в API нет. Поэтому раздел, производитель и номиналы берутся
 * разбором названия: всё, что нельзя вытащить, остаётся пустым, а не
 * додумывается. Названия объявлений — авторские, их не переписываем.
 *
 * Запуск: pnpm catalog
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const items = JSON.parse(
  readFileSync(path.join(root, "content/avito/items.json"), "utf8"),
);
// Фотографии кладёт scripts/extract-avito-images.mjs из сохранённых страниц:
// на позицию их до пяти. Карты может не быть — тогда все позиции с шильдиком.
const imagesFile = path.join(root, "content/avito/images.json");
const images = existsSync(imagesFile)
  ? JSON.parse(readFileSync(imagesFile, "utf8"))
  : {};

/* ---------------------------------------------------------------- разделы */

const sections = [
  {
    slug: "kip-i-avtomatika",
    name: "КИП и датчики",
    summary:
      "Измерение давления, уровня, расхода и температуры: датчики, уровнемеры, расходомеры, реле протока.",
    groups: [
      { slug: "rashodomery", name: "Расходомеры" },
      { slug: "datchiki-davleniya", name: "Датчики давления" },
      { slug: "urovnemery", name: "Уровнемеры и датчики уровня" },
      { slug: "datchiki-temperatury", name: "Датчики температуры" },
      { slug: "analiz-i-sostav", name: "Анализ среды" },
      { slug: "datchiki-polozheniya", name: "Датчики положения и присутствия" },
      { slug: "tehnicheskoe-zrenie", name: "Техническое зрение и идентификация" },
      { slug: "bezopasnost", name: "Безопасность" },
    ],
  },
  {
    slug: "privodnaya-tehnika",
    name: "Приводная техника",
    summary:
      "Управление двигателями: частотные преобразователи, устройства плавного пуска, приводы постоянного тока, сервотехника.",
    groups: [
      { slug: "chastotnye-preobrazovateli", name: "Частотные преобразователи" },
      { slug: "ustroystva-plavnogo-puska", name: "Устройства плавного пуска" },
      { slug: "privody-postoyannogo-toka", name: "Приводы постоянного тока" },
      { slug: "servotehnika", name: "Серводвигатели и сервоусилители" },
      { slug: "motor-reduktory", name: "Мотор-редукторы и двигатели" },
    ],
  },
  {
    slug: "upravlenie-i-vizualizatsiya",
    name: "Управление и визуализация",
    summary:
      "Контроллеры, модули ввода-вывода, панели оператора, промышленные компьютеры и шлюзы связи.",
    groups: [
      { slug: "kontrollery", name: "Контроллеры и ПЛК" },
      { slug: "moduli-vvoda-vyvoda", name: "Модули ввода-вывода" },
      { slug: "paneli-operatora", name: "Панели оператора и HMI" },
      { slug: "promyshlennye-kompyutery", name: "Промышленные компьютеры" },
      { slug: "svyaz-i-shlyuzy", name: "Связь и шлюзы" },
      { slug: "avtomatika-ventilyatsii", name: "Автоматика вентиляции" },
      { slug: "regulyatory", name: "Регуляторы и самописцы" },
    ],
  },
  {
    slug: "elektrooborudovanie",
    name: "Электрооборудование",
    summary:
      "Коммутация и защита: автоматические выключатели, контакторы, реле, блоки питания, ИБП, шкафы.",
    groups: [
      { slug: "avtomaticheskie-vyklyuchateli", name: "Автоматические выключатели" },
      { slug: "kontaktory-i-puskateli", name: "Контакторы и пускатели" },
      { slug: "rele", name: "Реле" },
      { slug: "bloki-pitaniya", name: "Блоки питания" },
      { slug: "ibp", name: "Источники бесперебойного питания" },
      { slug: "shkafy-i-klimat", name: "Шкафы и климатика" },
      { slug: "kachestvo-seti", name: "Качество сети и защита" },
      { slug: "rubilniki-i-avr", name: "Рубильники и АВР" },
      { slug: "releynaya-zaschita", name: "Релейная защита" },
      { slug: "knopki-i-posty", name: "Кнопки и посты управления" },
      { slug: "osveschenie", name: "Освещение" },
    ],
  },
  {
    slug: "armatura-i-privody",
    name: "Арматура и приводы",
    summary:
      "Трубопроводная арматура и электроприводы к ней: краны, клапаны, задвижки, регулирующие узлы.",
    groups: [
      { slug: "krany-i-klapany", name: "Краны и клапаны" },
      { slug: "privody-armatury", name: "Приводы арматуры" },
    ],
  },
  {
    slug: "nasosy",
    name: "Насосное оборудование",
    summary:
      "Циркуляционные, дозировочные и многоступенчатые насосы для отопления, ГВС и водоподготовки.",
    groups: [
      { slug: "tsirkulyatsionnye-nasosy", name: "Циркуляционные насосы" },
      { slug: "dozirovochnye-nasosy", name: "Дозировочные насосы" },
      { slug: "nasosy-prochie", name: "Насосы прочие" },
    ],
  },
  {
    slug: "pnevmatika",
    name: "Пневматика",
    summary:
      "Пневмоострова, распределители, цилиндры и подготовка воздуха Festo, SMC, Camozzi.",
    groups: [
      { slug: "pnevmoostrova", name: "Пневмоострова и распределители" },
      { slug: "pnevmoprivody", name: "Цилиндры и приводы" },
    ],
  },
  {
    slug: "prochee-oborudovanie",
    name: "Прочее оборудование",
    summary:
      "Позиции, которые не укладываются в основные разделы: сетевое и торговое оборудование, техника, инструмент.",
    groups: [
      { slug: "setevoe-oborudovanie", name: "Сетевое оборудование" },
      { slug: "kabel-i-montazh", name: "Кабель и монтаж" },
      { slug: "instrument", name: "Инструмент и приборы" },
      { slug: "slabotochnye-sistemy", name: "Слаботочные системы" },
      { slug: "raznoe", name: "Разное" },
    ],
  },
];

/**
 * Правила разбора: первое совпадение выигрывает, поэтому порядок от частного
 * к общему. Ключи — по нормализованному названию (нижний регистр, ё→е).
 *
 * Границы слов у кириллицы пишем лукахедом `(?![а-яa-z0-9])`, а не `\b`:
 * в JS `\b` считает кириллицу не-буквой, и «реле» внутри фразы не находится.
 */
const rules = [
  // Насосы — раньше расходомеров: «дозировочный насос 15л/4бар» это насос.
  [/дозир|dosier|\bddi\b|\bddc\b|prominent|gamma/, "nasosy", "dozirovochnye-nasosy"],
  [/циркуляц|top-s|top-z|stratos|magna|\bipl\b|upml/, "nasosy", "tsirkulyatsionnye-nasosy"],
  [/насос|multicargo|многоступенч|grundfos|wilo/, "nasosy", "nasosy-prochie"],

  // Пневматика
  [/пневмоостров|распределител|festo|\bsmc\b|camozzi|пневмоклапан|пневмат/, "pnevmatika", "pnevmoostrova"],
  [/пневмоцилиндр|пневмопривод|цилиндр/, "pnevmatika", "pnevmoprivody"],

  // Приводная техника
  [/плавн(ого)? пуск|softstart|упп(?![а-яa-z0-9])|altistart|3rw/, "privodnaya-tehnika", "ustroystva-plavnogo-puska"],
  [/постоянного тока|\bdcm\b|dcs\d|тиристорн|возбужден/, "privodnaya-tehnika", "privody-postoyannogo-toka"],
  [/серво|servo|sinamics s|lexium|шагов(ый|ые) двигател|моментный двигател/, "privodnaya-tehnika", "servotehnika"],
  [/мотор-?редуктор|редуктор|электродвигател|двигатель асинхрон|асинхронн(ый|ые) двигател/, "privodnaya-tehnika", "motor-reduktory"],
  [/преобразовател[ьи]? частоты|преобр(?:азов)? частоты|частотн|inverter|altivar|micromaster|sinamics|повышающ част|\bвфд\b|\bпчв?(?![а-яa-z0-9])/, "privodnaya-tehnika", "chastotnye-preobrazovateli"],

  // Управление и визуализация
  [/автоматика для вентиляц|для вентиляции автоматика|автоматика вентиляц|вентиляции автоматика|фанкойл|приточн|гелиосистем/, "upravlenie-i-vizualizatsiya", "avtomatika-ventilyatsii"],
  [/панел[ьи] оператор|\bhmi\b|hmidt|hmigt|дисплей|сенсорн(ая|ые|ый)? ?панел|simatic (tp|op|ktp|comfort)|panel 500|xbtrgt|операторск/, "upravlenie-i-vizualizatsiya", "paneli-operatora"],
  [/промышлен{1,2}(ый|ые|ая|ое)? ?(сенсорн|компьютер|пк|монитор|мультитач)|\bipc\b|панельн(ый|ые) пк|мультитач|магелис|magelis ipc|монитор(?![а-яa-z0-9])/, "upravlenie-i-vizualizatsiya", "promyshlennye-kompyutery"],
  [/модул[ьи] (ввода|вывода|аналог|дискрет|расширен|связи)|et 200|модули simatic|модуль ввода|цпу|\bcpu\b|процессорн(ый|ые) модул|melsec|x20cp|модул[ьи](?![а-яa-z0-9])|модуль(?![а-яa-z0-9])/, "upravlenie-i-vizualizatsiya", "moduli-vvoda-vyvoda"],
  [/самописец|самописц|регистратор|регулятор темп|пид-?регулятор|терморегулятор|logoscreen|менеджер горения/, "upravlenie-i-vizualizatsiya", "regulyatory"],
  [/шлюз|коммуникац|profibus|profinet|modbus tcp|интерфейсн(ый|ые) модул|конвертер интерфейс|медиаконвертер|interbus|\bhart\b|rs-?485|rs-?232|модем|конвертер|интерфейс|беспроводн|\bknx\b|канальн(ый|ые) адаптер/, "upravlenie-i-vizualizatsiya", "svyaz-i-shlyuzy"],
  [/контроллер|плк(?![а-яa-z0-9])|logo!|s7-|simatic|modicon|micrologix|compactlogix|система упр|блок управлен|устройство управлен|позиционер/, "upravlenie-i-vizualizatsiya", "kontrollery"],

  // Арматура
  [/привод(ы)? (упр|клапан|для клапан|задвиж)|электропривод|belimo|актуатор|привод(ы)? арматур|ebro|заслон/, "armatura-i-privody", "privody-armatury"],
  [/кран(?![а-яa-z0-9])|краны|клапан|задвижк|затвор|вентил[ья] регулир|сепаратор|редукц/, "armatura-i-privody", "krany-i-klapany"],

  // КИП
  [/расходомер|promag|promass|sitrans f|вихрев|кориолис|термомассов|реле проток|реле потока|счетчик воды|расход(а|ом)/, "kip-i-avtomatika", "rashodomery"],
  [/уровнемер|датчик(и|ов)? уровня|уровня|радарн|микроимпульсн|поплавков|vegapuls|sitrans l|vegamet/, "kip-i-avtomatika", "urovnemery"],
  [/давлени|прессостат|манометр|sitrans p|cerabar|deltabar|wika|тензо|весов/, "kip-i-avtomatika", "datchiki-davleniya"],
  [/температур|pt100|термопар|термосопротивл|термометр|термостат|калориметр|точки росы/, "kip-i-avtomatika", "datchiki-temperatury"],
  [/\bph\b|\brh\b|кондуктометр|проводимост|анализатор|газоанализ|влажност|кислород|мутност|aquis|хлор|\bсо2\b|\bco2\b|мониторинг(а)? вод|ультрафиолетов/, "kip-i-avtomatika", "analiz-i-sostav"],
  [/световой барьер|барьер безопасности|аварийн(ая|ой|ые|ый) (кнопк|безопасн|выключател|останов)|безопасност|schmersal|искробезопасн|барьер|взрывозащищ(енн)?(ый|ые|ая)? ?(шинн|терминал|коробк)/, "kip-i-avtomatika", "bezopasnost"],
  [/техническ(ого|ое) зрен|камера|сканер|штрих-?код|дефектоскоп|зрения|видеокамер|matrix 2\d\d/, "kip-i-avtomatika", "tehnicheskoe-zrenie"],
  [/индуктивн|концевой|бесконтактн|фотодатчик|оптическ(ий|ие) датчик|энкодер|датчик положения|лазерн(ый|ые) датчик|\bsick\b|\bifm\b|датчик расстоян|ультразвуков(ой|ые) датчик|датчик двойного|датчик(и|ов)?(?![а-яa-z0-9])/, "kip-i-avtomatika", "datchiki-polozheniya"],

  // Электрооборудование
  [/реле защиты|терминал защиты|защит[аы] двигател|sepam|micom|symap|защит(ы|а) фидер|арн(?![а-яa-z0-9])|защит(ы|а) генератор/, "elektrooborudovanie", "releynaya-zaschita"],
  [/рубильник|разъединител|выключател[ьи] нагрузк|авр(?![а-яa-z0-9])|ввод(а)? резерв|переключател[ьи] кулачков|кулачков/, "elektrooborudovanie", "rubilniki-i-avr"],
  [/автоматическ(ий|ие) выкл|автомат выкл|выключател[ьи] автоматическ|masterpact|emax|tmax|\bnsx\b|\bns\d|компактн(ый|ые) автомат|узо(?![а-яa-z0-9])|дифавтомат|автоматическ(ий|ие) выключател|выключател[ьи] вакуумн|высоковольтн/, "elektrooborudovanie", "avtomaticheskie-vyklyuchateli"],
  [/контактор|пускател/, "elektrooborudovanie", "kontaktory-i-puskateli"],
  [/ибп(?![а-яa-z0-9])|источник(и)? бесперебойн|\bups\b|аккумулятор|инвертор|зарядн(ое|ые) устройств|аварийн(ого)? питани/, "elektrooborudovanie", "ibp"],
  [/блок(и)? питания|источник(и)? питания|sitop|\bбп(?![а-яa-z0-9])/, "elektrooborudovanie", "bloki-pitaniya"],
  [/шкаф|кондиционер|охладител|rittal|климат|вентилятор|обогрев|корпус(а)? для|бокс(?![а-яa-z0-9])/, "elektrooborudovanie", "shkafy-i-klimat"],
  [/анализатор сети|измеритель мощност|счетчик электро|фильтр гармоник|компенсац|качеств[оа] сети|accusine|измерительн(ый|ые) прибор|мультиметр|контрол[ья] напряжен|контрол[ья] фаз|перенапряж|узип|ограничител[ьи] перенапряж/, "elektrooborudovanie", "kachestvo-seti"],
  [/пост управлен|кнопк|переключател|джойстик|манипулятор|сигнальн(ая|ые) колонн|индикац|пульт|потенциометр|индикатор положен/, "elektrooborudovanie", "knopki-i-posty"],
  [/реле(?![а-яa-z0-9])|таймер|оптрон|твердотельн/, "elektrooborudovanie", "rele"],

  [/светильник|прожектор|светодиодн|лампа|лампы|освещен/, "elektrooborudovanie", "osveschenie"],

  // Прочее
  [/домофон|видеовызов|видеостанц|станция видеовызов|оповещен|считывател|скуд|видеонаблюден|аудио/, "prochee-oborudovanie", "slabotochnye-sistemy"],
  [/точка доступа|коммутатор|маршрутизатор|cisco|роутер|\bswitch\b|патч|сетев(ой|ые) адаптер|\bwi-?fi\b/, "prochee-oborudovanie", "setevoe-oborudovanie"],
  [/кабел|провод(?![а-яa-z0-9])|клемм|разъем|разъём|гофр|лоток|din-?рейк|наконечник|сальник/, "prochee-oborudovanie", "kabel-i-montazh"],
  [/инструмент|кримпер|обжим|тестер|калибратор|паяльн|мультиметр|поиск утечек/, "prochee-oborudovanie", "instrument"],
];

/** Производители: канонические имена и как они пишутся в объявлениях. */
const brands = [
  ["Siemens", /siemens|simatic|sitrans|sinamics|sitop|sicam|siplus/],
  ["Schneider Electric", /schneider|шнейдер|magelis|altivar|altistart|masterpact|acti ?9|spacelogic|accusine|modicon|telemecanique/],
  ["ABB", /\babb\b|emax|tmax|dcs\d/],
  ["Endress+Hauser", /endress|promag|promass|cerabar|deltabar|liquiline|micropilot/],
  ["Grundfos", /grundfos|magna\d|\bddi\b|\bddc\b|\bdda\b/],
  ["Wilo", /\bwilo\b|top-s|top-z|stratos|multicargo/],
  ["Danfoss", /danfoss|данфосс|ридан|\bvlt\b/],
  ["Festo", /\bfesto\b|vsva|cpv\d/],
  ["SMC", /\bsmc\b/],
  ["Jumo", /\bjumo\b|aquis/],
  ["Rosemount", /rosemount|emerson|эмерсон/],
  ["Krohne", /krohne|optiflux|optimass/],
  ["Vega", /\bvega\b|vegapuls|vegabar/],
  ["IFM", /\bifm\b|efector/],
  ["Sick", /\bsick\b/],
  ["Omron", /omron|омрон/],
  ["Mitsubishi", /mitsubishi|мицубиси/],
  ["Allen-Bradley", /allen-?bradley|rockwell|micrologix|compactlogix|powerflex/],
  ["Honeywell", /honeywell/],
  ["Wika", /\bwika\b/],
  ["Rittal", /rittal|риттал/],
  ["Legrand", /legrand|легранд/],
  ["Carel", /\bcarel\b/],
  ["ProMinent", /prominent/],
  ["Belimo", /belimo/],
  ["Yokogawa", /yokogawa/],
  ["Phoenix Contact", /phoenix contact|phoenix/],
  ["Weidmüller", /weidm(u|ü)ller/],
  ["Pepperl+Fuchs", /pepperl/],
  ["Baumer", /baumer/],
  ["Turck", /\bturck\b/],
  ["Balluff", /balluff/],
  ["Burkert", /b(u|ü)rkert|буркерт/],
  ["Samson", /samson/],
  ["Nord", /\bnord\b/],
  ["SEW", /\bsew\b|eurodrive/],
  ["Lenze", /lenze/],
  ["Delta", /\bdelta\b/],
  ["Systeme Electric", /systeme electric|систэм электрик/],
  ["Elhart", /elhart|элхарт/],
  ["ОВЕН", /овен|\bowen\b/],
  ["Cisco", /cisco/],
  ["Control Techniques", /control techniques/],
  ["TopWorx", /topworx/],
  ["Videojet", /videojet/],
  ["Asco", /\basco\b/],
  ["Honsberg", /honsberg/],
  ["Emco", /\bemco\b/],
  ["Eaton", /\beaton\b|moeller/],
  ["Bartec", /bartec/],
  ["Bosch Rexroth", /rexroth|\bbosch\b/],
  ["Метран", /метран|metran/],
  ["Aplisens", /aplisens/],
  ["Nivelco", /nivelco/],
  ["Fanuc", /fanuc/],
  ["Hyundai", /hyundai/],
  ["Ziehl-Abegg", /ziehl/],
  ["KSB", /\bksb\b/],
  ["Lowara", /lowara/],
  ["Camozzi", /camozzi/],
  ["Advantech", /advantech/],
  ["B&R", /b&r|bur ?automation/],
  ["Kobold", /kobold/],
  ["Banner", /banner/],
  ["Sauter", /sauter/],
  ["Systemair", /systemair|\bregin\b/],
  ["Carrier", /carrier/],
  ["Buderus", /buderus/],
  ["Schmersal", /schmersal/],
  ["Merlin Gerin", /merlin gerin/],
  ["Toshiba", /toshiba/],
  ["Panasonic", /panasonic/],
  ["Datalogic", /datalogic/],
  ["Satec", /\bsatec\b/],
  ["Xantrex", /xantrex/],
  ["Ippon", /ippon/],
  ["КЭАЗ", /\bkeaz\b|кэаз/],
  ["ONI", /\boni\b/],
  ["ESA", /\besa\b/],
  ["Labkotec", /labkotec/],
  ["Seko", /\bseko\b/],
  ["HygroMatik", /hygromatik/],
  ["Perma", /\bperma\b/],
  ["Isra Vision", /isra ?vision/],
  ["Metronic", /metronic/],
  ["EGE", /ege-?elektronik/],
  ["Klaschka", /klaschka/],
  ["Kemper", /kemper/],
  ["Spamel", /spamel/],
  ["Mitutoyo", /mitutoyo/],
  ["Sico", /\bsico\b/],
  ["Philips", /philips/],
  ["E+E Elektronik", /e\+e elektronik/],
  ["Micro Motion", /micro ?motion/],
  ["IMI", /\bimi\b/],
];

/** Страна производства — в объявлениях её пишут словом, это не бренд. */
const countries = [
  ["Германия", /герман/],
  ["Италия", /итали/],
  ["Швейцария", /швейцар/],
  ["Франция", /франц/],
  ["Япония", /япон/],
  ["США", /\bсша\b|\busa\b/],
  ["Китай", /кита[йе]/],
  ["Канада", /канад/],
  ["Австрия", /австри/],
  ["Россия", /росси/],
];

/* ------------------------------------------------------- разбор названия */

const norm = (value) => value.toLowerCase().replace(/ё/g, "е");

/**
 * В объявлениях латиница нередко набрана с кириллическими двойниками
 * («Siеmens» через русскую «е»). Для поиска бренда складываем их в латиницу.
 */
const HOMOGLYPHS = { а: "a", е: "e", о: "o", с: "c", р: "p", х: "x", у: "y", к: "k", м: "m", т: "t", в: "b", н: "h" };
const fold = (value) => norm(value).replace(/[аеосрхукмтвн]/g, (char) => HOMOGLYPHS[char]);

function classify(title) {
  const text = norm(title);
  for (const [pattern, section, group] of rules) {
    if (pattern.test(text)) return { section, group };
  }
  return { section: "prochee-oborudovanie", group: "raznoe" };
}

function brandOf(title) {
  const text = norm(title);
  const latin = fold(title);
  for (const [name, pattern] of brands) {
    if (pattern.test(text) || pattern.test(latin)) return name;
  }
  return "";
}

function countryOf(title) {
  const text = norm(title);
  for (const [name, pattern] of countries) if (pattern.test(text)) return name;
  return "";
}

/**
 * Номиналы из названия. Берём только то, что там прямо написано:
 * «2.2kW» → «2,2 кВт», «DN65» → «Ду 65», «230V» → «230 В».
 */
/** Склонение по числу: 1 канал, 2 канала, 8 каналов. */
function plural(count, one, few, many) {
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = count % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function paramsOf(title) {
  const specs = {};
  const text = title.replace(/,/g, ".");
  const add = (key, value) => {
    if (!specs[key]) specs[key] = value;
  };
  const ru = (value) => String(value).replace(".", ",");

  const power = text.match(/(\d+(?:\.\d+)?)\s*(?:kw|квт|kвт)(?![а-яa-z0-9])/i);
  if (power) add("Мощность", `${ru(power[1])} кВт`);

  // Цифра, приклеенная к буквам, — часть модели, а не ток: «EC7850A»
  // и «Micrologic 5.2A» давали 7850 А и 5,2 А. Число должно стоять
  // отдельно, а из нескольких кандидатов берём наибольший: в «5.2A 100A»
  // ток — это 100 А, а 5.2 — индекс серии.
  const currents = [
    ...text.matchAll(/(?<![A-Za-zА-Яа-я\d.,-])(\d+(?:\.\d+)?)\s*(?:а|a|ампер)(?![а-яa-z0-9])/gi),
  ].map((match) => Number(match[1]));
  if (currents.length > 0) {
    add("Номинальный ток", `${ru(Math.max(...currents))} А`);
  }

  // «RS-232» и «RS-485» — интерфейсы, а не вольты: цифра после дефиса
  // напряжением быть не может.
  // Та же оговорка, что у тока: число должно стоять отдельно, иначе
  // в напряжение попадают индексы моделей. «RS-232» и «RS-485» —
  // интерфейсы, их выбрасываем до разбора.
  const voltage = text
    .replace(/rs-?\d{3}/gi, " ")
    .match(/(?<![A-Za-zА-Яа-я\d.,-])(\d{2,4})\s*(?:v|в|вольт)(?:ac|dc|~)?(?![а-яa-z0-9])/i);
  if (voltage) add("Напряжение", `${voltage[1]} В`);

  const dn = text.match(/(?:\bdn|\bду)\s*(\d{2,4})/i);
  if (dn) add("Условный проход", `Ду ${dn[1]}`);

  // Резьбовое присоединение пишут дюймами: G1/2", 3/4".
  const thread = text.match(/\bg\s?(\d(?:\/\d)?)"?|(?<![\d.])(\d\/\d)"/i);
  if (thread) add("Присоединение", `G${thread[1] ?? thread[2]}″`);

  const pressure = text.match(/(\d+(?:\.\d+)?)\s*(?:бар|bar)(?![а-яa-z0-9])/i);
  if (pressure) add("Давление", `${ru(pressure[1])} бар`);
  const mbar = text.match(/(\d+(?:\.\d+)?)\s*(?:мбар|mbar|mba)(?![а-яa-z0-9])/i);
  if (mbar) add("Давление", `${ru(mbar[1])} мбар`);

  // Температуру пишут по-разному: «+350гр», «+150C», «280°С».
  const temperature = text.match(/([+-]?\d{2,3})\s*(?:°\s*[cсCС]|гр(?:ад)?|\bC(?![а-яa-z0-9]))/);
  if (temperature) add("Температура", `${temperature[1]} °C`);

  // Производительность насосов и расходомеров.
  const flowHour = text.match(/(\d+(?:\.\d+)?)\s*(?:л\/ч|l\/h)/i);
  if (flowHour) add("Производительность", `${ru(flowHour[1])} л/ч`);
  const flowMin = text.match(/(\d+(?:\.\d+)?)\s*(?:л\/мин|l\/min)/i);
  if (flowMin) add("Производительность", `${ru(flowMin[1])} л/мин`);
  const flowCube = text.match(/(\d+(?:\.\d+)?)\s*(?:м3|м³)\s*\/\s*ч/i);
  if (flowCube) add("Производительность", `${ru(flowCube[1])} м³/ч`);

  const ip = text.match(/\bip\s?(\d{2})(?![а-яa-z0-9])/i);
  if (ip) add("Степень защиты", `IP${ip[1]}`);

  const diagonal = text.match(/(\d{1,2}(?:\.\d)?)\s*"/);
  if (diagonal && !thread) add("Диагональ", `${ru(diagonal[1])}″`);

  // Цифра перед «P» должна стоять отдельно: в «Promag 50P» это модель,
  // а не число полюсов.
  const poles = text.match(/(?<![\dA-Za-zА-Яа-я.-])(\d)\s*(?:полюс|p\+n|p(?![а-яa-z0-9]))/i);
  if (poles) add("Полюсов", `${poles[1]}P`);

  // Значения попадают в параметрическую строку без названий полей,
  // поэтому единица измерения должна стоять в самом значении.
  const channels = text.match(/(\d{1,2})\s*(?:канал|точ(?:ек|ки)|входов|выходов)/i);
  if (channels) add("Каналов", `${channels[1]} ${plural(Number(channels[1]), "канал", "канала", "каналов")}`);

  // Выходной сигнал и интерфейс связи — то, по чему прибор подбирают в щит.
  const signal = text.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*(?:ma|мa|ма)(?![а-яa-z0-9])/i);
  if (signal) add("Выходной сигнал", `${signal[1]}–${signal[2]} мА`);

  const buses = [
    ["Modbus", /modbus/i],
    ["Profibus", /profibus/i],
    ["Profinet", /profinet/i],
    ["HART", /\bhart\b/i],
    ["Ethernet", /ethernet|ethercat/i],
    ["KNX", /\bknx\b/i],
    ["IO-Link", /io-?link/i],
    ["CANopen", /canopen|\bcan\b/i],
    ["BACnet", /bacnet/i],
    ["M-Bus", /m-?bus/i],
    ["RS-485", /rs-?485/i],
  ];
  const found = buses.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  if (found.length > 0) add("Интерфейс", found.join(", "));

  // Принцип измерения — половина названий им и начинается, а для подбора
  // датчика это первое, что спрашивают.
  const principles = [
    ["ультразвуковой", /ультразвуков/i],
    ["радарный", /радарн|микроимпульсн/i],
    ["лазерный", /лазерн/i],
    ["электромагнитный", /электромагнитн|эл-?магнитн/i],
    ["кориолисовый", /кориолис/i],
    ["вихревой", /вихрев/i],
    ["термомассовый", /термомассов/i],
    ["гидростатический", /гидростат/i],
    ["поплавковый", /поплавков/i],
    ["ёмкостный", /[ёе]мкостн/i],
    ["индуктивный", /индуктивн/i],
    ["оптический", /оптическ|фотоэлектр/i],
    ["погружной", /погружн/i],
  ];
  const principle = principles.find(([, pattern]) => pattern.test(text));
  if (principle) add("Принцип", principle[0]);

  // Дальность и диапазон: «до 4 метров», «50m», «до 10 метров».
  const range = text.match(/(?:до\s*)?(\d+(?:\.\d+)?)\s*(?:метр(?:ов|а)?|\bм(?![а-яa-z0-9])|\bm(?![а-яa-z0-9]))/i);
  if (range) add("Диапазон", `${ru(range[1])} м`);

  // Только явное «Nшт»: «4 насоса» в названии — это сколько насосов
  // обслуживает контроллер, а не сколько штук в лоте.
  const pieces = text.match(/(\d{1,3})\s*шт(?![а-яa-z0-9])/i);
  if (pieces) add("В лоте", `${pieces[1]} шт`);

  const sensor = text.match(/\bpt\s?(100|1000)\b/i);
  if (sensor) add("Тип датчика", `Pt${sensor[1]}`);
  if (/термопар/i.test(text)) add("Тип датчика", "термопара");

  const materials = [
    ["нержавеющая сталь", /нерж|inox|aisi/i],
    ["бронза", /бронз/i],
    ["чугун", /чугун/i],
    ["ПВХ", /\bпвх\b|\bpvc\b/i],
    ["латунь", /латун/i],
  ];
  const material = materials.find(([, pattern]) => pattern.test(text));
  if (material) add("Материал", material[0]);

  if (/\bex\b|atex|взрывозащ|eex|искробезопас/i.test(text)) {
    add("Исполнение", "взрывозащищённое");
  }
  if (/гигиенич/i.test(text)) add("Исполнение", "гигиеническое");
  if (/(?:^|[^а-я])нов(?:ый|ые|ая|ое)(?![а-я])|с хранения/i.test(title)) {
    add("Состояние", "новое");
  }

  const country = countryOf(title);
  if (country) add("Производство", country);

  return specs;
}

/**
 * Код позиции — её номер у продавца. Модель из названия вытаскивается
 * ненадёжно («2.2kW» и «DN50» ловятся как артикул), а номер однозначен:
 * по нему менеджер находит позицию у себя.
 */
function articleOf(id) {
  return String(id);
}

const slugMap = new Map();
function slugify(title, id) {
  const base = norm(title)
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 7)
    .join("-");
  const translit = base.replace(/[а-я]/g, (char) => TRANSLIT[char] ?? "");
  const clean = translit.replace(/-+/g, "-").replace(/^-|-$/g, "") || "poziciya";
  const slug = slugMap.has(clean) ? `${clean}-${id}` : clean;
  slugMap.set(clean, true);
  return slug;
}

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/* ------------------------------------------------------------- сборка */

const products = items.map((item) => {
  const { section, group } = classify(item.title);
  const specs = paramsOf(item.title);
  // Страна в параметрической строке перебивала номиналы, а на шильдике
  // «Германия» вместо «Ду 50» — не то, по чему позицию узнают.
  const technical = Object.fromEntries(
    Object.entries(specs).filter(([key]) => key !== "Производство"),
  );
  return {
    slug: slugify(item.title, item.id),
    name: item.title.trim(),
    article: articleOf(item.id),
    brand: brandOf(item.title),
    section,
    group,
    unit: "шт",
    price: item.price,
    inStock: item.status === "active",
    specs,
    params: Object.values(technical),
    images: images[item.id] ?? [],
    address: item.address ?? "",
  };
});

// Разделы без позиций на витрину не выводим: пустая рубрика хуже её отсутствия.
const used = new Set(products.map((product) => `${product.section}/${product.group}`));
const liveSections = sections
  .map((section) => ({
    ...section,
    groups: section.groups.filter((group) => used.has(`${section.slug}/${group.slug}`)),
  }))
  .filter((section) => section.groups.length > 0);

writeFileSync(
  path.join(root, "content/catalog/sections.json"),
  `${JSON.stringify(liveSections, null, 2)}\n`,
);
writeFileSync(
  path.join(root, "content/catalog/products.json"),
  `${JSON.stringify(products, null, 2)}\n`,
);

/* --------------------------------------------------------------- отчёт */

const byGroup = {};
for (const product of products) {
  const key = `${product.section}/${product.group}`;
  byGroup[key] = (byGroup[key] ?? 0) + 1;
}
const noBrand = products.filter((product) => !product.brand).length;
const noParams = products.filter((product) => product.params.length === 0).length;

console.log(`Позиций: ${products.length}`);
console.log(
  Object.entries(byGroup)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `  ${count.toString().padStart(4)}  ${key}`)
    .join("\n"),
);
console.log(`Без производителя: ${noBrand}. Без номиналов: ${noParams}.`);

if (process.argv.includes("--misc")) {
  console.log("\nПопало в «Разное»:");
  console.log(
    products
      .filter((product) => product.group === "raznoe")
      .slice(0, 80)
      .map((product) => `  ${product.name}`)
      .join("\n"),
  );
}

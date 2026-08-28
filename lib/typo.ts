/**
 * Переносы и неразрывные пробелы по правилам русской типографики.
 *
 * Полагаться на `hyphens: auto` нельзя: словарь переносов Chrome тянет
 * отдельным компонентом, и на телефоне его может не оказаться — тогда
 * длинное слово рвётся посреди слога: «Электрообор|удование». Поэтому
 * мягкие переносы расставляем сами, а `hyphens` оставляем ручным:
 * результат одинаков во всех браузерах и не зависит от словаря.
 */

const SHY = "­";
const NBSP = " ";

const VOWELS = "аеёиоуыэюя";
/** Ь, Ъ и Й не начинают строку: перенос перед ними запрещён. */
const NEVER_STARTS = "ьъй";

const isVowel = (letter: string) => VOWELS.includes(letter.toLowerCase());
const hasVowel = (part: string) => [...part].some(isVowel);

/**
 * Слоговые переносы одного слова.
 *
 * Разрешаем ровно два стыка, оба законные:
 *   гласная | согласная + гласная — «обо-рудование»;
 *   согласная | согласная         — «элек-тро», «конь-ки».
 * Обе части обязаны содержать гласную (часть без гласной — не слог),
 * слева оставляем минимум две буквы, справа переносим минимум три:
 * одну-две буквы отрывать нельзя.
 */
function hyphenateWord(word: string): string {
  const out: string[] = [];

  for (let index = 0; index < word.length; index += 1) {
    out.push(word[index]);

    const left = word.slice(0, index + 1);
    const right = word.slice(index + 1);
    if (left.length < 2 || right.length < 3) continue;
    if (!hasVowel(left) || !hasVowel(right)) continue;
    if (NEVER_STARTS.includes(word[index + 1].toLowerCase())) continue;

    const here = word[index];
    const next = word[index + 1];
    const after = word[index + 2];

    const openSyllable = isVowel(here) && !isVowel(next) && isVowel(after);
    const consonantPair = !isVowel(here) && !isVowel(next);
    if (openSyllable || consonantPair) out.push(SHY);
  }

  return out.join("");
}

/**
 * Однобуквенные слова не остаются в конце строки: союз «и» и предлоги
 * «в», «с», «к», «о», «у» уезжают на новую строку вместе со своим словом.
 */
function glueShortWords(text: string): string {
  return text.replace(/(^|[\s(«])([А-Яа-яЁёA-Za-z])\s+/g, `$1$2${NBSP}`);
}

/**
 * Строка, готовая к вёрстке в узкой колонке.
 *
 * Переносим только слова от десяти букв: в колонку шириной в половину
 * телефона помещается около двенадцати знаков, и всё, что короче,
 * встаёт на строку целиком. Рвать «датчики» незачем — «КИП и датчики»
 * читается лучше в две строки, чем с переносом.
 */
export function typo(text: string): string {
  return glueShortWords(text).replace(/[А-Яа-яЁё]{10,}/g, hyphenateWord);
}

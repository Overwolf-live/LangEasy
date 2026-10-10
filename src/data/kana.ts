import type { KanaItem } from '../types'

type Row = [string, string[][]]
// [kana, ...romaji variants]; first romaji is the primary one
const HIRA_ROWS: Row[] = [
  ['a', [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']]],
  ['k', [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']]],
  ['s', [['さ', 'sa'], ['し', 'shi', 'si'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']]],
  ['t', [['た', 'ta'], ['ち', 'chi', 'ti'], ['つ', 'tsu', 'tu'], ['て', 'te'], ['と', 'to']]],
  ['n', [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']]],
  ['h', [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu', 'hu'], ['へ', 'he'], ['ほ', 'ho']]],
  ['m', [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']]],
  ['y', [['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo']]],
  ['r', [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']]],
  ['w', [['わ', 'wa'], ['を', 'wo', 'o'], ['ん', 'n', 'nn']]],
  ['g', [['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go']]],
  ['z', [['ざ', 'za'], ['じ', 'ji', 'zi'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo']]],
  ['d', [['だ', 'da'], ['で', 'de'], ['ど', 'do']]],
  ['b', [['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo']]],
  ['p', [['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po']]],
  ['ky', [['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'], ['しゃ', 'sha', 'sya'], ['しゅ', 'shu', 'syu'], ['しょ', 'sho', 'syo']]],
  ['ch', [['ちゃ', 'cha', 'tya'], ['ちゅ', 'chu', 'tyu'], ['ちょ', 'cho', 'tyo'], ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo']]],
  ['hy', [['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'], ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo']]],
  ['ry', [['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'], ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo']]],
  ['jy', [['じゃ', 'ja', 'jya', 'zya'], ['じゅ', 'ju', 'jyu', 'zyu'], ['じょ', 'jo', 'jyo', 'zyo'], ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'], ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo']]],
]

const toKata = (s: string) => [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).join('')

export const KANA_ROWS: string[] = HIRA_ROWS.map((r) => r[0])

export const HIRAGANA: KanaItem[] = HIRA_ROWS.flatMap(([row, items]) =>
  items.map(([k, ...ro]) => ({ k, ro, type: 'hira' as const, row })),
)
export const KATAKANA: KanaItem[] = HIRA_ROWS.flatMap(([row, items]) =>
  items.map(([k, ...ro]) => ({ k: toKata(k), ro, type: 'kata' as const, row })),
)
export const ALL_KANA = [...HIRAGANA, ...KATAKANA]

/** Lesson groups of rows */
export const KANA_GROUPS: { title: string; rows: string[] }[] = [
  { title: 'あ・か ряди', rows: ['a', 'k'] },
  { title: 'さ・た ряди', rows: ['s', 't'] },
  { title: 'な・は ряди', rows: ['n', 'h'] },
  { title: 'ま・や・ら・わ', rows: ['m', 'y', 'r', 'w'] },
  { title: 'Дзвінкі (が・ざ・だ)', rows: ['g', 'z', 'd'] },
  { title: 'Дзвінкі (ば・ぱ)', rows: ['b', 'p'] },
  { title: 'Сполучення I', rows: ['ky', 'ch'] },
  { title: 'Сполучення II', rows: ['hy', 'ry', 'jy'] },
]

/** Romaji → hiragana. Accepts mixed input; non-latin chars pass through. */
const R2H = new Map<string, string>()
for (const [, items] of HIRA_ROWS) for (const [k, ...ro] of items) for (const r of ro) if (!R2H.has(r)) R2H.set(r, k)
const SMALL: Record<string, string> = { a: 'ぁ', i: 'ぃ', u: 'ぅ', e: 'ぇ', o: 'ぉ' }
for (const [v, k] of Object.entries(SMALL)) R2H.set('l' + v, k), R2H.set('x' + v, k)
R2H.set('xtsu', 'っ'); R2H.set('ltu', 'っ'); R2H.set('xya', 'ゃ'); R2H.set('xyu', 'ゅ'); R2H.set('xyo', 'ょ')
R2H.set('-', 'ー')
for (const [r, k] of [['fa', 'ふぁ'], ['fi', 'ふぃ'], ['fe', 'ふぇ'], ['fo', 'ふぉ'], ['ti', 'てぃ'], ['di', 'でぃ'], ['wi', 'うぃ'], ['we', 'うぇ'], ['je', 'じぇ'], ['she', 'しぇ'], ['che', 'ちぇ']] as const) R2H.set(r, k)
R2H.set('ti', 'ち'); R2H.set('di', 'ぢ'); R2H.set('du', 'づ')

export function toHira(input: string, final = true): string {
  const s = input.toLowerCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (!/[a-z\-]/.test(c)) { out += c; i++; continue }
    // sokuon: doubled consonant (not n)
    if (i + 1 < s.length && c === s[i + 1] && /[bcdfghjklmpqrstvwxyz]/.test(c)) { out += 'っ'; i++; continue }
    if (c === 'n') {
      const nx = s[i + 1]
      if (nx === undefined) { if (final) out += 'ん'; else out += 'n'; i++; continue }
      if (nx === "'" ) { out += 'ん'; i += 2; continue }
      if (!/[aiueoy]/.test(nx)) { out += 'ん'; i += (nx === 'n' ? 2 : 1); continue }
    }
    let matched = false
    for (const len of [4, 3, 2, 1]) {
      const chunk = s.slice(i, i + len)
      const h = R2H.get(chunk)
      if (h && chunk.length === len) { out += h; i += len; matched = true; break }
    }
    if (!matched) {
      // incomplete sequence at the tail while typing — keep raw; otherwise skip char
      out += s[i]; i++
    }
  }
  return out
}

/** Katakana → hiragana (for comparing readings) */
export function kataToHira(s: string): string {
  return [...s].map((c) => {
    const n = c.charCodeAt(0)
    return n >= 0x30a1 && n <= 0x30f6 ? String.fromCharCode(n - 0x60) : c
  }).join('')
}

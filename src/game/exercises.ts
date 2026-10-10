import type { Ex, Block } from '../types'
import { ALL_KANA } from '../data/kana'
import { KANJI_MAP, VOCAB_MAP, SENT_MAP, KANJI, VOCAB } from '../data/index'
import { kataToHira } from '../data/kana'

export const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}
const pick = <T,>(a: T[], n: number, not: (t: T) => boolean = () => false): T[] => shuffle(a.filter((x) => !not(x))).slice(0, n)

/** build a choice from correct answer + distractors (unique strings) */
function mk(prompt: string, correct: string, pool: string[], key: string, extra: Partial<Extract<Ex, { t: 'choice' }>> = {}): Ex {
  const ds = [...new Set(pool.filter((p) => p && p !== correct))]
  const opts = shuffle([correct, ...pick(ds, 3)])
  return { t: 'choice', prompt, options: opts, answer: opts.indexOf(correct), key, ...extra }
}

const kataKey = new Map(ALL_KANA.map((k) => ['kana:' + k.k, k]))

function kanaEx(key: string, pool: string[]): Ex[] {
  const it = kataKey.get(key)!
  const all = pool.map((k) => kataKey.get(k)!).filter(Boolean)
  const same = ALL_KANA.filter((k) => k.type === it.type)
  const ro = it.ro[0]
  const near = [...all, ...same]
  return [
    mk('Як читається цей знак?', ro, near.map((k) => k.ro[0]), key, { big: it.k, speak: it.k }),
    mk('Обери знак для звуку', it.k, near.map((k) => k.k), key, { big: ro }),
    { t: 'type', prompt: 'Впиши ромадзі', big: it.k, mode: 'romaji', answers: it.ro, show: ro, key, speak: it.k },
    { t: 'draw', prompt: 'Намалюй знак по памʼяті', ch: it.k, hint: ro, key },
  ]
}

function kanjiEx(key: string, pool: string[]): Ex[] {
  const k = KANJI_MAP.get(key)!
  const near = pool.map((p) => KANJI_MAP.get(p)!).filter(Boolean)
  const wide = [...near, ...KANJI.filter((x) => x.l === k.l)]
  const reading = (k.kun[0] ?? k.on[0] ?? '')
  const out: Ex[] = [
    mk('Що означає цей ієрогліф?', k.uk, wide.map((x) => x.uk), key, { big: k.c, sub: [...k.on, ...k.kun].join('・') }),
    mk('Обери ієрогліф', k.c, wide.map((x) => x.c), key, { big: k.uk }),
  ]
  if (k.kun[0]) out.push(mk('Кунʼомі (японське читання)', k.kun[0], wide.flatMap((x) => x.kun), key, { big: k.c, sub: k.uk }))
  if (k.on[0]) out.push(mk('Онʼомі (китайське читання)', k.on[0], wide.flatMap((x) => x.on), key, { big: k.c, sub: k.uk }))
  if (k.ex?.[0]) {
    const e = k.ex[0]
    out.push({ t: 'type', prompt: `Як читається «${e.uk}»? (ромадзі або кана)`, big: e.w, mode: 'hira', answers: [kataToHira(e.r)], show: e.r, key, speak: e.w })
  }
  if (reading) out.push({ t: 'draw', prompt: 'Намалюй ієрогліф', ch: k.c, hint: k.uk, key })
  return out
}

function vocabEx(key: string, pool: string[]): Ex[] {
  const v = VOCAB_MAP.get(key)!
  const near = pool.map((p) => VOCAB_MAP.get(p)!).filter(Boolean)
  const wide = [...near, ...VOCAB.filter((x) => x.l === v.l && x.pos === v.pos)]
  const hasKanji = v.w !== v.r
  const out: Ex[] = [
    mk('Що означає слово?', v.uk, wide.map((x) => x.uk), key, { big: v.w, sub: hasKanji ? undefined : undefined, speak: v.r }),
    mk('Як сказати японською?', v.w, wide.map((x) => x.w), key, { big: v.uk }),
    { t: 'type', prompt: 'Впиши читання (ромадзі або кана)', big: v.w, sub: v.uk, mode: 'hira', answers: [kataToHira(v.r)], show: v.r, key, speak: v.r },
  ]
  if (hasKanji) out.push(mk('Яке читання правильне?', v.r, wide.map((x) => x.r), key, { big: v.w, sub: v.uk }))
  return out
}

function sentEx(key: string, pool: string[]): Ex[] {
  const s = SENT_MAP.get(key)!
  const near = pool.map((p) => SENT_MAP.get(p)!).filter(Boolean)
  const extra = pick(near.flatMap((x) => x.jp).filter((t) => !s.jp.includes(t)), 2)
  return [
    { t: 'build', prompt: s.uk, tokens: s.jp, pool: shuffle([...s.jp, ...extra]), key, note: s.r },
    mk('Який переклад?', s.uk, near.map((x) => x.uk), key, { big: s.jp.join(''), speak: s.jp.join('') }),
  ]
}

export function buildLesson(block: Block, size = 10): Ex[] {
  const keys = block.keys
  const gen = (k: string): Ex[] =>
    k.startsWith('kana:') ? kanaEx(k, keys) : k.startsWith('kanji:') ? kanjiEx(k, keys) : k.startsWith('vocab:') ? vocabEx(k, keys) : sentEx(k, keys)

  const out: Ex[] = []
  // first pass: one exercise per item (introduces everything), then fill with variety
  const order = shuffle(keys)
  const byItem = new Map<string, Ex[]>(order.map((k) => [k, shuffle(gen(k))]))
  let round = 0
  while (out.length < Math.max(size, Math.min(keys.length, size + 4)) && round < 6) {
    for (const k of order) {
      const q = byItem.get(k)!
      const e = q[round % q.length]
      if (e) out.push(e)
      if (out.length >= Math.max(size, Math.min(keys.length, size + 4))) break
    }
    round++
  }
  // add a match round for pairs
  if (!block.keys[0].startsWith('sent:') && keys.length >= 4) {
    const items = pick(keys, 5)
    const pairs = items.map((k) => {
      if (k.startsWith('kana:')) { const i = kataKey.get(k)!; return { a: i.k, b: i.ro[0], key: k } }
      if (k.startsWith('kanji:')) { const i = KANJI_MAP.get(k)!; return { a: i.c, b: i.uk.split(';')[0], key: k } }
      const i = VOCAB_MAP.get(k)!; return { a: i.w, b: i.uk.split(/[;,]/)[0], key: k }
    })
    const seenB = new Set<string>(), uniq = pairs.filter((p) => (seenB.has(p.b) ? false : (seenB.add(p.b), true)))
    if (uniq.length >= 3) out.splice(Math.floor(out.length / 2), 0, { t: 'match', prompt: 'Зʼєднай пари', pairs: uniq })
  }
  return shuffle(out).slice(0, size + 1)
}

/** Review: weakest items first, from everything the player has touched. */
export function reviewBlock(stats: Record<string, { b: number; c: number; w: number }>, n = 10): Block | null {
  const keys = Object.entries(stats)
    .filter(([k]) => !k.startsWith('sent:'))
    .sort(([, a], [, b]) => a.b - b.b || b.w - a.w)
    .slice(0, n).map(([k]) => k)
    .filter((k) => k.startsWith('kana:') ? kataKey.has(k) : k.startsWith('kanji:') ? KANJI_MAP.has(k) : VOCAB_MAP.has(k))
  if (keys.length < 4) return null
  return { id: 'review', track: 'vocab', title: 'Повторення', sub: 'Слабкі місця', l: 0, keys, icon: '🔁' }
}

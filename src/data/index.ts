import type { Kanji, Vocab, Sentence, Story, Lvl } from '../types'

const mods = import.meta.glob('./raw/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

function collect<T>(prefix: string): T[] {
  return Object.entries(mods)
    .filter(([p]) => p.includes('/' + prefix + '-'))
    .sort(([a], [b]) => b.localeCompare(a)) // n5, n4, n3
    .flatMap(([, v]) => (Array.isArray(v) ? (v as T[]) : []))
}

function uniq<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>()
  return arr.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true })
}

export const KANJI: Kanji[] = uniq(collect<Kanji>('kanji'), (k) => k.c)
export const VOCAB: Vocab[] = uniq(collect<Vocab>('vocab'), (v) => v.w + '|' + v.r)
export const SENTENCES: Sentence[] = uniq(collect<Sentence>('sentences'), (s) => s.jp.join(''))
export const STORIES: Story[] = uniq(collect<Story>('stories'), (s) => s.id)

export const kanjiKey = (k: Kanji) => 'kanji:' + k.c
export const vocabKey = (v: Vocab) => 'vocab:' + v.w + '|' + v.r
export const sentKey = (s: Sentence) => 'sent:' + s.jp.join('')

export const byLevel = <T extends { l: Lvl }>(arr: T[], l: Lvl) => arr.filter((x) => x.l === l)

export const KANJI_MAP = new Map(KANJI.map((k) => [kanjiKey(k), k]))
export const VOCAB_MAP = new Map(VOCAB.map((v) => [vocabKey(v), v]))
export const SENT_MAP = new Map(SENTENCES.map((s) => [sentKey(s), s]))

export const TOPIC_UK: Record<string, string> = {
  greetings: 'Привітання', family: 'Сімʼя', food: 'Їжа', school: 'Школа', time: 'Час', numbers: 'Числа',
  places: 'Місця', transport: 'Транспорт', shopping: 'Покупки', body: 'Тіло', health: 'Здоровʼя', nature: 'Природа',
  weather: 'Погода', work: 'Робота', hobby: 'Хобі', feelings: 'Почуття', home: 'Дім', clothes: 'Одяг',
  people: 'Люди', abstract: 'Абстрактне',
}

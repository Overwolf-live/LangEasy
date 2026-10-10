import type { Block, Lvl, TrackId } from '../types'
import { HIRAGANA, KATAKANA, KANA_GROUPS } from '../data/kana'
import { KANJI, VOCAB, SENTENCES, STORIES, byLevel, kanjiKey, vocabKey, sentKey, TOPIC_UK } from '../data/index'

const chunk = <T,>(a: T[], n: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n))
  // merge a tiny tail into previous chunk
  if (out.length > 1 && out[out.length - 1].length < Math.ceil(n / 2)) out[out.length - 2].push(...(out.pop() as T[]))
  return out
}

function kanaBlocks(): Block[] {
  const blocks: Block[] = []
  for (const [set, name, pre] of [[HIRAGANA, 'Хірагана', 'hira'], [KATAKANA, 'Катакана', 'kata']] as const) {
    KANA_GROUPS.forEach((g, i) => {
      const items = set.filter((k) => g.rows.includes(k.row))
      blocks.push({ id: `kana-${pre}-${i}`, track: 'kana', title: g.title, sub: `${name} · ${items.length} знаків`, l: 0, keys: items.map((k) => 'kana:' + k.k), icon: pre === 'hira' ? 'あ' : 'ア' })
    })
  }
  return blocks
}

function kanjiBlocks(): Block[] {
  const out: Block[] = []
  for (const l of [5, 4, 3] as Lvl[]) {
    chunk(byLevel(KANJI, l), 8).forEach((c, i) =>
      out.push({ id: `kanji-${l}-${i}`, track: 'kanji', title: `Канджі ${c[0].c}${c[1]?.c ?? ''}…`, sub: `N${l} · ${c.length} ієрогліфів`, l, keys: c.map(kanjiKey), icon: c[0].c }))
  }
  return out
}

function vocabBlocks(): Block[] {
  const out: Block[] = []
  for (const l of [5, 4, 3] as Lvl[]) {
    const lv = byLevel(VOCAB, l)
    const topics = [...new Set(lv.map((v) => v.topic))]
    for (const t of topics) {
      chunk(lv.filter((v) => v.topic === t), 10).forEach((c, i) =>
        out.push({ id: `vocab-${l}-${t}-${i}`, track: 'vocab', title: TOPIC_UK[t] ?? t, sub: `N${l} · ${c.length} слів`, l, keys: c.map(vocabKey), icon: c[0].w.slice(0, 2) }))
    }
  }
  return out
}

function storyBlocks(): Block[] {
  const out: Block[] = []
  for (const l of [5, 4, 3] as Lvl[]) {
    const stories = byLevel(STORIES, l)
    const sents = chunk(byLevel(SENTENCES, l), 8)
    const n = Math.max(stories.length, sents.length)
    for (let i = 0; i < n; i++) {
      if (sents[i]) out.push({ id: `sent-${l}-${i}`, track: 'story', title: `Склади фразу #${i + 1}`, sub: `N${l} · речення`, l, keys: sents[i].map(sentKey), icon: '文' })
      if (stories[i]) out.push({ id: `story-${stories[i].id}`, track: 'story', title: stories[i].title, sub: `N${l} · новела — ${stories[i].summary}`, l, keys: [], storyId: stories[i].id, icon: '📖' })
    }
  }
  return out
}

export const TRACKS: { id: TrackId; title: string; icon: string; blocks: Block[] }[] = [
  { id: 'kana', title: 'Кана', icon: 'あ', blocks: kanaBlocks() },
  { id: 'kanji', title: 'Канджі', icon: '漢', blocks: kanjiBlocks() },
  { id: 'vocab', title: 'Слова', icon: '語', blocks: vocabBlocks() },
  { id: 'story', title: 'Ситуації', icon: '話', blocks: storyBlocks() },
]
export const ALL_BLOCKS = TRACKS.flatMap((t) => t.blocks)
export const BLOCK_MAP = new Map(ALL_BLOCKS.map((b) => [b.id, b]))

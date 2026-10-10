import { createContext, useContext, useEffect, useReducer, type ReactNode, type Dispatch } from 'react'

export type ClassId = 'samurai' | 'ninja' | 'mage' | 'miko'
export interface Profile { name: string; cls: ClassId; hair: string; skin: string; outfit: string; created: boolean }
export interface ItemStat { b: number; c: number; w: number }
export interface BlockProgress { stars: number; done: number }
export interface State {
  v: 1
  profile: Profile
  xp: number
  coins: number
  streak: number
  lastDay: string
  stats: Record<string, ItemStat>
  blocks: Record<string, BlockProgress>
  settings: { romaji: boolean; sound: boolean }
}

export const initial: State = {
  v: 1,
  profile: { name: '', cls: 'samurai', hair: '#2b2118', skin: '#f3c9a5', outfit: '#d64545', created: false },
  xp: 0, coins: 0, streak: 0, lastDay: '',
  stats: {}, blocks: {},
  settings: { romaji: true, sound: true },
}

export type Action =
  | { type: 'profile'; profile: Partial<Profile> }
  | { type: 'answer'; key: string; correct: boolean }
  | { type: 'reward'; xp: number; coins: number }
  | { type: 'finish'; id: string; stars: number }
  | { type: 'settings'; s: Partial<State['settings']> }
  | { type: 'import'; state: State }
  | { type: 'reset' }

const today = () => new Date().toISOString().slice(0, 10)
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

function touchStreak(s: State): State {
  const t = today()
  if (s.lastDay === t) return s
  const streak = s.lastDay && dayDiff(s.lastDay, t) === 1 ? s.streak + 1 : 1
  return { ...s, streak, lastDay: t }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'profile': return { ...s, profile: { ...s.profile, ...a.profile } }
    case 'answer': {
      const o = s.stats[a.key] ?? { b: 0, c: 0, w: 0 }
      const n = a.correct ? { b: Math.min(5, o.b + 1), c: o.c + 1, w: o.w } : { b: Math.max(0, o.b - 2), c: o.c, w: o.w + 1 }
      return { ...s, stats: { ...s.stats, [a.key]: n } }
    }
    case 'reward': return touchStreak({ ...s, xp: s.xp + a.xp, coins: s.coins + a.coins })
    case 'finish': {
      const o = s.blocks[a.id] ?? { stars: 0, done: 0 }
      return { ...s, blocks: { ...s.blocks, [a.id]: { stars: Math.max(o.stars, a.stars), done: o.done + 1 } } }
    }
    case 'settings': return { ...s, settings: { ...s.settings, ...a.s } }
    case 'import': return { ...initial, ...a.state, profile: { ...initial.profile, ...a.state.profile }, settings: { ...initial.settings, ...a.state.settings } }
    case 'reset': return initial
  }
}

const KEY = 'langeasy-save-v1'
function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return initial
}

const Ctx = createContext<{ s: State; d: Dispatch<Action> }>({ s: initial, d: () => {} })
export const useGame = () => useContext(Ctx)

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>
}

/* ---------- progression ---------- */
export const levelOf = (xp: number) => Math.floor(Math.sqrt(xp / 40)) + 1
export const xpAt = (lvl: number) => 40 * (lvl - 1) * (lvl - 1)
export function levelProgress(xp: number) {
  const l = levelOf(xp), lo = xpAt(l), hi = xpAt(l + 1)
  return { level: l, cur: xp - lo, need: hi - lo, pct: (xp - lo) / (hi - lo) }
}

export const MASTERED_BOX = 3
export const masteredCount = (stats: Record<string, ItemStat>, prefix = '') =>
  Object.entries(stats).filter(([k, v]) => k.startsWith(prefix) && v.b >= MASTERED_BOX).length

export const RANKS: { at: number; name: string }[] = [
  { at: 0, name: 'Початківець' }, { at: 25, name: 'Учень' }, { at: 80, name: 'Знавець кани' },
  { at: 180, name: 'JLPT N5' }, { at: 350, name: 'JLPT N5+' }, { at: 600, name: 'JLPT N4' },
  { at: 950, name: 'JLPT N4+' }, { at: 1400, name: 'JLPT N3' }, { at: 2000, name: 'JLPT N3+' }, { at: 2800, name: 'Майстер' },
]
export function rankInfo(mastered: number) {
  let i = 0
  while (i + 1 < RANKS.length && mastered >= RANKS[i + 1].at) i++
  const next = RANKS[i + 1]
  return { rank: RANKS[i], next, pct: next ? (mastered - RANKS[i].at) / (next.at - RANKS[i].at) : 1, mastered }
}

export const CLASSES: Record<ClassId, { name: string; icon: string; color: string; weapon: string; blurb: string }> = {
  samurai: { name: 'Самурай', icon: '⚔️', color: '#d64545', weapon: 'katana', blurb: 'Честь і дисципліна. Катана росте разом із тобою.' },
  ninja: { name: 'Ніндзя', icon: '🥷', color: '#2f3a52', weapon: 'shuriken', blurb: 'Швидкий і тихий — вчить слова непомітно.' },
  mage: { name: 'Маг', icon: '🔮', color: '#7a4fd6', weapon: 'staff', blurb: 'Силу ієрогліфів перетворює на магію.' },
  miko: { name: 'Міко', icon: '⛩️', color: '#e07aa6', weapon: 'gohei', blurb: 'Хранителька святині, друг духів мови.' },
}

export const GEAR: { lvl: number; id: string; name: string }[] = [
  { lvl: 2, id: 'band', name: 'Хатімакі' },
  { lvl: 4, id: 'scarf', name: 'Шарф вітру' },
  { lvl: 6, id: 'weapon', name: 'Зброя класу' },
  { lvl: 9, id: 'cape', name: 'Плащ мандрівника' },
  { lvl: 13, id: 'aura', name: 'Аура знань' },
  { lvl: 18, id: 'crown', name: 'Корона сенсея' },
]

export type Lvl = 3 | 4 | 5

export interface Kanji { c: string; on: string[]; kun: string[]; uk: string; l: Lvl; ex?: { w: string; r: string; uk: string }[] }
export interface Vocab { w: string; r: string; uk: string; l: Lvl; pos: string; topic: string }
export interface Sentence { jp: string[]; r: string; uk: string; l: Lvl }
export interface KanaItem { k: string; ro: string[]; type: 'hira' | 'kata'; row: string }

export interface CharRef { id: string; pos: 'left' | 'center' | 'right'; mood: Mood }
export type Mood = 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry'
export interface ChoiceOpt { jp: string; uk: string; correct: boolean; fb: string }
export interface Scene {
  bg: string; chars?: CharRef[]; narr?: string; speaker?: string
  jp?: string; r?: string; uk?: string
  choice?: { prompt: string; options: ChoiceOpt[] }
}
export interface Story { id: string; title: string; l: Lvl; topic: string; summary: string; scenes: Scene[] }

export type Ex =
  | { t: 'choice'; prompt: string; big?: string; sub?: string; options: string[]; answer: number; key: string; speak?: string; note?: string }
  | { t: 'type'; prompt: string; big: string; sub?: string; mode: 'romaji' | 'hira'; answers: string[]; show: string; key: string; speak?: string }
  | { t: 'build'; prompt: string; tokens: string[]; pool: string[]; key: string; note?: string }
  | { t: 'match'; prompt: string; pairs: { a: string; b: string; key: string }[] }
  | { t: 'draw'; prompt: string; ch: string; hint: string; key: string }

export type TrackId = 'kana' | 'kanji' | 'vocab' | 'story'
export interface Block {
  id: string; track: TrackId; title: string; sub: string; l: Lvl | 0
  /** item keys the lesson is drawn from */
  keys: string[]
  storyId?: string
  icon: string
}

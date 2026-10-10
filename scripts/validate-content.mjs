import fs from 'node:fs'
import path from 'node:path'
const dir = new URL('../src/data/raw/', import.meta.url).pathname
const BG = 'school classroom cafe station park shop home restaurant street shrine hospital train beach night_city'.split(' ')
const CH = 'yuki ken sensei obaa taro mei ryo'.split(' ')
let errs = 0
const err = (f, m) => { errs++; console.log(`✗ ${f}: ${m}`) }
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  let a
  try { a = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch (e) { err(f, 'invalid JSON'); continue }
  const kind = f.split('-')[0]
  console.log(`${f}: ${a.length}`)
  const seen = new Set()
  for (const x of a) {
    const id = kind === 'kanji' ? x.c : kind === 'vocab' ? x.w + x.r : kind === 'sentences' ? x.jp?.join('') : x.id
    if (!id || seen.has(id)) err(f, 'dup/empty ' + id); seen.add(id)
    if (kind === 'kanji' && (!x.uk || !Array.isArray(x.on) || !Array.isArray(x.kun))) err(f, 'bad kanji ' + x.c)
    if (kind === 'vocab' && (!x.r || !x.uk)) err(f, 'bad vocab ' + x.w)
    if (kind === 'sentences' && (!Array.isArray(x.jp) || x.jp.length < 3 || !x.uk)) err(f, 'bad sentence ' + id)
    if (kind === 'stories') for (const s of x.scenes) {
      if (!BG.includes(s.bg)) err(f, `${x.id} bg ${s.bg}`)
      for (const c of s.chars ?? []) if (!CH.includes(c.id)) err(f, `${x.id} char ${c.id}`)
      if (s.choice && s.choice.options.filter((o) => o.correct).length !== 1) err(f, `${x.id} correct count`)
    }
  }
}
console.log(errs ? `\n${errs} помилок` : '\nКонтент валідний')
process.exit(errs ? 1 : 0)

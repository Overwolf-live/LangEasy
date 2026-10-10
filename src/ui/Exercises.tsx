import { useEffect, useRef, useState } from 'react'
import type { Ex } from '../types'
import { toHira } from '../data/kana'
import { norm, speak } from './util'
import { shuffle } from '../game/exercises'

export interface ExProps<T extends Ex = Ex> { ex: T; onDone: (correct: boolean, keys?: { key: string; ok: boolean }[]) => void; sound: boolean }

function Feedback({ ok, answer, onNext }: { ok: boolean; answer?: string; onNext: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Enter') onNext() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onNext])
  return (
    <div className={'feedback ' + (ok ? 'ok' : 'bad')}>
      <div><b>{ok ? 'Правильно! ✨' : 'Не зовсім…'}</b>{!ok && answer && <div className="ans">Відповідь: {answer}</div>}</div>
      <button className="btn" onClick={onNext} autoFocus>Далі</button>
    </div>
  )
}

export function Choice({ ex, onDone, sound }: ExProps<Extract<Ex, { t: 'choice' }>>) {
  const [sel, setSel] = useState<number | null>(null)
  useEffect(() => { if (sound && ex.speak) speak(ex.speak) }, [ex, sound])
  const done = sel !== null
  return (
    <div className="ex">
      <p className="prompt">{ex.prompt}</p>
      {ex.big && <div className="big" onClick={() => ex.speak && speak(ex.speak)}>{ex.big}{ex.speak && <span className="spk">🔊</span>}</div>}
      {ex.sub && <div className="sub">{ex.sub}</div>}
      <div className="options">
        {ex.options.map((o, i) => (
          <button key={i} disabled={done} onClick={() => setSel(i)}
            className={'opt ' + (done ? (i === ex.answer ? 'right' : i === sel ? 'wrong' : 'dim') : '')}>
            <kbd>{i + 1}</kbd> {o}
          </button>
        ))}
      </div>
      {done && <Feedback ok={sel === ex.answer} answer={ex.options[ex.answer]} onNext={() => onDone(sel === ex.answer)} />}
    </div>
  )
}

export function TypeEx({ ex, onDone, sound }: ExProps<Extract<Ex, { t: 'type' }>>) {
  const [v, setV] = useState('')
  const [res, setRes] = useState<boolean | null>(null)
  useEffect(() => { if (sound && ex.speak) speak(ex.speak) }, [ex, sound])
  const shown = ex.mode === 'hira' ? toHira(v, false) : v
  const check = () => {
    if (res !== null || !v.trim()) return
    const val = norm(ex.mode === 'hira' ? toHira(v, true) : v)
    setRes(ex.answers.some((a) => norm(a) === val))
  }
  return (
    <div className="ex">
      <p className="prompt">{ex.prompt}</p>
      <div className="big" onClick={() => ex.speak && speak(ex.speak)}>{ex.big}{ex.speak && <span className="spk">🔊</span>}</div>
      {ex.sub && <div className="sub">{ex.sub}</div>}
      <input className="input" autoFocus autoCapitalize="off" autoComplete="off" spellCheck={false} disabled={res !== null}
        value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()}
        placeholder={ex.mode === 'hira' ? 'напр. gakkou → がっこう' : 'romaji'} />
      {ex.mode === 'hira' && <div className="preview">{shown || '　'}</div>}
      {res === null ? <button className="btn" onClick={check} disabled={!v.trim()}>Перевірити</button>
        : <Feedback ok={res} answer={ex.show} onNext={() => onDone(res)} />}
    </div>
  )
}

export function Build({ ex, onDone }: ExProps<Extract<Ex, { t: 'build' }>>) {
  const [picked, setPicked] = useState<number[]>([])
  const [res, setRes] = useState<boolean | null>(null)
  const check = () => setRes(picked.map((i) => ex.pool[i]).join('') === ex.tokens.join(''))
  return (
    <div className="ex">
      <p className="prompt">Склади речення:</p>
      <div className="big small">«{ex.prompt}»</div>
      <div className="slots">
        {picked.map((i, n) => <button key={n} className="tok" disabled={res !== null} onClick={() => setPicked(picked.filter((_, j) => j !== n))}>{ex.pool[i]}</button>)}
        {picked.length === 0 && <span className="hintline">натискай слова нижче</span>}
      </div>
      <div className="bank">
        {ex.pool.map((t, i) => <button key={i} className={'tok ' + (picked.includes(i) ? 'used' : '')} disabled={picked.includes(i) || res !== null} onClick={() => setPicked([...picked, i])}>{t}</button>)}
      </div>
      {res === null ? <button className="btn" disabled={!picked.length} onClick={check}>Перевірити</button>
        : <Feedback ok={res} answer={ex.tokens.join('') + (ex.note ? ` (${ex.note})` : '')} onNext={() => { speak(ex.tokens.join('')); onDone(res) }} />}
    </div>
  )
}

export function Match({ ex, onDone }: ExProps<Extract<Ex, { t: 'match' }>>) {
  const [left] = useState(() => shuffle(ex.pairs.map((p, i) => ({ t: p.a, i }))))
  const [right] = useState(() => shuffle(ex.pairs.map((p, i) => ({ t: p.b, i }))))
  const [selL, setSelL] = useState<number | null>(null)
  const [solved, setSolved] = useState<number[]>([])
  const [bad, setBad] = useState<string | null>(null)
  const [missed, setMissed] = useState<Set<number>>(new Set())
  const finish = (s: number[]) => {
    if (s.length === ex.pairs.length) setTimeout(() => onDone(missed.size === 0, ex.pairs.map((p, i) => ({ key: p.key, ok: !missed.has(i) }))), 500)
  }
  const clickR = (i: number) => {
    if (selL === null || solved.includes(i)) return
    if (selL === i) { const s = [...solved, i]; setSolved(s); setSelL(null); finish(s) }
    else { setBad('r' + i); setMissed(new Set(missed).add(selL)); setTimeout(() => setBad(null), 400); setSelL(null) }
  }
  return (
    <div className="ex">
      <p className="prompt">{ex.prompt}</p>
      <div className="match">
        <div>{left.map((l) => <button key={l.i} disabled={solved.includes(l.i)} className={'opt ' + (solved.includes(l.i) ? 'right' : selL === l.i ? 'sel' : '')} onClick={() => setSelL(l.i)}>{l.t}</button>)}</div>
        <div>{right.map((r) => <button key={r.i} disabled={solved.includes(r.i)} className={'opt ' + (solved.includes(r.i) ? 'right' : bad === 'r' + r.i ? 'wrong' : '')} onClick={() => clickR(r.i)}>{r.t}</button>)}</div>
      </div>
    </div>
  )
}

export function Draw({ ex, onDone }: ExProps<Extract<Ex, { t: 'draw' }>>) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [show, setShow] = useState(false)
  const [drew, setDrew] = useState(false)
  const down = useRef(false)
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 300 } }
  useEffect(() => { const c = ref.current!.getContext('2d')!; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#ffffff' }, [])
  const start = (e: React.PointerEvent) => { down.current = true; setDrew(true); ref.current!.setPointerCapture(e.pointerId); const c = ref.current!.getContext('2d')!; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y) }
  const move = (e: React.PointerEvent) => { if (!down.current) return; const c = ref.current!.getContext('2d')!; const p = pos(e); c.lineTo(p.x, p.y); c.stroke() }
  const clear = () => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, 300, 300); setDrew(false) }
  return (
    <div className="ex">
      <p className="prompt">{ex.prompt}</p>
      <div className="sub">{ex.hint}</div>
      <div className="canvas-wrap">
        {show && <div className="ghost">{ex.ch}</div>}
        <canvas ref={ref} width={300} height={300} onPointerDown={start} onPointerMove={move} onPointerUp={() => (down.current = false)} onPointerLeave={() => (down.current = false)} />
      </div>
      {!show ? (
        <div className="row"><button className="btn ghostbtn" onClick={clear}>Стерти</button><button className="btn" disabled={!drew} onClick={() => setShow(true)}>Показати зразок</button></div>
      ) : (
        <div className="row"><span className="hintline">Порівняй зі зразком. Як вийшло?</span>
          <button className="btn ghostbtn" onClick={() => onDone(false)}>Ще треба повторити</button><button className="btn" onClick={() => onDone(true)}>Схоже!</button></div>
      )}
    </div>
  )
}

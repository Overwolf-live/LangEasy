import { useEffect, useMemo, useState } from 'react'
import type { Block, Ex } from '../types'
import { buildLesson } from '../game/exercises'
import { useGame } from '../game/store'
import { Build, Choice, Draw, Match, TypeEx } from './Exercises'

export function Lesson({ block, onExit }: { block: Block; onExit: () => void }) {
  const { s, d } = useGame()
  const initialQ = useMemo(() => buildLesson(block), [block])
  const [queue, setQueue] = useState<Ex[]>(initialQ)
  const [i, setI] = useState(0)
  const [lives, setLives] = useState(3)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [result, setResult] = useState<null | { stars: number; xp: number; coins: number; failed: boolean }>(null)
  const total = initialQ.length

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = parseInt(e.key); if (n >= 1 && n <= 4) (document.querySelectorAll('.options .opt')[n - 1] as HTMLElement | undefined)?.click()
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  const finish = (failed: boolean, r: number, w: number) => {
    const acc = r / Math.max(1, r + w)
    const stars = failed ? 0 : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1
    const xp = failed ? Math.round(r * 2) : Math.round(r * 5 + stars * 10)
    const coins = failed ? 0 : r + stars * 3
    d({ type: 'reward', xp, coins })
    if (!failed) d({ type: 'finish', id: block.id, stars })
    setResult({ stars, xp, coins, failed })
  }

  const onDone = (ok: boolean, keys?: { key: string; ok: boolean }[]) => {
    const ex = queue[i]
    if (keys) keys.forEach((k) => d({ type: 'answer', key: k.key, correct: k.ok }))
    else if ('key' in ex) d({ type: 'answer', key: ex.key, correct: ok })
    const r = right + (ok ? 1 : 0), w = wrong + (ok ? 0 : 1)
    setRight(r); setWrong(w)
    let q = queue
    let l = lives
    if (!ok) {
      l = lives - 1; setLives(l)
      if (l <= 0) return finish(true, r, w)
      if (ex.t !== 'match') q = [...queue, ex] // retry mistakes at the end
      setQueue(q)
    }
    if (i + 1 >= q.length) finish(false, r, w)
    else setI(i + 1)
  }

  if (result) {
    return (
      <div className="screen center result">
        <div className="big">{result.failed ? '💔' : '🎉'}</div>
        <h2>{result.failed ? 'Життя скінчились' : 'Блок пройдено!'}</h2>
        {!result.failed && <div className="stars">{[1, 2, 3].map((n) => <span key={n} className={n <= result.stars ? 'on' : ''}>★</span>)}</div>}
        <p>Правильно: <b>{right}</b> · Помилок: <b>{wrong}</b></p>
        <p>+{result.xp} XP · +{result.coins} 🪙</p>
        <div className="row"><button className="btn ghostbtn" onClick={onExit}>До карти</button>
          <button className="btn" onClick={() => { setQueue(buildLesson(block)); setI(0); setLives(3); setRight(0); setWrong(0); setResult(null) }}>Ще раз</button></div>
      </div>
    )
  }
  const ex = queue[i]
  const sound = s.settings.sound
  return (
    <div className="screen lesson">
      <div className="topbar">
        <button className="x" onClick={onExit} aria-label="Вийти">✕</button>
        <div className="bar"><i style={{ width: `${(i / Math.max(total, queue.length)) * 100}%` }} /></div>
        <div className="lives">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
      </div>
      <div key={i + ex.t}>
        {ex.t === 'choice' && <Choice ex={ex} onDone={onDone} sound={sound} />}
        {ex.t === 'type' && <TypeEx ex={ex} onDone={onDone} sound={sound} />}
        {ex.t === 'build' && <Build ex={ex} onDone={onDone} sound={sound} />}
        {ex.t === 'match' && <Match ex={ex} onDone={onDone} sound={sound} />}
        {ex.t === 'draw' && <Draw ex={ex} onDone={onDone} sound={sound} />}
      </div>
    </div>
  )
}

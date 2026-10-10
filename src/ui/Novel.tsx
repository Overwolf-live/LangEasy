import { useState } from 'react'
import type { Story } from '../types'
import { Avatar, Bg, type Look } from './Art'
import { speak } from './util'
import { useGame } from '../game/store'

export const CAST: Record<string, { name: string; look: Look }> = {
  yuki: { name: 'Юкі', look: { hair: '#7a3b2e', skin: '#f6d2b4', outfit: '#f28fb0', style: 'long', extra: 'apron' } },
  ken: { name: 'Кен', look: { hair: '#1f2a44', skin: '#efc19a', outfit: '#3b82f6', style: 'spiky' } },
  sensei: { name: 'Сенсей', look: { hair: '#8a8a8a', skin: '#f0c9a8', outfit: '#4b5563', style: 'short', extra: 'glasses' } },
  obaa: { name: 'Бабуся', look: { hair: '#e4e4e4', skin: '#f0cfb2', outfit: '#a16207', style: 'bun' } },
  taro: { name: 'Таро', look: { hair: '#3b2a1a', skin: '#e8b78f', outfit: '#f1f1f1', style: 'short' } },
  mei: { name: 'Мей', look: { hair: '#14141c', skin: '#f7dcc4', outfit: '#8b5cf6', style: 'long' } },
  ryo: { name: 'Рьо', look: { hair: '#222', skin: '#e9bd96', outfit: '#1e3a8a', style: 'short', extra: 'cap' } },
}

export function Novel({ story, onExit, onFinish }: { story: Story; onExit: () => void; onFinish: (stars: number) => void }) {
  const { s } = useGame()
  const [i, setI] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null)
  const [showR, setShowR] = useState(s.settings.romaji)
  const [showUk, setShowUk] = useState(true)
  const sc = story.scenes[i]
  const last = i === story.scenes.length - 1
  const next = () => (last ? onFinish(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1) : (setFb(null), setI(i + 1)))
  const who = sc.speaker ? CAST[sc.speaker]?.name ?? sc.speaker : null

  return (
    <div className="vn">
      <Bg id={sc.bg} />
      <div className="vn-top">
        <button className="x" onClick={onExit}>✕</button>
        <b>{story.title}</b>
        <span className="grow" />
        <button className={'chip ' + (showR ? 'on' : '')} onClick={() => setShowR(!showR)}>romaji</button>
        <button className={'chip ' + (showUk ? 'on' : '')} onClick={() => setShowUk(!showUk)}>UA</button>
      </div>
      <div className="stage">
        {(sc.chars ?? []).map((c) => {
          const cast = CAST[c.id]
          if (!cast) return null
          const speaking = sc.speaker === c.id
          return <div key={c.id} className={`actor ${c.pos} ${speaking ? 'speaking' : ''}`}><Avatar look={cast.look} mood={c.mood} size={150} /></div>
        })}
      </div>
      <div className="dialog" onClick={() => !sc.choice && next()}>
        {who && <div className="who">{who}</div>}
        {sc.narr && <p className="narr">{sc.narr}</p>}
        {sc.jp && (
          <>
            <p className="jp" onClick={(e) => { e.stopPropagation(); speak(sc.jp!) }}>{sc.jp} <span className="spk">🔊</span></p>
            {showR && sc.r && <p className="rom">{sc.r}</p>}
            {showUk && sc.uk && <p className="uk">{sc.uk}</p>}
          </>
        )}
        {sc.choice && (
          <div className="choices" onClick={(e) => e.stopPropagation()}>
            <div className="cprompt">{sc.choice.prompt}</div>
            {sc.choice.options.map((o, k) => (
              <button key={k} className="opt" disabled={fb?.ok} onClick={() => {
                setFb({ ok: o.correct, text: o.fb })
                if (!o.correct) setMistakes((m) => m + 1); else speak(o.jp)
              }}>
                <div className="jp2">{o.jp}</div>{showUk && <div className="uk2">{o.uk}</div>}
              </button>
            ))}
            {fb && <div className={'feedback ' + (fb.ok ? 'ok' : 'bad')}><div>{fb.text}</div>{fb.ok && <button className="btn" onClick={next}>{last ? 'Завершити' : 'Далі'}</button>}</div>}
          </div>
        )}
        {!sc.choice && <div className="tap">{last ? 'торкнись, щоб завершити ▶' : 'торкнись ▶'}</div>}
      </div>
    </div>
  )
}

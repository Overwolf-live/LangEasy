import { useState } from 'react'
import { TRACKS } from '../game/curriculum'
import { reviewBlock } from '../game/exercises'
import { levelProgress, rankInfo, masteredCount, useGame } from '../game/store'
import type { Block, TrackId } from '../types'
import { Avatar } from './Art'
import { lookOf } from './Profile'

export function Home({ onStart }: { onStart: (b: Block) => void }) {
  const { s } = useGame()
  const [tab, setTab] = useState<TrackId>('kana')
  const track = TRACKS.find((t) => t.id === tab)!
  const lp = levelProgress(s.xp)
  const rk = rankInfo(masteredCount(s.stats))
  const review = reviewBlock(s.stats)
  const firstOpen = track.blocks.findIndex((b) => !(s.blocks[b.id]?.stars > 0))
  return (
    <div className="screen home">
      <div className="hud">
        <Avatar look={lookOf(s.profile, lp.level)} size={44} />
        <div className="hud-main">
          <div className="hud-top"><b>{s.profile.name}</b><span>Рів. {lp.level} · {rk.rank.name}</span><span>🔥{s.streak} 🪙{s.coins}</span></div>
          <div className="bar"><i style={{ width: `${lp.pct * 100}%` }} /></div>
        </div>
      </div>
      <div className="tabs">
        {TRACKS.map((t) => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}><span>{t.icon}</span>{t.title}</button>)}
      </div>
      {review && tab !== 'story' && <button className="review" onClick={() => onStart(review)}>🔁 Повторення слабких місць</button>}
      {track.blocks.length === 0 && <p className="muted">Контенту поки немає.</p>}
      <div className="path">
        {track.blocks.map((b, i) => {
          const st = s.blocks[b.id]?.stars ?? 0
          const open = i <= (firstOpen === -1 ? track.blocks.length : firstOpen)
          const showLvl = i === 0 || track.blocks[i - 1].l !== b.l
          return (
            <div key={b.id}>
              {showLvl && b.l !== 0 && <div className="lvlhead">JLPT N{b.l}</div>}
              {showLvl && b.l === 0 && b.id.includes('hira') && <div className="lvlhead">Хірагана</div>}
              {b.id.endsWith('kata-0') && <div className="lvlhead">Катакана</div>}
              <button disabled={!open} className={'node ' + (st ? 'done' : open ? 'cur' : 'lock') + (b.track === 'story' && b.storyId ? ' novel' : '')} onClick={() => onStart(b)}
                style={{ marginLeft: `${Math.sin(i * 0.9) * 22 + 22}px` }}>
                <span className="ico">{open ? b.icon : '🔒'}</span>
                <span className="txt"><b>{b.title}</b><small>{b.sub}</small></span>
                <span className="stars">{[1, 2, 3].map((n) => <i key={n} className={n <= st ? 'on' : ''}>★</i>)}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

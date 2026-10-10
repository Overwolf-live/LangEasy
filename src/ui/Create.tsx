import { useState } from 'react'
import { Avatar } from './Art'
import { CLASSES, useGame, type ClassId } from '../game/store'
import { lookOf } from './Profile'

const HAIR = ['#2b2118', '#6b3a1e', '#c9a227', '#e8e8f0', '#d9437a', '#3b6fd6', '#2f9e6b']
const SKIN = ['#f9dcc4', '#f3c9a5', '#e0a97e', '#b9784f', '#8a5636']
const OUTFIT = ['#d64545', '#2f3a52', '#7a4fd6', '#e07aa6', '#2f9e6b', '#e0922f', '#3b82f6']

export function Create({ onDone }: { onDone: () => void }) {
  const { s, d } = useGame()
  const [p, setP] = useState(s.profile)
  const Swatches = ({ list, k }: { list: string[]; k: 'hair' | 'skin' | 'outfit' }) => (
    <div className="swatches">{list.map((c) => <button key={c} aria-label={c} className={p[k] === c ? 'on' : ''} style={{ background: c }} onClick={() => setP({ ...p, [k]: c })} />)}</div>
  )
  return (
    <div className="screen create">
      <h2>{s.profile.created ? 'Вигляд героя' : 'Створи свого героя'}</h2>
      <div className="preview-avatar"><Avatar look={lookOf(p, 20)} size={170} /></div>
      <input className="input" placeholder="Імʼя героя" value={p.name} maxLength={16} onChange={(e) => setP({ ...p, name: e.target.value })} />
      <h4>Клас</h4>
      <div className="classes">
        {(Object.keys(CLASSES) as ClassId[]).map((c) => (
          <button key={c} className={'classcard ' + (p.cls === c ? 'on' : '')} onClick={() => setP({ ...p, cls: c, outfit: CLASSES[c].color })}>
            <span>{CLASSES[c].icon}</span><b>{CLASSES[c].name}</b><small>{CLASSES[c].blurb}</small>
          </button>
        ))}
      </div>
      <h4>Волосся</h4><Swatches list={HAIR} k="hair" />
      <h4>Шкіра</h4><Swatches list={SKIN} k="skin" />
      <h4>Одяг</h4><Swatches list={OUTFIT} k="outfit" />
      <button className="btn" disabled={!p.name.trim()} onClick={() => { d({ type: 'profile', profile: { ...p, name: p.name.trim(), created: true } }); onDone() }}>Почати пригоду</button>
    </div>
  )
}

import { useRef } from 'react'
import { Avatar } from './Art'
import { CLASSES, GEAR, levelProgress, masteredCount, rankInfo, useGame, type ClassId } from '../game/store'
import { KANJI, VOCAB } from '../data/index'
import { ALL_KANA } from '../data/kana'

export const lookOf = (p: { hair: string; skin: string; outfit: string; cls: ClassId }, level: number) =>
  ({ hair: p.hair, skin: p.skin, outfit: p.outfit, cls: p.cls, level, style: 'short' as const })

export function Bar({ pct, label, sub }: { pct: number; label: string; sub?: string }) {
  return (
    <div className="meter">
      <div className="meter-h"><b>{label}</b><span>{sub}</span></div>
      <div className="bar big"><i style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }} /></div>
    </div>
  )
}

export function Profile({ onEdit }: { onEdit: () => void }) {
  const { s, d } = useGame()
  const lp = levelProgress(s.xp)
  const m = masteredCount(s.stats)
  const rk = rankInfo(m)
  const file = useRef<HTMLInputElement>(null)
  const cls = CLASSES[s.profile.cls]
  const stat = (prefix: string, total: number) => ({ n: masteredCount(s.stats, prefix), total })
  const stats = [
    { name: 'Кана', icon: '🌸', ...stat('kana:', ALL_KANA.length) },
    { name: 'Канджі', icon: '🈶', ...stat('kanji:', KANJI.length) },
    { name: 'Слова', icon: '📚', ...stat('vocab:', VOCAB.length) },
  ]
  const exportSave = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' }))
    a.download = 'langeasy-save.json'; a.click()
  }
  const importSave = async (f: File) => {
    try { const st = JSON.parse(await f.text()); if (st && st.v === 1) d({ type: 'import', state: st }); else alert('Невідомий формат') } catch { alert('Не вдалося прочитати файл') }
  }
  return (
    <div className="screen profile">
      <div className="hero">
        <Avatar look={lookOf(s.profile, lp.level)} size={150} glow />
        <div>
          <h2>{s.profile.name || 'Герой'}</h2>
          <div className="muted">{cls.icon} {cls.name} · рівень {lp.level}</div>
          <div className="muted">🔥 серія: {s.streak} дн. · 🪙 {s.coins}</div>
          <button className="btn small" onClick={onEdit}>Змінити вигляд</button>
        </div>
      </div>
      <Bar pct={lp.pct} label={`Рівень героя ${lp.level} → ${lp.level + 1}`} sub={`${lp.cur} / ${lp.need} XP`} />
      <Bar pct={rk.pct} label={`Рівень знань: ${rk.rank.name}`} sub={rk.next ? `${m} / ${rk.next.at} вивчених → ${rk.next.name}` : 'максимум!'} />
      <h3>Навички</h3>
      <div className="stats">
        {stats.map((x) => (
          <div key={x.name} className="statcard"><div className="si">{x.icon}</div><b>{x.name}</b><div className="bar"><i style={{ width: `${(x.n / x.total) * 100}%` }} /></div><small>{x.n} / {x.total}</small></div>
        ))}
      </div>
      <h3>Спорядження</h3>
      <div className="gear">
        {GEAR.map((g) => <div key={g.id} className={'gearitem ' + (lp.level >= g.lvl ? 'got' : '')}>{lp.level >= g.lvl ? '✅' : '🔒'} {g.name}<small>рів. {g.lvl}</small></div>)}
      </div>
      <h3>Налаштування</h3>
      <label className="toggle"><input type="checkbox" checked={s.settings.romaji} onChange={(e) => d({ type: 'settings', s: { romaji: e.target.checked } })} /> Ромадзі в новелах за замовчуванням</label>
      <label className="toggle"><input type="checkbox" checked={s.settings.sound} onChange={(e) => d({ type: 'settings', s: { sound: e.target.checked } })} /> Озвучення (якщо підтримує браузер)</label>
      <div className="row wrap">
        <button className="btn ghostbtn" onClick={exportSave}>Експорт збереження</button>
        <button className="btn ghostbtn" onClick={() => file.current?.click()}>Імпорт</button>
        <button className="btn ghostbtn danger" onClick={() => confirm('Стерти весь прогрес?') && d({ type: 'reset' })}>Скинути</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importSave(e.target.files[0])} />
      </div>
    </div>
  )
}

import type { Mood } from '../types'
import { CLASSES, GEAR, type ClassId } from '../game/store'

export interface Look {
  hair: string; skin: string; outfit: string
  style?: 'short' | 'long' | 'bun' | 'spiky'
  extra?: 'glasses' | 'cap' | 'apron' | 'none'
  cls?: ClassId
  level?: number
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'happy': return <path d="M42 64 Q50 73 58 64" stroke="#7a2f2f" strokeWidth="2.2" fill="#fff" strokeLinecap="round" />
    case 'sad': return <path d="M43 68 Q50 62 57 68" stroke="#7a2f2f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    case 'surprised': return <ellipse cx="50" cy="66" rx="3.5" ry="4.5" fill="#7a2f2f" />
    case 'angry': return <path d="M43 67 L57 67" stroke="#7a2f2f" strokeWidth="2.4" strokeLinecap="round" />
    default: return <path d="M44 66 Q50 69 56 66" stroke="#7a2f2f" strokeWidth="2" fill="none" strokeLinecap="round" />
  }
}

function Brows({ mood }: { mood: Mood }) {
  const a = mood === 'angry' ? [-3, 3] : mood === 'sad' ? [3, -3] : mood === 'surprised' ? [-2, -2] : [0, 0]
  return (
    <g stroke="#3a2a22" strokeWidth="2" strokeLinecap="round">
      <path d={`M33 ${44 + a[0]} L45 ${44 + a[1]}`} /><path d={`M55 ${44 + a[1]} L67 ${44 + a[0]}`} />
    </g>
  )
}

export function Avatar({ look, mood = 'neutral', size = 160, glow = false }: { look: Look; mood?: Mood; size?: number; glow?: boolean }) {
  const { hair, skin, outfit, style = 'short', extra = 'none', cls, level = 1 } = look
  const has = (id: string) => level >= (GEAR.find((g) => g.id === id)?.lvl ?? 99)
  const eyeOpen = mood === 'surprised' ? 4.6 : 3.8
  const happy = mood === 'happy'
  return (
    <svg viewBox="0 0 100 160" width={size} height={size * 1.6} role="img" aria-label="персонаж">
      <defs>
        <radialGradient id="aura"><stop offset="0" stopColor="#ffe27a" stopOpacity=".7" /><stop offset="1" stopColor="#ffe27a" stopOpacity="0" /></radialGradient>
      </defs>
      {(glow || has('aura')) && cls && <circle cx="50" cy="85" r="62" fill="url(#aura)" />}
      {cls && has('cape') && <path d="M24 90 Q50 160 76 90 L82 150 Q50 165 18 150 Z" fill="#3b2d6b" opacity=".9" />}
      {/* back hair */}
      {style === 'long' && <path d="M22 50 Q20 100 30 112 L70 112 Q80 100 78 50 Z" fill={hair} />}
      {/* body */}
      <path d="M26 148 Q26 94 50 92 Q74 94 74 148 Z" fill={outfit} />
      <path d="M44 92 L50 108 L56 92 Z" fill={skin} />
      {extra === 'apron' && <path d="M36 112 L64 112 L66 148 L34 148 Z" fill="#fff" opacity=".9" />}
      {cls && has('scarf') && <path d="M32 94 Q50 104 68 94 L68 102 Q50 112 32 102 Z" fill="#f2c14e" />}
      {/* arms */}
      <path d="M27 104 Q18 124 26 138" stroke={outfit} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M73 104 Q82 124 74 138" stroke={outfit} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="140" r="5" fill={skin} /><circle cx="74" cy="140" r="5" fill={skin} />
      {cls && has('weapon') && <Weapon kind={CLASSES[cls].weapon} />}
      {/* head */}
      <circle cx="50" cy="52" r="27" fill={skin} />
      <ellipse cx="36" cy="60" rx="5" ry="3" fill="#ff9aa2" opacity=".35" /><ellipse cx="64" cy="60" rx="5" ry="3" fill="#ff9aa2" opacity=".35" />
      {/* front hair */}
      {style === 'bun' && <circle cx="50" cy="20" r="11" fill={hair} />}
      {style === 'spiky' && <path d="M22 46 L26 22 L38 34 L46 14 L54 34 L66 18 L74 34 L78 46 Q50 24 22 46Z" fill={hair} />}
      {style !== 'spiky' && <path d="M22 50 Q22 22 50 22 Q78 22 78 50 Q64 34 50 36 Q36 34 22 50 Z" fill={hair} />}
      {style === 'long' && <><path d="M22 50 L28 76 L24 50Z" fill={hair} /><path d="M78 50 L72 76 L76 50Z" fill={hair} /></>}
      {extra === 'cap' && <><path d="M22 40 Q50 12 78 40 Z" fill="#1e3a8a" /><rect x="22" y="38" width="56" height="5" rx="2" fill="#162b69" /></>}
      {cls && has('band') && <rect x="23" y="34" width="54" height="6" rx="2" fill="#e5484d" />}
      {/* face */}
      <Brows mood={mood} />
      {happy ? (
        <g stroke="#2a1d1a" strokeWidth="2.4" fill="none" strokeLinecap="round"><path d="M34 54 Q39 48 44 54" /><path d="M56 54 Q61 48 66 54" /></g>
      ) : (
        <g fill="#2a1d1a"><ellipse cx="39" cy="53" rx="3.6" ry={eyeOpen} /><ellipse cx="61" cy="53" rx="3.6" ry={eyeOpen} />
          <circle cx="40.2" cy="51.5" r="1.2" fill="#fff" /><circle cx="62.2" cy="51.5" r="1.2" fill="#fff" /></g>
      )}
      {extra === 'glasses' && <g stroke="#444" strokeWidth="1.8" fill="none"><circle cx="39" cy="53" r="8" /><circle cx="61" cy="53" r="8" /><path d="M47 53 L53 53" /></g>}
      <Mouth mood={mood} />
      {cls && has('crown') && <path d="M32 22 L38 8 L45 18 L50 4 L55 18 L62 8 L68 22 Z" fill="#f2c14e" stroke="#c99a1e" strokeWidth="1.5" />}
    </svg>
  )
}

function Weapon({ kind }: { kind: string }) {
  switch (kind) {
    case 'katana': return <g><rect x="80" y="82" width="4" height="62" rx="1" fill="#dfe6ee" transform="rotate(12 82 110)" /><rect x="76" y="138" width="12" height="4" fill="#6b3b1c" transform="rotate(12 82 140)" /></g>
    case 'staff': return <g><rect x="80" y="70" width="4" height="82" rx="2" fill="#7b5a36" /><circle cx="82" cy="66" r="8" fill="#a98bff" /><circle cx="82" cy="66" r="4" fill="#fff" opacity=".7" /></g>
    case 'shuriken': return <g transform="translate(84 126)"><path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3Z" fill="#c8d0dc" stroke="#333" /></g>
    default: return <g><rect x="80" y="76" width="3" height="70" fill="#8a5a2b" /><path d="M72 76 L92 76 L88 92 L76 92Z" fill="#fff" stroke="#d33" /></g>
  }
}

/* ---------------- backgrounds ---------------- */
const SKY: Record<string, [string, string]> = {
  school: ['#8fd3ff', '#e6f6ff'], classroom: ['#f7e7c6', '#f1d9a8'], cafe: ['#f2d3a8', '#d9a066'], station: ['#9bc4e8', '#dcecf8'],
  park: ['#8fd3ff', '#c9efc0'], shop: ['#f5d9b3', '#e6b27a'], home: ['#f7e0c0', '#e8c79c'], restaurant: ['#c97b5a', '#7a3a2a'],
  street: ['#ffb68a', '#ffe0b0'], shrine: ['#ff9d6b', '#ffe3a8'], hospital: ['#e8f4f8', '#cfe6ee'], train: ['#a9c7e8', '#7c9dc4'],
  beach: ['#7fd0ff', '#fff0c2'], night_city: ['#10163a', '#3a2a6b'],
}

export function Bg({ id }: { id: string }) {
  const [a, b] = SKY[id] ?? SKY.street
  const gid = 'bg-' + id
  const night = id === 'night_city'
  return (
    <svg className="bg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="800" height="450" fill={`url(#${gid})`} />
      {(id === 'park' || id === 'school' || id === 'street' || id === 'beach' || id === 'shrine') && <circle cx="660" cy="90" r="42" fill="#fff6c8" opacity=".9" />}
      {night && <><circle cx="640" cy="80" r="34" fill="#f7f1d0" />{Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 197) % 800} cy={(i * 83) % 200} r="1.6" fill="#fff" />)}</>}
      {(id === 'school' || id === 'street' || id === 'night_city' || id === 'station') &&
        Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={i * 120 - 10} y={170 - (i % 3) * 40} width="105" height={300 - (i % 3) * 20} fill={night ? '#1d1f4a' : i % 2 ? '#b9c6d6' : '#a5b4c8'} />
            {Array.from({ length: 8 }, (_, w) => <rect key={w} x={i * 120 + 8 + (w % 3) * 28} y={190 - (i % 3) * 40 + Math.floor(w / 3) * 36} width="16" height="20" fill={night ? (w % 2 ? '#ffd86b' : '#3b3f7a') : '#e8f3ff'} />)}
          </g>
        ))}
      {id === 'park' && <>{[120, 330, 560, 720].map((x, i) => <g key={x}><rect x={x} y="250" width="16" height="90" fill="#7a5230" /><circle cx={x + 8} cy="230" r={52 + (i % 2) * 8} fill={i % 2 ? '#6bbf59' : '#58a84b'} /></g>)}</>}
      {id === 'shrine' && <g><rect x="250" y="160" width="14" height="190" fill="#d63a2f" /><rect x="536" y="160" width="14" height="190" fill="#d63a2f" /><rect x="220" y="150" width="360" height="22" rx="4" fill="#d63a2f" /><rect x="240" y="190" width="320" height="12" fill="#b32c23" /></g>}
      {id === 'beach' && <><rect y="300" width="800" height="70" fill="#4ab3e8" /><path d="M0 300 Q100 285 200 300 T400 300 T600 300 T800 300 V320 H0Z" fill="#9edcf5" /></>}
      {id === 'cafe' && <g><rect x="60" y="80" width="200" height="150" rx="8" fill="#bfe6ff" opacity=".8" /><rect x="60" y="80" width="200" height="150" rx="8" fill="none" stroke="#7a4b24" strokeWidth="8" /><rect x="0" y="300" width="800" height="20" fill="#7a4b24" /><rect x="520" y="110" width="200" height="14" fill="#7a4b24" />{[550, 600, 650, 690].map((x) => <rect key={x} x={x} y="80" width="18" height="30" rx="3" fill="#fff" />)}</g>}
      {id === 'restaurant' && <g>{[120, 400, 680].map((x) => <g key={x}><line x1={x} y1="0" x2={x} y2="80" stroke="#222" /><path d={`M${x - 40} 80 Q${x} 40 ${x + 40} 80Z`} fill="#ffcf5a" /></g>)}<rect y="300" width="800" height="20" fill="#4a2318" /></g>}
      {(id === 'classroom' || id === 'home' || id === 'hospital' || id === 'shop') && <g>
        <rect x="80" y="70" width={id === 'classroom' ? 360 : 180} height={id === 'classroom' ? 130 : 130} rx="6" fill={id === 'classroom' ? '#27483a' : '#d9efff'} stroke="#8a6a44" strokeWidth="8" />
        {id === 'shop' && [520, 590, 660].map((x) => <rect key={x} x={x} y="120" width="55" height="180" fill="#c58f56" stroke="#8a5a2b" strokeWidth="4" />)}
        {id === 'home' && <rect x="560" y="160" width="160" height="140" rx="10" fill="#c9a37a" />}
        {id === 'hospital' && <g><rect x="580" y="60" width="90" height="90" rx="10" fill="#fff" /><path d="M625 76 V134 M596 105 H654" stroke="#e5484d" strokeWidth="14" /></g>}
      </g>}
      {id === 'train' && <g><rect y="100" width="800" height="230" fill="#d9e4f1" /><rect x="40" y="130" width="160" height="110" rx="8" fill="#8fc3ee" /><rect x="260" y="130" width="160" height="110" rx="8" fill="#8fc3ee" /><rect x="480" y="130" width="160" height="110" rx="8" fill="#8fc3ee" /><rect y="290" width="800" height="40" fill="#3c6aa8" /></g>}
      {id === 'station' && <g><rect y="320" width="800" height="14" fill="#555" /><rect x="0" y="334" width="800" height="12" fill="#888" /><rect x="520" y="90" width="220" height="50" rx="6" fill="#2a2f45" /><text x="630" y="124" textAnchor="middle" fontSize="28" fill="#6ee27a" fontFamily="monospace">のぼり 3</text></g>}
      {/* floor */}
      <rect y="335" width="800" height="115" fill={night ? '#17183a' : id === 'cafe' || id === 'restaurant' || id === 'home' || id === 'classroom' ? '#a8744a' : id === 'beach' ? '#f3dca0' : id === 'park' ? '#7ec26a' : '#c9ced6'} opacity=".92" />
    </svg>
  )
}

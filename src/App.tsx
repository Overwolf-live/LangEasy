import { useEffect, useState } from 'react'
import { GameProvider, useGame } from './game/store'
import { Home } from './ui/Home'
import { Lesson } from './ui/Lesson'
import { Novel } from './ui/Novel'
import { Profile } from './ui/Profile'
import { Create } from './ui/Create'
import { STORIES } from './data/index'
import type { Block } from './types'

function Shell() {
  const { s, d } = useGame()
  const [tab, setTab] = useState<'home' | 'profile'>('home')
  const [block, setBlock] = useState<Block | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [tab, block, editing])

  if (!s.profile.created || editing) return <Create onDone={() => setEditing(false)} />

  if (block) {
    const story = block.storyId ? STORIES.find((x) => x.id === block.storyId) : null
    if (story) {
      return <Novel story={story} onExit={() => setBlock(null)} onFinish={(stars) => {
        d({ type: 'reward', xp: 20 + stars * 10, coins: 5 + stars * 3 }); d({ type: 'finish', id: block.id, stars }); setBlock(null)
      }} />
    }
    return <Lesson block={block} onExit={() => setBlock(null)} />
  }
  return (
    <>
      {tab === 'home' ? <Home onStart={setBlock} /> : <Profile onEdit={() => setEditing(true)} />}
      <nav className="nav">
        <button className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>🗺️ Навчання</button>
        <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>🧑 Профіль</button>
      </nav>
    </>
  )
}

export default function App() {
  return <GameProvider><Shell /></GameProvider>
}

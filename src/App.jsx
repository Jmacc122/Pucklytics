import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import InsightsPage from './pages/InsightsPage'
import LivePage from './pages/LivePage'
import LiveDeepDivePage from './pages/LiveDeepDivePage'
import './index.css'

// #live-{gameId}  → livedeep page
// #live           → live page
// #insights       → insights page
// anything else   → home
function parseHash() {
  const h = window.location.hash.replace('#', '')
  const m = h.match(/^live-(\d+)$/)
  if (m) return { page: 'livedeep', gameId: Number(m[1]) }
  if (h === 'live')     return { page: 'live',     gameId: null }
  if (h === 'insights') return { page: 'insights', gameId: null }
  return { page: 'home', gameId: null }
}

function App() {
  const initial = parseHash()
  const [page, setPage] = useState(initial.page)
  const [selectedGameId, setSelectedGameId] = useState(initial.gameId)

  function handleNav(dest, gameId = null) {
    window.location.hash = dest === 'livedeep' && gameId != null
      ? `live-${gameId}`
      : dest === 'home' ? '' : dest
    setSelectedGameId(gameId)
    setPage(dest)
  }

  // Keep state in sync when user hits browser back/forward
  useEffect(() => {
    function onHashChange() {
      const { page, gameId } = parseHash()
      setSelectedGameId(gameId)
      setPage(page)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (page === 'insights') return <InsightsPage onNav={handleNav} />
  if (page === 'live') return <LivePage onNav={handleNav} />
  if (page === 'livedeep') return <LiveDeepDivePage onNav={handleNav} gameId={selectedGameId} />
  return <HomePage onNav={handleNav} />
}

export default App
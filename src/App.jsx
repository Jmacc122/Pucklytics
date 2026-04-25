import { useState } from 'react'
import HomePage from './pages/HomePage'
import InsightsPage from './pages/InsightsPage'
import LivePage from './pages/LivePage'
import LiveDeepDivePage from './pages/LiveDeepDivePage'
import './index.css'

function App() {
  const [page, setPage] = useState('home')
  const [selectedGameId, setSelectedGameId] = useState(null)

  function handleNav(dest, gameId = null) {
    setSelectedGameId(gameId)
    setPage(dest)
  }

  if (page === 'insights') return <InsightsPage onNav={handleNav} />
  if (page === 'live') return <LivePage onNav={handleNav} />
  if (page === 'livedeep') return <LiveDeepDivePage onNav={handleNav} gameId={selectedGameId} />
  return <HomePage onNav={handleNav} />
}

export default App
import { useState } from 'react'
import HomePage from './pages/HomePage'
import InsightsPage from './pages/InsightsPage'
import LivePage from './pages/LivePage'
import LiveDeepDivePage from './pages/LiveDeepDivePage'
import './index.css'

function App() {
  const [page, setPage] = useState('home')

  if (page === 'insights') return <InsightsPage onNav={setPage} />
  if (page === 'live') return <LivePage onNav={setPage} />
  if (page === 'livedeep') return <LiveDeepDivePage onNav={setPage} />
  return <HomePage onNav={setPage} />
}

export default App
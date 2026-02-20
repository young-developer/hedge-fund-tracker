import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import QuarterAnalysis from './pages/QuarterAnalysis'
import FundAnalysis from './pages/FundAnalysis'
import StockAnalysis from './pages/StockAnalysis'
import AIAnalyst from './pages/AIAnalyst'
import AIDueDiligence from './pages/AIDueDiligence'
import Filings from './pages/Filings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quarters" element={<QuarterAnalysis />} />
          <Route path="funds" element={<FundAnalysis />} />
          <Route path="stocks" element={<StockAnalysis />} />
          <Route path="filings" element={<Filings />} />
          <Route path="ai-analyst" element={<AIAnalyst />} />
          <Route path="ai-due-diligence" element={<AIDueDiligence />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

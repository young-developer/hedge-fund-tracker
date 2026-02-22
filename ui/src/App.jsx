import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import QuarterAnalysis from './pages/QuarterAnalysis'
import FundAnalysis from './pages/FundAnalysis'
import StockAnalysis from './pages/StockAnalysis'
import AIAnalyst from './pages/AIAnalyst'
import AIDueDiligence from './pages/AIDueDiligence'
import Filings from './pages/Filings'
import Settings from './pages/Settings'
import MyPortfolio from './pages/MyPortfolio'
import {DashboardProvider} from './contexts/DashboardContext'

function App() {
  return (
      <DashboardProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout/>}>
              <Route index element={<Home/>}/>
              <Route path="quarters" element={<QuarterAnalysis/>}/>
              <Route path="funds" element={<FundAnalysis/>}/>
              <Route path="stocks" element={<StockAnalysis/>}/>
              <Route path="portfolio" element={<MyPortfolio/>}/>
              <Route path="filings" element={<Filings/>}/>
              <Route path="ai-analyst" element={<AIAnalyst/>}/>
              <Route path="ai-due-diligence" element={<AIDueDiligence/>}/>
              <Route path="settings" element={<Settings/>}/>
            </Route>
          </Routes>
        </Router>
      </DashboardProvider>
  )
}

export default App

import {X} from 'lucide-react'
import {useNavigate} from 'react-router-dom'

export default function StockActionModal({stock, onClose}) {
  const navigate = useNavigate()

  const handleTradingView = () => {
    window.open(`https://www.tradingview.com/chart/?symbol=${stock.ticker}`, '_blank')
  }

  const handleSearchStocks = () => {
    navigate(`/stocks?ticker=${encodeURIComponent(stock.ticker)}`)
  }

  const handleRunAIDueDiligence = () => {
    navigate(`/ai-due-diligence?ticker=${encodeURIComponent(stock.ticker)}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Actions for {stock.ticker}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleTradingView}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
          >
            <span className="text-lg">📊</span>
            <span className="font-medium">Show in TradingView</span>
          </button>
          <button
            onClick={handleSearchStocks}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            <span className="text-lg">🔍</span>
            <span className="font-medium">Search in Stocks</span>
          </button>
          <button
            onClick={handleRunAIDueDiligence}
            className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
          >
            <span className="text-lg">🤖</span>
            <span className="font-medium">Run AI Due Diligence</span>
          </button>
        </div>
      </div>
    </div>
  )
}

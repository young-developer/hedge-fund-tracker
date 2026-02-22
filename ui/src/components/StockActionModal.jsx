import {X, TrendingUp, TrendingDown, DollarSign} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {getRecommendationColorClass} from '../utils/score-colors'

export default function StockActionModal({stock, recommendation, onClose}) {
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

  const recommendationClass = getRecommendationColorClass(recommendation?.label)

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

        {recommendation && recommendation.label !== 'N/A' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${recommendationClass}`}>
                  {recommendation.label}
                </span>
                {recommendation.confidence !== undefined && (
                    <span className="text-xs text-gray-600">
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </span>
                )}
              </div>

              {recommendation.total_value !== undefined && (
                  <div className="text-sm text-gray-600 mb-1">
                    Total Value: ${recommendation.total_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
              )}

              {recommendation.delta_value !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(recommendation.delta_value)}
                    <span className="text-gray-600">
                      Delta: ${recommendation.delta_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
              )}

              {recommendation.delta_pct !== undefined && (
                  <div className="text-sm text-gray-600 mt-1">
                    Delta %: {recommendation.delta_pct > 0 ? '+' : ''}{recommendation.delta_pct.toFixed(1)}%
                  </div>
              )}

              {recommendation.net_buyers !== undefined && (
                  <div className="text-sm text-gray-600 mt-1">
                    Net Buyers: {recommendation.net_buyers > 0 ? '+' : ''}{recommendation.net_buyers}
                  </div>
              )}

              {recommendation.reasoning && (
                  <div className="text-xs text-gray-500 mt-2">
                    <p className="font-medium mb-1">Reasoning:</p>
                    <p>{recommendation.reasoning}</p>
                  </div>
              )}
            </div>
        )}

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

function getTrendIcon(deltaValue) {
  if (deltaValue > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
  if (deltaValue < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
  return <DollarSign className="h-4 w-4 text-gray-600" />
}

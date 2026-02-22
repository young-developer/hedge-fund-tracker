import TickerLogo from './TickerLogo'
import StockActionModal from './StockActionModal'
import {useState} from 'react'
import {getRecommendationColorClass} from '../utils/score-colors'

export default function PortfolioTile({stock, analysis}) {
  const [showModal, setShowModal] = useState(false)
  const recommendation = analysis?.[stock.ticker] || { label: 'N/A', confidence: 0, reasoning: 'No data' }
  const recommendationClass = getRecommendationColorClass(recommendation.label)

  return (
      <>
        <div
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowModal(true)}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              <TickerLogo ticker={stock.ticker}/>
            </div>
            <div
                className="font-bold text-sm sm:text-base mb-1">{stock.ticker}</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
              {stock.company}
            </div>
            {recommendation.label && recommendation.label !== 'N/A' && (
                <div className="mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${recommendationClass}`}>
                    {recommendation.label}
                  </span>
                </div>
            )}
            {recommendation.confidence !== undefined && recommendation.confidence > 0 && (
                <div className="text-xs text-gray-600 mb-2">
                  {Math.round(recommendation.confidence * 100)}% confidence
                </div>
            )}
            {recommendation.total_value !== undefined && (
                <div className="text-xs text-gray-600 mb-2">
                  ${recommendation.total_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
            )}
            {recommendation.delta_value !== undefined && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-2">
                  {recommendation.delta_value > 0 ? '↗' : recommendation.delta_value < 0 ? '↘' : '→'}
                  <span>
                    ${recommendation.delta_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                </div>
            )}
          </div>
        </div>
        {showModal && (
            <StockActionModal stock={stock} recommendation={recommendation}
                              onClose={() => setShowModal(false)}/>
        )}
      </>
  )
}

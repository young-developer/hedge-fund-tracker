import TickerLogo from './TickerLogo'
import StockActionModal from './StockActionModal'
import {useState} from 'react'
import {getRecommendationColorClass} from '../utils/score-colors'

export default function PortfolioTile({stock, analysis, priceChange}) {
  const [showModal, setShowModal] = useState(false)
  const recommendation = analysis?.[stock.ticker] || { label: 'N/A', confidence: 0, reasoning: 'No data' }
  const recommendationClass = getRecommendationColorClass(recommendation.label)

  console.log('PortfolioTile rendering for', stock.ticker, 'with priceChange:', priceChange)

  const priceChangeClass = priceChange?.price_change ? (
    priceChange.price_change > 0 ? 'text-green-600' : priceChange.price_change < 0 ? 'text-red-600' : 'text-gray-600'
  ) : 'text-gray-400'

  return (
      <>
        <div
            className={`${recommendationClass} rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setShowModal(true)}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-1">
              <TickerLogo ticker={stock.ticker}/>
            </div>
            <div
                className="font-bold text-xs sm:text-sm mb-0.5">{stock.ticker}</div>
            <div className="text-xs text-gray-600 mb-1 line-clamp-2">
              {stock.company}
            </div>
            {recommendation.total_value !== undefined && (
                <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                  ${recommendation.total_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
            )}
            {recommendation.delta_value !== undefined && (
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-gray-600 mb-1">
                  {recommendation.delta_value > 0 ? '↗' : recommendation.delta_value < 0 ? '↘' : '→'}
                  <span>
                    ${recommendation.delta_value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                </div>
            )}
            {priceChange && priceChange.price_change !== undefined && priceChange.price_change !== null && (
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs mb-1">
                  <span className={`font-medium ${priceChangeClass}`}>
                    {priceChange.price_change > 0 ? '+' : ''}{priceChange.price_change.toFixed(2)}%
                  </span>
                </div>
            )}
          </div>
        </div>
        {showModal && (
            <StockActionModal stock={stock} recommendation={recommendation}
                              priceChange={priceChange}
                              onClose={() => setShowModal(false)}/>
        )}
      </>
  )
}

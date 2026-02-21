import TickerLogo from './TickerLogo'
import { getTileColor, getTileClass, formatScore } from '../utils/score-colors'

export default function AIReportTile({ stock }) {
  const tileColor = getTileColor(stock.promise_score, stock.risk_score)
  const tileClasses = getTileClass(tileColor)

  return (
    <div className={`${tileClasses.bg} ${tileClasses.border} border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          <TickerLogo ticker={stock.ticker} />
        </div>
        <div className="font-bold text-sm sm:text-base mb-1">{stock.ticker}</div>
        <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
          {stock.company}
        </div>
        {stock.industry && (
          <div className="text-xs text-gray-500 mb-2">
            {stock.industry}
          </div>
        )}
        <div className="flex gap-2 sm:gap-3 w-full mt-2">
          <div className={`flex-1 py-1 px-2 sm:px-3 rounded ${tileClasses.scoreBg}`}>
            <div className="text-xs text-gray-600">Promise</div>
            <div className={`${tileClasses.scoreText} font-bold text-sm sm:text-base`}>
              {formatScore(stock.promise_score)}
            </div>
          </div>
          <div className={`flex-1 py-1 px-2 sm:px-3 rounded ${tileClasses.scoreBg}`}>
            <div className="text-xs text-gray-600">Risk</div>
            <div className={`${tileClasses.scoreText} font-bold text-sm sm:text-base`}>
              {formatScore(stock.risk_score)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

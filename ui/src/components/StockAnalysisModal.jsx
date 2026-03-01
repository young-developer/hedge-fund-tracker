import {Modal, Select} from 'antd'
import {formatCurrency, formatPercentage} from '../services/api'
import TickerLogo from './TickerLogo'
import {getStockPriceHistory, getStockFundamentals} from '../api/stocks'
import {useState, useEffect} from 'react'

function PriceChart({priceHistory, ticker}) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No price history available</p>
      </div>
    )
  }

  const prices = priceHistory.map(p => p.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1
  const padding = 40
  const chartWidth = 800
  const chartHeight = 250
  const stepX = (chartWidth - padding * 2) / (prices.length - 1)

  const points = prices.map((price, index) => {
    const x = padding + index * stepX
    const y = chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - padding * 2)
    return `${x},${y}`
  }).join(' ')

  const maxPricePoint = points.split(' ').find(p => parseFloat(p.split(',')[1]) === Math.max(...prices.map(p => p.close)))
  const minPricePoint = points.split(' ').find(p => parseFloat(p.split(',')[1]) === Math.min(...prices.map(p => p.close)))

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">Price History</h4>
        <span className="text-sm text-gray-500">
          {priceHistory.length} days of data
        </span>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" style={{maxHeight: '300px'}}>
          {/* Grid lines */}
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          <text x={padding - 10} y={chartHeight - padding} textAnchor="end" className="text-xs fill-gray-500">
            ${maxPrice.toFixed(2)}
          </text>
          <text x={padding - 10} y={chartHeight / 2} textAnchor="end" className="text-xs fill-gray-500">
            ${(maxPrice + minPrice) / 2}
            {': ' + ((maxPrice + minPrice) / 2).toFixed(2)}
          </text>
          <text x={padding - 10} y={padding} textAnchor="end" className="text-xs fill-gray-500">
            ${minPrice.toFixed(2)}
          </text>

          {/* X-axis labels (show every 30th point to avoid crowding) */}
          {priceHistory.length > 30 && (
            <text x={padding} y={chartHeight - padding + 20} textAnchor="middle" className="text-xs fill-gray-500">
              {formatDate(priceHistory[0].date)}
            </text>
          )}
          {priceHistory.length > 60 && (
            <text
              x={chartWidth / 2}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {formatDate(priceHistory[Math.floor(priceHistory.length / 2)].date)}
            </text>
          )}
          {priceHistory.length > 90 && (
            <text x={chartWidth - padding} y={chartHeight - padding + 20} textAnchor="middle" className="text-xs fill-gray-500">
              {formatDate(priceHistory[priceHistory.length - 1].date)}
            </text>
          )}

          {/* Price line */}
          <polyline
            points={points}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* End point dot */}
          {maxPricePoint && (
            <circle
              cx={parseFloat(maxPricePoint.split(',')[0])}
              cy={parseFloat(maxPricePoint.split(',')[1])}
              r="4"
              fill="#2563eb"
            />
          )}

          {/* Tooltip for current price */}
          {maxPricePoint && (
            <g>
              <rect
                x={parseFloat(maxPricePoint.split(',')[0]) - 60}
                y={parseFloat(maxPricePoint.split(',')[1]) - 45}
                width="120"
                height="35"
                rx="4"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
                filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
              />
              <text
                x={parseFloat(maxPricePoint.split(',')[0])}
                y={parseFloat(maxPricePoint.split(',')[1]) - 23}
                textAnchor="middle"
                className="text-sm font-semibold fill-gray-900"
              >
                ${prices[prices.length - 1].toFixed(2)}
              </text>
              <text
                x={parseFloat(maxPricePoint.split(',')[0])}
                y={parseFloat(maxPricePoint.split(',')[1]) - 8}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {formatDate(priceHistory[priceHistory.length - 1].date)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

export default function StockAnalysisModal({stockData, onClose, quarter, onQuarterChange, quarters}) {
  const [priceHistory, setPriceHistory] = useState([])
  const [fundamentalsData, setFundamentalsData] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [loadingFundamentals, setLoadingFundamentals] = useState(false)

  useEffect(() => {
    async function fetchPriceHistory() {
      if (!stockData?.TICKER) return

      setLoadingPrice(true)
      try {
        const response = await getStockPriceHistory(stockData.TICKER)
        setPriceHistory(response.data || [])
      } catch (err) {
        console.error('Failed to fetch price history:', err)
      } finally {
        setLoadingPrice(false)
      }
    }

    fetchPriceHistory()
  }, [stockData?.TICKER])

  useEffect(() => {
    async function fetchFundamentals() {
      if (!stockData?.TICKER) return

      setLoadingFundamentals(true)
      try {
        const response = await getStockFundamentals(stockData.TICKER, quarter ? quarter.replace('Q', '-Q') : null)
        setFundamentalsData(response.data || null)
      } catch (err) {
        console.error('Failed to fetch fundamentals:', err)
        setFundamentalsData(null)
      } finally {
        setLoadingFundamentals(false)
      }
    }

    fetchFundamentals()
  }, [stockData?.TICKER, quarter])

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={<span>X</span>}
    >
      <div className="flex items-center gap-3 mb-6">
        <TickerLogo ticker={stockData.TICKER}/>
        <h3 className="text-xl font-semibold text-gray-900">
          {stockData.TICKER} ({stockData.COMPANY})
        </h3>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Quarter</h3>
        <Select
          value={quarter}
          onChange={onQuarterChange}
          className="w-full md:w-64"
        >
          {quarters?.map((q) => (
            <Select.Option key={q} value={q}>
              {q}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-700">Total Value</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(stockData.TOTAL_VALUE)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-700">Total Delta Value</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatCurrency(stockData.TOTAL_DELTA_VALUE)} {stockData.DELTA_PCT
              ? `(${formatPercentage(stockData.DELTA_PCT, 2)})` : ''}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-700">Avg Portfolio %</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {formatPercentage(stockData.AVG_PERCENTAGE, 2)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-700">Holder Count</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {stockData.HOLDER_COUNT}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-red-700">Buyers</p>
          <p className="text-xl font-bold text-red-900 mt-1">
            {stockData.NUM_BUYERS} ({stockData.NEW_HOLDER_COUNT} new)
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-700">Sellers</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            {stockData.NUM_SELLERS} ({stockData.CLOSE_COUNT} sold out)
          </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-indigo-700">Max Portfolio %</p>
          <p className="text-xl font-bold text-indigo-900 mt-1">
            {formatPercentage(stockData.MAX_PERCENTAGE, 2)}
          </p>
        </div>
        <div className="bg-pink-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-pink-700">Buyer/Seller Ratio</p>
          <p className="text-xl font-bold text-pink-900 mt-1">
            {formatCurrency(stockData.NUM_BUYERS / stockData.NUM_SELLERS || 0)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <PriceChart priceHistory={priceHistory} ticker={stockData.TICKER} />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Financial Fundamentals</h3>
        {loadingFundamentals ? (
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading fundamentals...</p>
          </div>
        ) : fundamentalsData && !fundamentalsData.error ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Market Cap</p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatCurrency(fundamentalsData.market_cap)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-700">P/E Ratio</p>
                <p className="text-xl font-bold text-green-900 mt-1">
                  {formatPercentage(fundamentalsData.pe_ratio, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-700">P/B Ratio</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {formatPercentage(fundamentalsData.pb_ratio, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">EV/EBITDA</p>
                <p className="text-xl font-bold text-yellow-900 mt-1">
                  {formatPercentage(fundamentalsData.ev_to_ebitda, 2) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-red-700">Revenue Growth (1Y)</p>
                <p className="text-xl font-bold text-red-900 mt-1">
                  {formatPercentage(fundamentalsData.revenue_growth_1y, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-700">Earnings Growth (1Y)</p>
                <p className="text-xl font-bold text-orange-900 mt-1">
                  {formatPercentage(fundamentalsData.earnings_growth_1y, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-indigo-700">FCF Margin</p>
                <p className="text-xl font-bold text-indigo-900 mt-1">
                  {formatPercentage(fundamentalsData.fcf_margin, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-teal-700">FCF Yield</p>
                <p className="text-xl font-bold text-teal-900 mt-1">
                  {formatPercentage(fundamentalsData.fcf_yield, 2) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-cyan-700">ROE</p>
                <p className="text-xl font-bold text-cyan-900 mt-1">
                  {formatPercentage(fundamentalsData.roe, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-pink-700">ROA</p>
                <p className="text-xl font-bold text-pink-900 mt-1">
                  {formatPercentage(fundamentalsData.roa, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-lime-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-lime-700">Gross Margin</p>
                <p className="text-xl font-bold text-lime-900 mt-1">
                  {formatPercentage(fundamentalsData.gross_margin, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-amber-700">Net Margin</p>
                <p className="text-xl font-bold text-amber-900 mt-1">
                  {formatPercentage(fundamentalsData.net_margin, 2) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-rose-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-rose-700">Interest Coverage</p>
                <p className="text-xl font-bold text-rose-900 mt-1">
                  {formatPercentage(fundamentalsData.interest_coverage, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-violet-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-violet-700">Net Debt/Equity</p>
                <p className="text-xl font-bold text-violet-900 mt-1">
                  {formatPercentage(fundamentalsData.net_debt_to_equity, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-emerald-700">Current Ratio</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">
                  {formatPercentage(fundamentalsData.current_ratio, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-sky-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-sky-700">Cash Ratio</p>
                <p className="text-xl font-bold text-sky-900 mt-1">
                  {formatPercentage(fundamentalsData.cash_ratio, 2) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-fuchsia-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-fuchsia-700">Price Momentum (12M)</p>
                <p className="text-xl font-bold text-fuchsia-900 mt-1">
                  {formatPercentage(fundamentalsData.price_momentum_12m, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Price Momentum (6M)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {formatPercentage(fundamentalsData.price_momentum_6m, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-700">PEG Ratio</p>
                <p className="text-xl font-bold text-orange-900 mt-1">
                  {formatPercentage(fundamentalsData.peg_ratio, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-teal-700">Dividend Yield</p>
                <p className="text-xl font-bold text-teal-900 mt-1">
                  {formatPercentage(fundamentalsData.dividend_yield, 2) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Analyst Upside</p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatPercentage(fundamentalsData.analyst_upside, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-700">Analyst Target</p>
                <p className="text-xl font-bold text-green-900 mt-1">
                  {formatCurrency(fundamentalsData.analyst_target_price)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Forward P/E</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {formatPercentage(fundamentalsData.forward_pe, 2) || 'N/A'}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">Payout Ratio</p>
                <p className="text-xl font-bold text-yellow-900 mt-1">
                  {formatPercentage(fundamentalsData.payout_ratio, 2) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No fundamentals data available</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Holders by Shares</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Delta Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Portfolio %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Delta
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {stockData.HOLDERS.map((holder, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(holder.DELTA_VALUE)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holder.FUND}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatPercentage(parseFloat(holder.PORTFOLIO_PCT) || 0, 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(holder.DELTA_SHARES || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(holder.VALUE)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {holder.DELTA}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

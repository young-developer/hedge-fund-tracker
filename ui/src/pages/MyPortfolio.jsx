import {useEffect, useState, useMemo} from 'react'
import {searchStocks} from '../api/stocks'
import {
  getStockRecommendation,
  getPortfolioFromStorage,
  addToPortfolio,
  removeFromPortfolio,
  isStockInPortfolio,
  getStockHolders,
  getAllAvailableQuarters
} from '../api/portfolio'
import {Search, Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign} from 'lucide-react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import TickerLogo from '../components/TickerLogo'

export default function MyPortfolio() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedStockAnalysis, setSelectedStockAnalysis] = useState(null)
  const [selectedStockHolders, setSelectedStockHolders] = useState([])
  const [portfolioAnalysis, setPortfolioAnalysis] = useState({})
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [quarters, setQuarters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedStocks, setExpandedStocks] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [addedStock, setAddedStock] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [portfolioData, allQuarters] = await Promise.all([
          getPortfolioFromStorage(),
          getAllAvailableQuarters()
        ])

        setPortfolio(portfolioData)

        let quartersList = []
        if (Array.isArray(allQuarters)) {
          quartersList = allQuarters
        } else if (allQuarters && typeof allQuarters === 'object') {
          quartersList = allQuarters.data || []
        }

        setQuarters(quartersList)

        if (quartersList.length > 0) {
          setSelectedQuarter(quartersList[0])

          if (portfolioData.length > 0) {
            console.log('Loading portfolio analysis for:', portfolioData)
            await loadPortfolioAnalysis(quartersList[0], portfolioData)
          }
        } else {
          setError('No quarters available in database')
        }
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function loadPortfolioAnalysis(quarter, portfolioData) {
    if (!portfolioData || portfolioData.length === 0) {
      return
    }

    try {
      setLoading(true)
      const analysisPromises = portfolioData.map(stock =>
        getStockRecommendation(stock.ticker, quarter)
      )

      const analysisResults = await Promise.all(analysisPromises)

      const analysisMap = {}
      analysisResults.forEach((result, index) => {
        if (result && !result.error) {
          analysisMap[portfolioData[index].ticker] = result
        }
      })

      setPortfolioAnalysis(analysisMap)
    } catch (err) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(query) {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await searchStocks(query)
      setSearchResults(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to search stocks')
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = searchResults.filter((stock) =>
      stock.Ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.Company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleAddToPortfolio(ticker, company) {
    try {
      const response = await getStockRecommendation(ticker, selectedQuarter)
      const recommendation = response

      if (recommendation.error) {
        setError(`Failed to get recommendation for ${ticker}: ${recommendation.error}`)
        return
      }

      setAddedStock({
        ticker,
        company,
        cusip: searchResults.find(s => s.Ticker === ticker)?.CUSIP,
        recommendation
      })
      setShowAddModal(true)
    } catch (err) {
      setError(err.message || 'Failed to get stock recommendation')
    }
  }

  function handleConfirmAdd() {
    if (addedStock) {
      addToPortfolio({
        ticker: addedStock.ticker,
        company: addedStock.company,
        cusip: addedStock.cusip
      })
      setShowAddModal(false)
      setAddedStock(null)
      setPortfolio(getPortfolioFromStorage())

      if (selectedQuarter && addedStock.recommendation && !addedStock.recommendation.error) {
        setPortfolioAnalysis(prev => ({
          ...prev,
          [addedStock.ticker]: addedStock.recommendation
        }))
      }
    }
  }

  async function handleRemoveFromPortfolio(ticker) {
    removeFromPortfolio(ticker)
    setPortfolio(getPortfolioFromStorage())
    setSelectedStock(null)
    setSelectedStockAnalysis(null)
    setPortfolioAnalysis(prev => {
      const newAnalysis = { ...prev }
      delete newAnalysis[ticker]
      return newAnalysis
    })
  }

  function toggleStockExpansion(ticker) {
    const newExpanded = new Set(expandedStocks)
    if (newExpanded.has(ticker)) {
      newExpanded.delete(ticker)
    } else {
      newExpanded.add(ticker)
    }
    setExpandedStocks(newExpanded)
  }

  async function handleQuarterChange(newQuarter) {
    setSelectedQuarter(newQuarter)

    if (!portfolio.length) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const portfolioData = getPortfolioFromStorage()
      const analysisPromises = portfolioData.map(stock =>
        getStockRecommendation(stock.ticker, newQuarter)
      )

      const analysisResults = await Promise.all(analysisPromises)

      const analysisMap = {}
      analysisResults.forEach((result, index) => {
        if (result && !result.error) {
          analysisMap[portfolioData[index].ticker] = result
        }
      })

      console.log('Quarter change - updated analysis map:', analysisMap)
      setPortfolioAnalysis(analysisMap)
    } catch (err) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  function getRecommendationColor(label) {
    switch (label) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  function getTrendIcon(deltaValue) {
    if (deltaValue > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (deltaValue < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <DollarSign className="h-4 w-4 text-gray-600" />
  }

  function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) {
      return '$0'
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const portfolioWithAnalysis = useMemo(() => {
    if (!portfolio.length) {
      return []
    }

    return portfolio.map((stock) => {
      const analysis = portfolioAnalysis[stock.ticker]
      return {
        ...stock,
        recommendation: analysis || { label: 'N/A', confidence: 0, reasoning: 'No data' }
      }
    })
  }, [portfolio, portfolioAnalysis])

  if (loading) {
    return (
        <ErrorBoundary>
          <LoadingSpinner message="Loading portfolio..."/>
        </ErrorBoundary>
    )
  }

  return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
            <p className="mt-2 text-gray-600">Manage your stocks and track institutional activity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-sm text-gray-500">Total Stocks</div>
              <div className="text-2xl font-bold text-gray-900">{portfolio.length}</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Selected Quarter</div>
              <select
                  value={selectedQuarter}
                  onChange={(e) => handleQuarterChange(e.target.value)}
                  disabled={loading}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {quarters.map((quarter) => (
                    <option key={quarter} value={quarter}>
                      {quarter}
                    </option>
                ))}
              </select>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Stocks with Recommendations</div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioWithAnalysis.filter(s => s.recommendation.label !== 'N/A').length}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Add Stock to Portfolio</h3>
            <div className="flex gap-4">
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Enter ticker or company name (e.g., AAPL)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={!searchQuery.trim() || loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Search className="h-5 w-5"/>
                Search
              </button>
            </div>

            {loading && filteredStocks.length === 0 && searchQuery && (
                <LoadingSpinner message="Searching stocks..."/>
            )}

            {filteredStocks.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">{filteredStocks.length} stocks found:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredStocks.map((stock) => (
                        <button
                            key={stock.CUSIP}
                            onClick={() => handleAddToPortfolio(stock.Ticker, stock.Company)}
                            disabled={isStockInPortfolio(stock.Ticker)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <TickerLogo ticker={stock.Ticker}/>
                            <div>
                              <p className="font-semibold text-gray-900">{stock.Ticker}</p>
                              <p className="text-sm text-gray-500">{stock.Company}</p>
                            </div>
                          </div>
                          <Plus className="h-5 w-5 text-blue-600"/>
                        </button>
                    ))}
                  </div>
                </div>
            )}

            {!searchQuery && (
                <p className="text-sm text-gray-500 mt-2">Enter a ticker or company name above to search stocks</p>
            )}
          </Card>

          {portfolio.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Your Portfolio</h3>
                <div className="space-y-3">
                  {portfolioWithAnalysis.map((stock) => (
                      <div
                          key={stock.ticker}
                          className={`border rounded-lg p-4 transition-all ${
                              expandedStocks.has(stock.ticker)
                                  ? 'border-blue-300 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleStockExpansion(stock.ticker)}
                        >
                          <div className="flex items-center gap-3">
                            <TickerLogo ticker={stock.ticker}/>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{stock.ticker}</p>
                                {stock.recommendation.label !== 'N/A' && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                        getRecommendationColor(stock.recommendation.label)
                                    }`}>
                                      {stock.recommendation.label}
                                    </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{stock.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stock.recommendation.label !== 'N/A' && (
                                <span className="text-sm text-gray-600">
                                  {Math.round(stock.recommendation.confidence * 100)}% confidence
                                </span>
                            )}
                            <Trash2
                                className="h-4 w-4 text-red-600 hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveFromPortfolio(stock.ticker)
                                }}
                            />
                            {expandedStocks.has(stock.ticker) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400"/>
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400"/>
                            )}
                          </div>
                        </div>

                        {expandedStocks.has(stock.ticker) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {loading ? (
                                  <LoadingSpinner message="Loading analysis..."/>
                              ) : stock.recommendation.error ? (
                                  <p className="text-sm text-red-600">{stock.recommendation.error}</p>
                              ) : stock.recommendation.label !== 'N/A' && stock.recommendation.total_value !== undefined ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500">Total Value</p>
                                        <p className="font-semibold text-gray-900">
                                          {formatNumber(stock.recommendation.total_value)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Delta Value</p>
                                        <p className="font-semibold">
                                          {getTrendIcon(stock.recommendation.delta_value)}
                                          {formatNumber(stock.recommendation.delta_value)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Net Buyers</p>
                                        <p className={`font-semibold ${
                                            stock.recommendation.net_buyers > 0
                                                ? 'text-green-600'
                                                : stock.recommendation.net_buyers < 0
                                                    ? 'text-red-600'
                                                    : 'text-gray-600'
                                        }`}>
                                          {stock.recommendation.net_buyers > 0
                                              ? `+${stock.recommendation.net_buyers}`
                                              : stock.recommendation.net_buyers}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Delta %</p>
                                        <p className={`font-semibold ${
                                            stock.recommendation.delta_pct > 0
                                                ? 'text-green-600'
                                                : stock.recommendation.delta_pct < 0
                                                    ? 'text-red-600'
                                                    : 'text-gray-600'
                                        }`}>
                                          {stock.recommendation.delta_pct > 0
                                              ? `+${stock.recommendation.delta_pct.toFixed(1)}%`
                                              : `${stock.recommendation.delta_pct.toFixed(1)}%`}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Reasoning</p>
                                      <p className="text-sm text-gray-700">{stock.recommendation.reasoning}</p>
                                    </div>
                                    {selectedStockHolders && selectedStockHolders.length > 0 && (
                                        <div>
                                          <p className="text-xs text-gray-500 mb-2">Top 10 Holders</p>
                                          <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gray-50">
                                              <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delta</th>
                                              </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                              {selectedStockHolders
                                                  .sort((a, b) => parseFloat(b.VALUE) - parseFloat(a.VALUE))
                                                  .slice(0, 10)
                                                  .map((holder, index) => (
                                                      <tr key={index}>
                                                        <td className="px-3 py-2 text-sm text-gray-900">{holder.FUND}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-900">${parseFloat(holder.VALUE).toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-sm font-medium">
                                                          {holder.DELTA === 'NEW'
                                                              ? <span className="text-green-600">NEW</span>
                                                              : holder.DELTA === 'CLOSE'
                                                                  ? <span className="text-red-600">CLOSE</span>
                                                                  : holder.DELTA}
                                                        </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                    )}
                                  </div>
                              ) : (
                                  <p className="text-sm text-gray-500">No analysis data available for this stock in the selected quarter</p>
                              )}
                            </div>
                        )}
                      </div>
                  ))}
                </div>
              </Card>
          )}

          {portfolio.length === 0 && (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Your portfolio is empty</p>
                  <p className="text-sm text-gray-500">Search for stocks above and add them to your portfolio to track institutional activity</p>
                </div>
              </Card>
          )}

          {showAddModal && addedStock && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Add {addedStock.ticker} to Portfolio</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-semibold">{addedStock.company}</p>
                    </div>
                    {addedStock.recommendation.error ? (
                        <p className="text-sm text-red-600">{addedStock.recommendation.error}</p>
                    ) : (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Recommendation</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                getRecommendationColor(addedStock.recommendation.label)
                            }`}>
                              {addedStock.recommendation.label}
                            </span>
                          </div>
                            <div>
                              <p className="text-sm text-gray-500">Confidence</p>
                              <p className="font-semibold">{Math.round(addedStock.recommendation.confidence * 100)}%</p>
                            </div>
                          <div>
                            <p className="text-sm text-gray-500">Reasoning</p>
                            <p className="text-sm text-gray-700">{addedStock.recommendation.reasoning}</p>
                          </div>
                        </>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleConfirmAdd}
                        disabled={addedStock.recommendation.error}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add to Portfolio
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </ErrorBoundary>
  )
}

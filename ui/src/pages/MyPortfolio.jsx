import {useEffect, useState, useMemo} from 'react'
import {searchStocks} from '../api/stocks'
import {
  getPortfolioFromStorage,
  addToPortfolio,
  removeFromPortfolio,
  getAllAvailableQuarters,
  getPortfolioFullData,
  isStockInPortfolio,
} from '../api/portfolio'
import {formatNumber} from '../utils/format'
import {Search, Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Settings2} from 'lucide-react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import TickerLogo from '../components/TickerLogo'
import CategoryFilter from '../components/CategoryFilter'
import CategoryManagerModal from '../components/CategoryManagerModal'
import {useCategories} from '../contexts/CategoryContext'

export default function MyPortfolio() {
  const {selectedCategory, categories} = useCategories()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [portfolioAnalysis, setPortfolioAnalysis] = useState({})
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [quarters, setQuarters] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedStocks, setExpandedStocks] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [addedStock, setAddedStock] = useState(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [selectedAddCategory, setSelectedAddCategory] = useState('my')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

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
          console.error('No quarters available in database')
        }
      } catch (err) {
        console.error('Failed to load data:', err)
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
      const tickers = portfolioData.map(stock => stock.ticker)
      const fullData = await getPortfolioFullData(tickers.join(','), quarter)

      const analysisMap = {}
      if (fullData && Array.isArray(fullData)) {
        fullData.forEach(item => {
          if (item.ticker && item.recommendation) {
            analysisMap[item.ticker] = item.recommendation
          }
        })
      }

      setPortfolioAnalysis(analysisMap)
    } catch (err) {
      console.error('Failed to load stock data:', err)
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
      console.error('Failed to search stocks:', err)
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
      const response = await getPortfolioFullData(ticker, selectedQuarter)
      const recommendation = response && response[0] ? response[0].recommendation : {
        label: 'N/A',
        confidence: 0,
        reasoning: 'No data available for this quarter'
      }

      setAddedStock({
        ticker,
        company,
        cusip: searchResults.find(s => s.Ticker === ticker)?.CUSIP,
        recommendation
      })
      setShowAddModal(true)
    } catch (err) {
      console.error('Failed to get stock recommendation:', err)
      setAddedStock({
        ticker,
        company,
        cusip: searchResults.find(s => s.Ticker === ticker)?.CUSIP,
        recommendation: {
          label: 'N/A',
          confidence: 0,
          reasoning: 'Error fetching data'
        }
      })
      setShowAddModal(true)
    }
  }

  function handleConfirmAdd() {
    if (addedStock) {
      addToPortfolio({
        ticker: addedStock.ticker,
        company: addedStock.company,
        cusip: addedStock.cusip
      }, selectedAddCategory)
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
    try {
      const portfolioData = getPortfolioFromStorage()
      const tickers = portfolioData.map(stock => stock.ticker)
      const fullData = await getPortfolioFullData(tickers.join(','), newQuarter)

      const analysisMap = {}
      if (fullData && Array.isArray(fullData)) {
        fullData.forEach(item => {
          if (item.ticker && item.recommendation) {
            analysisMap[item.ticker] = item.recommendation
          }
        })
      }

      console.log('Quarter change - updated analysis map:', analysisMap)
      setPortfolioAnalysis(analysisMap)
    } catch (err) {
      console.error('Failed to load stock data:', err)
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

  const portfolioWithAnalysis = useMemo(() => {
    if (!portfolio.length) {
      return []
    }

    const filtered = portfolio.filter(stock => {
      const stockCategory = stock.categoryId || 'my'
      return stockCategory === selectedCategory
    })

    return filtered.map((stock) => {
      const analysis = portfolioAnalysis[stock.ticker]
      return {
        ...stock,
        recommendation: analysis || { label: 'N/A', confidence: 0, reasoning: 'No data' }
      }
    })
  }, [portfolio, portfolioAnalysis, selectedCategory])

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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
              <button
                  onClick={() => setShowCategoryManager(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Settings2 className="h-4 w-4"/>
                Manage Categories
              </button>
            </div>
            <p className="mt-2 text-gray-600">Manage your stocks and track institutional activity</p>
          </div>

          <Card>
            <CategoryFilter onManageClick={() => setShowCategoryManager(true)}/>
          </Card>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card>
               <div className="text-sm text-gray-500">Stocks in {categories.find(c => c.id === selectedCategory)?.name || 'Category'}</div>
               <div className="text-2xl font-bold text-gray-900">{portfolioWithAnalysis.length}</div>
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
                     <div>
                       <p className="text-sm text-gray-500">Category</p>
                       <select
                           value={selectedAddCategory}
                           onChange={(e) => setSelectedAddCategory(e.target.value)}
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                       >
                         {categories.map((category) => (
                             <option key={category.id} value={category.id}>
                               {category.name}
                             </option>
                         ))}
                       </select>
                     </div>
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

           {showCategoryManager && (
               <CategoryManagerModal onClose={() => setShowCategoryManager(false)}/>
           )}
        </div>
      </ErrorBoundary>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { searchStocks, getStockAnalysis, getStockHoldings } from '../api/stocks'
import { getLastQuarter } from '../api/analysis'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import { formatCurrency, formatPercentage, formatDate } from '../services/api'
import TickerLogo from '../components/TickerLogo'
import { Search, ArrowRight, ChevronRight, Loader2 } from 'lucide-react'

export default function StockAnalysis() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedStockData, setSelectedStockData] = useState(null)
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortColumn, setSortColumn] = useState('DELTA_VALUE')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const lastQuarter = await getLastQuarter()
        console.log('Last quarter received:', lastQuarter, typeof lastQuarter)
        if (lastQuarter) {
          setSelectedQuarter(lastQuarter.quarter)
        }
      } catch (err) {
        setError(err.message || 'Failed to load quarters')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleSearch(query) {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await searchStocks(query)
      setSearchResults(response?.data || [])
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

  const sortedBuyers = useMemo(() => {
    if (!selectedStockData?.BUYERS) return []

    return [...selectedStockData.BUYERS].sort((a, b) => {
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]

      if (sortColumn === 'DELTA_VALUE') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [selectedStockData, sortColumn, sortDirection])

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  async function handleSelectStock(ticker, company) {
    if (!selectedQuarter) {
      setError('Please select a quarter first')
      return
    }

    setLoading(true)
    try {
      const [analysisResponse, holdingsResponse] = await Promise.all([
        getStockAnalysis(ticker, selectedQuarter),
        getStockHoldings(ticker, selectedQuarter)
      ])

      setSelectedStock({ TICKER: ticker, COMPANY: company })
      setSelectedStockData(analysisResponse?.data || {})
    } catch (err) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !selectedStockData) {
    return (
      <ErrorBoundary>
        <LoadingSpinner message="Loading stock analysis..." />
      </ErrorBoundary>
    )
  }

  if (error && !selectedStockData) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
       </div>
     </ErrorBoundary>
     )
   }

    return (
     <ErrorBoundary>
       <div className="space-y-6">
         <div>
           <h2 className="text-2xl font-bold text-gray-900">Stock Analysis</h2>
           <p className="mt-2 text-gray-600">Analyze stock holdings by hedge funds</p>
         </div>

         <Card>
            <h3 className="text-lg font-semibold mb-4">Search Stocks</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Enter ticker or company name (e.g., NFLX, Netflix)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={!searchQuery.trim() || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>

            {loading && filteredStocks.length === 0 && searchQuery && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching...</span>
              </div>
            )}

            {filteredStocks.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">{filteredStocks.length} stocks found:</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.CUSIP}
                      onClick={() => handleSelectStock(stock.Ticker, stock.Company)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <TickerLogo ticker={stock.Ticker} />
                        <div>
                          <p className="font-semibold text-gray-900">{stock.Ticker}</p>
                          <p className="text-sm text-gray-500">{stock.Company}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <p className="text-sm text-gray-500 mt-2">Enter a ticker or company name above to search stocks</p>
            )}
         </Card>

        {selectedStockData && selectedStock && (
          <>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <TickerLogo ticker={selectedStock.TICKER} />
                <h3 className="text-lg font-semibold">
                  {selectedStock.TICKER} ({selectedStock.COMPANY})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Total Value</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {formatCurrency(selectedStockData.TOTAL_VALUE)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Total Delta Value</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatCurrency(selectedStockData.TOTAL_DELTA_VALUE)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-700">Avg Portfolio %</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {formatPercentage(selectedStockData.AVG_PERCENTAGE, 2)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">Holder Count</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {selectedStockData.HOLDER_COUNT}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-700">Buyers</p>
                  <p className="text-xl font-bold text-red-900 mt-1">
                    {selectedStockData.NUM_BUYERS} ({selectedStockData.NEW_HOLDER_COUNT} new)
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Sellers</p>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {selectedStockData.NUM_SELLERS} ({selectedStockData.CLOSE_COUNT} sold out)
                  </p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-indigo-700">Max Portfolio %</p>
                  <p className="text-xl font-bold text-indigo-900 mt-1">
                    {formatPercentage(selectedStockData.MAX_PERCENTAGE, 2)}
                  </p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-pink-700">Buyer/Seller Ratio</p>
                  <p className="text-xl font-bold text-pink-900 mt-1">
                    {formatCurrency(selectedStockData.NUM_BUYERS / selectedStockData.NUM_SELLERS || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Holders by Shares</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('DELTA_VALUE')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                      >
                        Delta Value
                        {sortColumn === 'DELTA_VALUE' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
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
                    {sortedBuyers.map((buyer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(buyer.DELTA_VALUE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {buyer.FUND}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(buyer.PORTFOLIO_PCT, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(buyer.SHARES)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(buyer.VALUE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {buyer.DELTA}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </ErrorBoundary>
    )
}

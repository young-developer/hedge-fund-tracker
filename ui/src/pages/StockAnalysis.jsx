import {useEffect, useState, useMemo} from 'react'
import {useSearchParams} from 'react-router-dom'
import {searchStocks, getStockAnalysis, getStockHoldings} from '../api/stocks'
import {getAllAvailableQuarters} from '../api/analysis'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import TickerLogo from '../components/TickerLogo'
import StockAnalysisModal from '../components/StockAnalysisModal'
import {Search, ChevronRight} from 'lucide-react'

export default function StockAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedStockData, setSelectedStockData] = useState(null)
  const [holdingsData, setHoldingsData] = useState([])
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [quarters, setQuarters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortColumn, setSortColumn] = useState('DELTA_VALUE')
  const [sortDirection, setSortDirection] = useState('desc')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const allQuarters = await getAllAvailableQuarters()
        let quartersList = []
        if (Array.isArray(allQuarters)) {
          quartersList = allQuarters
        } else if (allQuarters && typeof allQuarters === 'object') {
          quartersList = allQuarters.data || []
        }

        setQuarters(quartersList)

        if (quartersList.length > 0) {
          setSelectedQuarter(quartersList[0])
        } else {
          setError('No quarters available in database')
        }
      } catch (err) {
        setError(err.message || 'Failed to load quarters')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const tickerFromUrl = searchParams.get('ticker')
    if (tickerFromUrl) {
      setSearchQuery(tickerFromUrl)
      handleSearch(tickerFromUrl)
    }
  }, [searchParams])

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

  const sortedBuyers = useMemo(() => {
    if (!holdingsData || holdingsData.length === 0) {
      return []
    }

    return [...holdingsData].sort((a, b) => {
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]

      if (sortColumn === 'DELTA_VALUE') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [holdingsData, sortColumn, sortDirection])

  async function handleAutoSelectFromSearch(ticker, company) {
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

      setSelectedStock({TICKER: ticker, COMPANY: company})
      setSelectedStockData(analysisResponse.data || {})
      setHoldingsData(holdingsResponse.data || [])
      setIsModalOpen(true)
    } catch (err) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  async function handleQuarterChange(newQuarter) {
    setSelectedQuarter(newQuarter)
    if (!selectedStock) {
      return
    }

    setLoading(true)
    try {
      const [analysisResponse, holdingsResponse] = await Promise.all([
        getStockAnalysis(selectedStock.TICKER, newQuarter),
        getStockHoldings(selectedStock.TICKER, newQuarter)
      ])

      setSelectedStockData(analysisResponse.data || {})
      setHoldingsData(holdingsResponse.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
        <ErrorBoundary>
          <LoadingSpinner message="Loading stock analysis..."/>
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
            <p className="mt-2 text-gray-600">Analyze stock holdings by hedge
              funds</p>
          </div>

          {quarters.length > 0 ? (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Select Quarter</h3>
                <div className="flex gap-4">
                  <select
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      disabled={loading}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {quarters.map((quarter) => (
                        <option key={quarter} value={quarter}>
                          {quarter}
                        </option>
                    ))}
                  </select>
                </div>
              </Card>
          ) : (
              <Card>
                <p className="text-sm text-gray-500">No quarters available.
                  Please try again later.</p>
              </Card>
          )}

          <Card>
            <h3 className="text-lg font-semibold mb-4">Search Stocks</h3>
            <div className="flex gap-4">
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(
                      searchQuery)}
                  placeholder="Enter ticker or company name (e.g., NFLX, Netflix)"
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
                  <p className="text-sm text-gray-500 mb-2">{filteredStocks.length} stocks
                    found:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredStocks.map((stock) => (
                        <button
                            key={stock.CUSIP}
                            onClick={() => handleAutoSelectFromSearch(
                                stock.Ticker, stock.Company)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <TickerLogo ticker={stock.Ticker}/>
                            <div>
                              <p className="font-semibold text-gray-900">{stock.Ticker}</p>
                              <p className="text-sm text-gray-500">{stock.Company}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400"/>
                        </button>
                    ))}
                  </div>
                </div>
            )}

            {!searchQuery && (
                <p className="text-sm text-gray-500 mt-2">Enter a ticker or
                  company name above to search stocks</p>
            )}
          </Card>

          {isModalOpen && selectedStockData && selectedStock && (
              <StockAnalysisModal
                  stockData={{
                    ...selectedStockData,
                    HOLDERS: sortedBuyers
                  }}
                  onClose={() => setIsModalOpen(false)}
                  open={isModalOpen}
                  quarter={selectedQuarter}
                  onQuarterChange={handleQuarterChange}
                  quarters={quarters}
              />
          )}
        </div>
      </ErrorBoundary>
  )
}

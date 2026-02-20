import { useEffect, useState } from 'react'
import { getAIModels, runAIDueDiligence } from '../api/ai'
import { searchStocks, getStockHoldings } from '../api/stocks'
import { getQuarters, getLastQuarter } from '../api/analysis'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import { formatCurrency, formatPercentage, formatDate } from '../services/api'
import { Search, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'
import TickerLogo from '../components/TickerLogo'

export default function AIDueDiligence() {
  const [models, setModels] = useState([])
  const [quarters, setQuarters] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [modelsData, quartersData, lastQuarterData] = await Promise.all([
          getAIModels(),
          getQuarters(),
          getLastQuarter()
        ])

        setModels(modelsData.data || [])

        if (quartersData.data && quartersData.data.length > 0) {
          setQuarters(quartersData.data)
        }

        if (modelsData.data && modelsData.data.length > 0) {
          setSelectedModel(modelsData.data[0].ID)
        }

        if (lastQuarterData.data) {
          setSelectedQuarter(lastQuarterData.data)
        }
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleSearch(query) {
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

  async function handleSelectStock(ticker, company) {
    setSelectedStock({ ticker, company })
    setAnalysis(null)
    setSearchResults([])
  }

  async function handleGenerateAnalysis() {
    if (!selectedStock || !selectedModel || !selectedQuarter) {
      setError('Please select a stock, model, and quarter')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await runAIDueDiligence({
        ticker: selectedStock.ticker,
        quarter: selectedQuarter,
        model_id: selectedModel
      })

      if (response.data) {
        setAnalysis(response.data)
      } else {
        setError(response.error || 'Failed to generate due diligence')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI due diligence')
    } finally {
      setGenerating(false)
    }
  }

  if (loading && !selectedStock) {
    return (
      <ErrorBoundary>
        <LoadingSpinner message="Loading data..." />
      </ErrorBoundary>
    )
  }

  if (error && !selectedStock) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mr-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </ErrorBoundary>
    )
  }

  if (models.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-yellow-500 mr-4" />
          <p className="text-yellow-500">No AI models available. Please configure API keys.</p>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Due Diligence</h2>
          <p className="mt-2 text-gray-600">Run detailed AI-powered analysis on individual stocks</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Stock</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter ticker (e.g., AAPL)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {models.map((model) => (
                    <option key={model.ID} value={model.ID}>
                      {model.ID}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {quarters.map((quarter) => (
                    <option key={quarter} value={quarter}>
                      {quarter}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Select a stock to analyze:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
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
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedStock && !analysis && (
            <div className="mt-4">
              <button
                onClick={handleGenerateAnalysis}
                disabled={generating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-6 w-6" />
                {generating ? 'Running AI Analysis...' : 'Generate Analysis'}
              </button>
            </div>
          )}
        </Card>

        {generating && (
          <Card>
            <LoadingSpinner message="AI is analyzing stock fundamentals..." />
          </Card>
        )}

        {analysis && selectedStock && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">
                {selectedStock.ticker} ({selectedStock.company})
              </h3>

              <div className="mb-6">
                {analysis.current_price && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Current Price</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {formatCurrency(analysis.current_price)}
                      </p>
                    </div>
                    {analysis.investment_thesis?.price_target && (
                      <div className="flex-1 bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Target Price (3 months)</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(analysis.investment_thesis.price_target)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.investment_thesis?.overall_sentiment === 'Bullish' ? 'bg-green-100 text-green-800' :
                    analysis.investment_thesis?.overall_sentiment === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.investment_thesis?.overall_sentiment || 'Neutral'}
                  </span>
                  <p className="text-sm text-gray-600">Overall Sentiment</p>
                </div>
                {analysis.investment_thesis?.thesis && (
                  <p className="text-gray-700">{analysis.investment_thesis.thesis}</p>
                )}
              </div>

              <div className="space-y-4">
                {analysis.analysis && (
                  <>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Business Summary
                      </h4>
                      <p className="text-gray-700">{analysis.analysis.business_summary}</p>
                    </div>

                    {analysis.analysis.financial_health && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Financial Health</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-700">{analysis.analysis.financial_health}</p>
                        </div>
                        {analysis.analysis.financial_health_sentiment && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Sentiment:</span>{' '}
                            {analysis.analysis.financial_health_sentiment}
                          </p>
                        )}
                      </div>
                    )}

                    {analysis.analysis.valuation && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Valuation</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-gray-700">{analysis.analysis.valuation}</p>
                        </div>
                        {analysis.analysis.valuation_sentiment && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Sentiment:</span>{' '}
                            {analysis.analysis.valuation_sentiment}
                          </p>
                        )}
                      </div>
                    )}

                    {analysis.analysis.growth_vs_risks && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Growth vs Risks</h4>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-gray-700">{analysis.analysis.growth_vs_risks}</p>
                        </div>
                        {analysis.analysis.growth_vs_risks_sentiment && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Sentiment:</span>{' '}
                            {analysis.analysis.growth_vs_risks_sentiment}
                          </p>
                        )}
                      </div>
                    )}

                    {analysis.analysis.institutional_sentiment && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Institutional Sentiment</h4>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-gray-700">{analysis.analysis.institutional_sentiment}</p>
                        </div>
                        {analysis.analysis.institutional_sentiment_sentiment && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Sentiment:</span>{' '}
                            {analysis.analysis.institutional_sentiment_sentiment}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
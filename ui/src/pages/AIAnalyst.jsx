import { useEffect, useState } from 'react'
import { getAIModels, runAIAnalyst } from '../api/ai'
import { getQuarters, getLastQuarter } from '../api/analysis'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import { formatCurrency, formatPercentage } from '../services/api'
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react'
import TickerLogo from '../components/TickerLogo'

export default function AIAnalyst() {
  const [models, setModels] = useState([])
  const [quarters, setQuarters] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [rankedStocks, setRankedStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

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

  async function handleGenerateAnalysis() {
    if (!selectedQuarter || !selectedModel) {
      setError('Please select both a quarter and a model')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await runAIAnalyst({
        quarter: selectedQuarter,
        top_n: 30,
        model_id: selectedModel
      })

      if (response.data && response.data.scored_list) {
        setRankedStocks(response.data.scored_list)
      } else {
        setError(response.error || 'Failed to generate analysis')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI analysis')
    } finally {
      setGenerating(false)
    }
  }

  if (loading && !rankedStocks.length) {
    return (
      <ErrorBoundary>
        <LoadingSpinner message="Loading AI models..." />
      </ErrorBoundary>
    )
  }

  if (error && !rankedStocks.length) {
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
          <h2 className="text-2xl font-bold text-gray-900">AI Analyst</h2>
          <p className="mt-2 text-gray-600">Generate AI-powered ranked list of promising stocks</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quarter
              </label>
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

            <div className="flex items-end">
              <button
                onClick={handleGenerateAnalysis}
                disabled={generating}
                className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Analysis'}
              </button>
            </div>
          </div>
        </Card>

        {generating && (
          <Card>
            <LoadingSpinner message="AI is analyzing hedge fund data..." />
          </Card>
        )}

        {rankedStocks.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
              Top {rankedStocks.length} Promising Stocks
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Ranked by AI analysis based on hedge fund activity
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Promise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Volatility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Momentum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Growth
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankedStocks.map((stock, index) => (
                      <tr key={stock.ticker} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TickerLogo ticker={stock.ticker} />
                            <span className="text-sm font-bold text-gray-900">{stock.ticker}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {stock.company}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {stock.industry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(stock.promise_score, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(stock.risk_score, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(stock.low_volatility_score, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(stock.momentum_score, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(stock.growth_score, 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}
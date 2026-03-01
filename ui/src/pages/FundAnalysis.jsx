import { useEffect, useState } from 'react'
import { getAllFunds, getFundQuarters, getFundHoldings, getFundPerformance } from '../api/funds'
import { getLastQuarter } from '../api/analysis'
import { formatValue, formatPercentage, formatCurrency, formatDeltaValue, formatDeltaPercentage } from '../utils/format'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import TickerLogo from '../components/TickerLogo'

export default function FundAnalysis() {
  const [funds, setFunds] = useState([])
  const [quarters, setQuarters] = useState([])
  const [selectedFund, setSelectedFund] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [holdings, setHoldings] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [fundsData, lastQuarterData] = await Promise.all([
          getAllFunds(),
          getLastQuarter()
        ])

        setFunds(fundsData.data || [])

        if (fundsData.data && fundsData.data.length > 0) {
          setSelectedFund(fundsData.data[0].Fund)
        }

        if (lastQuarterData.data && fundsData.data && fundsData.data.length > 0) {
          setSelectedQuarter(lastQuarterData.data.quarter)
        }
      } catch (err) {
        setError(err.message || 'Failed to load funds data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    fetchFundQuarters()
  }, [selectedFund])

  async function fetchFundQuarters() {
    try {
      if (selectedFund) {
        const quartersData = await getFundQuarters(selectedFund)
        if (quartersData.data && quartersData.data.length > 0) {
          setQuarters(quartersData.data)
          const availableQuarters = quartersData.data
          if (!availableQuarters.includes(selectedQuarter)) {
            setSelectedQuarter(availableQuarters[0])
          }
        }
      }
    } catch (err) {
      console.error('Error fetching fund quarters:', err)
    }
  }

  async function fetchFundData() {
    setLoading(true)
    try {
      setError('')

      const [holdingsData, performanceData] = await Promise.all([
        getFundHoldings(selectedFund, selectedQuarter),
        getFundPerformance(selectedFund, selectedQuarter)
      ])

      setHoldings(holdingsData.data || [])
      setPerformance(performanceData.data)
      setDataLoaded(true)
    } catch (err) {
      setError(err.message || 'Failed to load fund data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <LoadingSpinner message="Loading fund data..." />
      </ErrorBoundary>
    )
  }

  if (error && !holdings.length) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </ErrorBoundary>
    )
  }

  if (funds.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No funds available</p>
        </div>
      </ErrorBoundary>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.VALUE || 0), 0)
  const numPositions = (holdings.filter(h => h.VALUE > 0)).length
  const newPositions = (holdings.filter(h => h.DELTA && h.DELTA.includes('NEW'))).length
  const closePositions = (holdings.filter(h => h.DELTA === 'CLOSE')).length

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fund Analysis</h2>
          <p className="mt-2 text-gray-600">Analyze individual hedge fund portfolios</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Fund</label>
              <select
                value={selectedFund}
                onChange={(e) => {
                  setSelectedFund(e.target.value)
                  setSelectedQuarter('')
                  setDataLoaded(false)
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {funds.map((fund) => (
                  <option key={fund.Fund} value={fund.Fund}>
                    {fund.Fund}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => {
                  setSelectedQuarter(e.target.value)
                  setDataLoaded(false)
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onClick={fetchFundData}
                disabled={!selectedFund || !selectedQuarter || loading}
                className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            </div>
          </div>
        </Card>

        {performance && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Portfolio Return</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatPercentage(performance.portfolio_return, 2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Start Value</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(performance.start_value)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Total Positions</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{numPositions}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">New Positions</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{newPositions}</p>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <LoadingSpinner message="Loading holdings..." />
        ) : (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Portfolio Holdings (sorted by %)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Portfolio %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Delta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Delta Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {holdings.sort((a, b) => (b['PORTFOLIO%'] || 0) - (a['PORTFOLIO%'] || 0)).map((holding, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TickerLogo ticker={holding.TICKER} />
                          <span className="text-sm font-medium text-gray-900">{holding.TICKER}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {holding.COMPANY}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatPercentage(parseFloat(holding['PORTFOLIO%']?.replace('%', '')) || 0, 2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(holding.VALUE)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {holding.DELTA}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(holding.DELTA_VALUE)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {holdings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No holdings found for this fund in this quarter.</p>
            )}
          </Card>
        )}

        {holdings.length >= 2 && (
          <>
            <Card>
              <h3 className="text-lg font-semibold mb-4">Top Holdings by Portfolio %</h3>
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
                        Portfolio %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holdings
                      .sort((a, b) => (b['PORTFOLIO%'] || 0) - (a['PORTFOLIO%'] || 0))
                      .slice(0, 10)
                      .map((holding, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <TickerLogo ticker={holding.TICKER} />
                              <span className="text-sm font-medium text-gray-900">{holding.TICKER}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {holding.COMPANY}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatPercentage(parseFloat(holding['PORTFOLIO%']?.replace('%', '')) || 0, 2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(holding.VALUE)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Value Increases</h3>
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
                        Delta %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Delta Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {holdings
                    .filter(h => h.DELTA_VALUE && parseFloat(h.DELTA_VALUE.replace('M', '')) > 0)
                    .sort((a, b) => parseFloat(b.DELTA_VALUE.replace('M', '')) - parseFloat(a.DELTA_VALUE.replace('M', '')))
                    .slice(0, 10)
                    .map((holding, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TickerLogo ticker={holding.TICKER} />
                            <span className="text-sm font-medium text-gray-900">{holding.TICKER}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {holding.COMPANY}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(holding.DELTA)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatValue(holding.DELTA_VALUE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(holding.VALUE)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Value Decreases</h3>
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
                        Delta %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Delta Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {holdings
                    .filter(h => h.DELTA_VALUE && parseFloat(h.DELTA_VALUE.replace('M', '')) < 0)
                    .sort((a, b) => parseFloat(a.DELTA_VALUE.replace('M', '')) - parseFloat(b.DELTA_VALUE.replace('M', '')))
                    .slice(0, 10)
                    .map((holding, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TickerLogo ticker={holding.TICKER} />
                            <span className="text-sm font-medium text-gray-900">{holding.TICKER}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {holding.COMPANY}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatPercentage(holding.DELTA)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatValue(holding.DELTA_VALUE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(holding.VALUE)}
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
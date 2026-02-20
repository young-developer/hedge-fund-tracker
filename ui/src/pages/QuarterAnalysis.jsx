import { useEffect, useState } from 'react'
import { getQuarters, getQuarterAnalysis } from '../api/analysis'
import { BarChart3, TrendingUp, AlertCircle, Users, ArrowUp, TrendingDown } from 'lucide-react'
import TickerLogo from '../components/TickerLogo'
import Table from '../components/Table'

export default function QuarterAnalysis() {
  const [quarters, setQuarters] = useState([])
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await getQuarters()
        setQuarters(data || [])
        if (data && data.length > 0) {
          setSelectedQuarter(data[0])
        }
      } catch (error) {
        console.error('Error fetching quarters:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedQuarter) {
      fetchAnalysis(selectedQuarter)
    }
  }, [selectedQuarter])

  async function fetchAnalysis(quarter) {
    setLoading(true)
    try {
      const { data } = await getQuarterAnalysis(quarter)
      setAnalysis(data)
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (quarters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="ml-4 text-gray-500">No quarters available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quarter Analysis</h2>
        <p className="mt-2 text-gray-600">Analyze hedge fund trends and stock activity</p>
      </div>

      {/* Quarter Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Quarter
        </label>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {quarters.map((quarter) => (
            <option key={quarter} value={quarter}>
              {quarter}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && analysis && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">
              {analysis.QUARTER} - Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Total Stocks</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{analysis.TOTAL_STOCKS}</p>
              </div>
            </div>
          </div>

          {/* Top Consensus Buys */}
          {analysis.TOP_BUYS && analysis.TOP_BUYS.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Top 15 Consensus Buys (by Net # of Buyers)
              </h3>
              <Table
                columns={[
                  { key: 'Ticker', header: 'Ticker' },
                  { key: 'Company', header: 'Company' },
                  { key: 'Delta', header: 'Delta' },
                  { key: 'Net_Buyers', header: 'Net_Buyers' },
                  { key: 'Buyer_Count', header: 'Buyer_Count' },
                  { key: 'Seller_Count', header: 'Seller_Count' },
                  { key: 'Holder_Count', header: 'Holder_Count' },
                  { key: 'Total_Delta_Value', header: 'Total_Delta_Value' }
                ]}
                data={analysis.TOP_BUYS}
              />
            </div>
          )}

          {/* Top New Consensus */}
          {analysis.TOP_NEW_CONSENSUS && analysis.TOP_NEW_CONSENSUS.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Top 15 New Consensus (by # of New Holders)
              </h3>
              <Table
                columns={[
                  { key: 'Ticker', header: 'Ticker' },
                  { key: 'Company', header: 'Company' },
                  { key: 'New_Holder_Count', header: 'New_Holder_Count' },
                  { key: 'Net_Buyers', header: 'Net_Buyers' },
                  { key: 'Holder_Count', header: 'Holder_Count' },
                  { key: 'Delta', header: 'Delta' },
                  { key: 'Total_Delta_Value', header: 'Total_Delta_Value' },
                  { key: 'Total_Value', header: 'Total_Value' }
                ]}
                data={analysis.TOP_NEW_CONSENSUS}
              />
            </div>
          )}

          {/* Top Increasing Positions */}
          {analysis.TOP_INCREASING_POSITIONS && analysis.TOP_INCREASING_POSITIONS.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ArrowUp className="mr-2 h-5 w-5 text-purple-600" />
                Top 15 Increasing Positions (by Delta)
              </h3>
              <Table
                columns={[
                  { key: 'Ticker', header: 'Ticker' },
                  { key: 'Company', header: 'Company' },
                  { key: 'New_Holder_Count', header: 'New_Holder_Count' },
                  { key: 'Net_Buyers', header: 'Net_Buyers' },
                  { key: 'Holder_Count', header: 'Holder_Count' },
                  { key: 'Delta', header: 'Delta' },
                  { key: 'Total_Delta_Value', header: 'Total_Delta_Value' },
                  { key: 'Total_Value', header: 'Total_Value' }
                ]}
                data={analysis.TOP_INCREASING_POSITIONS}
              />
            </div>
          )}

          {/* Top Big Bets */}
          {analysis.TOP_BETS && analysis.TOP_BETS.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-red-600" />
                Top 15 Big Bets (by Max Portfolio %)
              </h3>
              <Table
                columns={[
                  { key: 'Ticker', header: 'Ticker' },
                  { key: 'Company', header: 'Company' },
                  { key: 'Max_Portfolio_Pct', header: 'Max_Portfolio_Pct' },
                  { key: 'Avg_Portfolio_Pct', header: 'Avg_Portfolio_Pct' },
                  { key: 'Delta', header: 'Delta' },
                  { key: 'Total_Delta_Value', header: 'Total_Delta_Value' },
                  { key: 'Total_Value', header: 'Total_Value' }
                ]}
                data={analysis.TOP_BETS}
              />
            </div>
          )}

          {/* Average Portfolio */}
          {analysis.AVERAGE_PORTFOLIO && analysis.AVERAGE_PORTFOLIO.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-yellow-600" />
                Average 15 Stocks Portfolio
              </h3>
              <Table
                columns={[
                  { key: 'Ticker', header: 'Ticker' },
                  { key: 'Company', header: 'Company' },
                  { key: 'Avg_Portfolio_Pct', header: 'Avg_Portfolio_Pct' },
                  { key: 'Max_Portfolio_Pct', header: 'Max_Portfolio_Pct' },
                  { key: 'Holder_Count', header: 'Holder_Count' },
                  { key: 'Delta', header: 'Delta' }
                ]}
                data={analysis.AVERAGE_PORTFOLIO}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

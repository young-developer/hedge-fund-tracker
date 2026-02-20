import { useEffect, useState } from 'react'
import { getQuarters } from '../api/analysis'
import { getRecentFilings as getFilings } from '../api/filings'
import { TrendingUp, FileText, Clock } from 'lucide-react'
import TickerLogo from '../components/TickerLogo'

export default function Home() {
  const [quarters, setQuarters] = useState([])
  const [filings, setFilings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [quartersData, filingsData] = await Promise.all([
          getQuarters(),
          getFilings(30),
        ])
        setQuarters(quartersData.data || [])
        setFilings(filingsData.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Available Quarters</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{quarters.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Recent Filings</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{filings.total_filings || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {quarters[0] || 'N/A'}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <a
            href="/filings"
            className="block p-3 sm:p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <h3 className="font-semibold text-red-900 text-sm sm:text-base">Non-Quarterly Filings</h3>
            <p className="text-xs sm:text-sm text-red-700 mt-1">View latest 13D/G, Form 4 filings</p>
          </a>
          <a
            href="/quarters"
            className="block p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Market Trends</h3>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">Analyze hedge-fund stock trends</p>
          </a>
          <a
            href="/funds"
            className="block p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h3 className="font-semibold text-green-900 text-sm sm:text-base">Fund Analysis</h3>
            <p className="text-xs sm:text-sm text-green-700 mt-1">Analyze specific fund portfolios</p>
          </a>
          <a
            href="/stocks"
            className="block p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Stock Activity</h3>
            <p className="text-xs sm:text-sm text-purple-700 mt-1">Analyze specific stock activity</p>
          </a>
          <a
            href="/funds"
            className="block p-3 sm:p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <h3 className="font-semibold text-yellow-900 text-sm sm:text-base">Performance</h3>
            <p className="text-xs sm:text-sm text-yellow-700 mt-1">Evaluate fund performance</p>
          </a>
          <a
            href="/ai-analyst"
            className="block p-3 sm:p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <h3 className="font-semibold text-indigo-900 text-sm sm:text-base">AI Analyst</h3>
            <p className="text-xs sm:text-sm text-indigo-700 mt-1">Find most promising stocks</p>
          </a>
          <a
            href="/ai-due-diligence"
            className="block p-3 sm:p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <h3 className="font-semibold text-pink-900 text-sm sm:text-base">AI Due Diligence</h3>
            <p className="text-xs sm:text-sm text-pink-700 mt-1">Run AI analysis on stocks</p>
          </a>
        </div>
      </div>

      {/* Recent Filings */}
      {filings.recent_filings && filings.recent_filings.length > 0 && (
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Non-Quarterly Filings</h2>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fund
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Ticker
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filings.recent_filings.slice(0, 10).map((filing) => (
                  <tr key={filing.TICKER}>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(filing.DATE).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {filing.FUND}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <TickerLogo ticker={filing.TICKER} />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{filing.TICKER}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {filing.COMPANY}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {filing.DELTA}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 sm:mt-4 text-center">
            <a
              href="/filings"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
            >
              View all filings →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

import {useEffect, useState} from 'react'
import {getQuarters} from '../api/analysis'
import {getRecentFilings as getFilings} from '../api/filings'
import {getAIAnalystReportsByQuarter, getAIAnalystReport} from '../api/ai'
import {TrendingUp, FileText, Clock, Brain} from 'lucide-react'
import {Select} from 'antd'
import TickerLogo from '../components/TickerLogo'
import AIReportTile from '../components/AIReportTile'
import LoadingSpinner from '../components/LoadingSpinner'
import {getTileColor} from '../utils/score-colors'
import {formatTimestamp} from '../utils/format'

export default function Home() {
  const [quarters, setQuarters] = useState([])
  const [filings, setFilings] = useState([])
  const [aiReports, setAiReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [aiReport, setAiReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)

  async function loadReportData(reportId) {
    if (!reportId) return

    setReportLoading(true)
    try {
      console.log('Fetching report data for:', reportId)
      const fullReport = await getAIAnalystReport(reportId)
      console.log('Full report response:', fullReport)
      if (fullReport && fullReport.data) {
        console.log('Top stocks count:', fullReport.data.top_stocks?.length || 0)
        setAiReport(fullReport.data)
        console.log('Report data set successfully')
        console.log('New report data:', fullReport.data)
      }
    } catch (error) {
      console.error('Error fetching full report:', error)
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setLoading(true)

        const [quartersData, filingsData] = await Promise.all([
          getQuarters(),
          getFilings(30),
        ])

        if (!isMounted) {
          return
        }

        setQuarters(quartersData.data || [])
        setFilings(filingsData.data || [])

        // Get latest quarter
        const latestQuarter = quartersData.data?.[0] || null
        if (latestQuarter) {
          const quarterReports = await getAIAnalystReportsByQuarter(
              latestQuarter)

          if (!isMounted) {
            return
          }

          setAiReports(quarterReports.data || [])

          // Set the latest report as default
          if (quarterReports.data && quarterReports.data.length > 0) {
            await loadReportData(quarterReports.data[0].report_id)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
        <LoadingSpinner message="Loading dashboard..."/>
    )
  }

  return (
      <div className="space-y-6 sm:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Available
                  Quarters</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{quarters.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Recent
                  Filings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{filings.total_filings
                    || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Last
                  Updated</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {quarters[0] || 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600"/>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analyst Report */}
        {aiReport && aiReport.top_stocks && aiReport.top_stocks.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600"/>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold">Latest AI
                    Analyst Report</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {aiReport.metadata?.quarter
                        || 'N/A'} • {aiReport.metadata?.model_id || 'N/A'} •
                    {aiReport.metadata?.generated_at
                        ? formatTimestamp(aiReport.metadata.generated_at)
                        : 'N/A'}
                  </p>
                </div>
                  {aiReports.length > 1 && !loading && (
                    <>
                      <Select
                        value={selectedReport?.report_id || undefined}
                        onChange={async (reportId) => {
                          const report = aiReports.find(r => r.report_id === reportId)
                          if (report) {
                            setSelectedReport(report)
                            console.log('Selecting report:', reportId)
                            console.log('Report details:', report)
                            await loadReportData(reportId)
                          }
                        }}
                        className="w-64"
                        size="small"
                        loading={reportLoading}
                        options={aiReports
                          .filter(report => report)
                          .map(report => ({
                            value: report.report_id,
                            label: `${report.model_id} ${formatTimestamp(report.generated_at)}`
                          }))}
                        placeholder="Select report"
                      />
                    </>
                  )}
              </div>

              <div
                  className="mb-2 sm:mb-3 flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Green: High Promise, Low Risk
            </span>
                <span
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              Yellow: Medium Risk
            </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
              Red: Low Promise, High Risk
            </span>
              </div>

              <div
                  className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {aiReport?.top_stocks?.length > 0 && aiReport.top_stocks
                .sort((a, b) => {
                  const colorPriority = {green: 0, yellow: 1, red: 2}
                  const aColor = getTileColor(a.promise_score, a.risk_score)
                  const bColor = getTileColor(b.promise_score, b.risk_score)

                  if (colorPriority[aColor] !== colorPriority[bColor]) {
                    return colorPriority[aColor] - colorPriority[bColor]
                  }

                  return b.promise_score - a.promise_score
                })
                .map((stock) => (
                    <AIReportTile key={stock.ticker} stock={stock}/>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 text-center">
                <a
                    href="/ai-analyst"
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm sm:text-base"
                >
                  View full AI Analyst analysis →
                </a>
              </div>
            </div>
        )}

        {/* Recent Filings */}
        {filings.recent_filings && filings.recent_filings.length > 0 && (
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent
                Non-Quarterly Filings</h2>
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
                            <TickerLogo ticker={filing.TICKER}/>
                            <span
                                className="text-xs sm:text-sm font-medium text-gray-900">{filing.TICKER}</span>
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

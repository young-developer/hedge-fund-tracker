import { useState, useEffect, useMemo } from 'react'
import { Select, Badge, Empty, Spin } from 'antd'
import { BarChart3, FileCheck } from 'lucide-react'
import { getAIReports } from '../../../api/ai'
import TickerLogo from '../../../components/TickerLogo'
import api from '../../../services/api'

const { Option } = Select

export default function AIReports() {
  const [aiReports, setAiReports] = useState({ analyst: [], dueDiligence: [] })
  const [aiReportsLoading, setAiReportsLoading] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('all')
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    const loadAiReports = async () => {
      setAiReportsLoading(true)
      try {
        const response = await getAIReports()
        setAiReports(response)
      } catch (error) {
        console.error('Error loading AI reports:', error)
      } finally {
        setAiReportsLoading(false)
      }
    }

    loadAiReports()
  }, [])

  const uniqueReportQuarters = useMemo(() => {
    const quarters = new Set()
    const allReports = [
      ...aiReports.analyst.map(r => ({ ...r, type: 'analyst' })),
      ...aiReports.dueDiligence.map(r => ({ ...r, type: 'dueDiligence' }))
    ]
    allReports.forEach(report => {
      quarters.add(report.quarter)
    })
    return Array.from(quarters).sort().reverse()
  }, [aiReports])

  const filteredReports = useMemo(() => {
    const allReports = [
      ...aiReports.analyst.map(r => ({ ...r, type: 'analyst' })),
      ...aiReports.dueDiligence.map(r => ({ ...r, type: 'dueDiligence' }))
    ]

    return allReports.filter(report => {
      const typeMatch = selectedReportType === 'all' || report.type === selectedReportType
      const quarterMatch = selectedQuarterFilter === 'all' || report.quarter === selectedQuarterFilter
      return typeMatch && quarterMatch
    })
  }, [aiReports, selectedReportType, selectedQuarterFilter])

  const groupedReportsByQuarter = useMemo(() => {
    return filteredReports.reduce((groups, report) => {
      const quarter = report.quarter
      if (!groups[quarter]) {
        groups[quarter] = []
      }
      groups[quarter].push(report)
      return groups
    }, {})
  }, [filteredReports])

  const getReportIcon = (type) => {
    return type === 'analyst' ? <BarChart3 className="h-4 w-4 text-purple-600" /> : <FileCheck className="h-4 w-4 text-blue-600" />
  }

  const getReportTypeLabel = (type) => {
    return type === 'analyst' ? 'AI Analyst' : 'Due Diligence'
  }

  const getReportTypeBadgeColor = (type) => {
    return type === 'analyst' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      {aiReportsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">All AI Reports</h3>
              <p className="text-sm text-gray-500">
                {filteredReports.length} reports found
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select
                value={selectedReportType}
                onChange={setSelectedReportType}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">All Types</Option>
                <Option value="analyst">AI Analyst</Option>
                <Option value="dueDiligence">Due Diligence</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
              <Select
                value={selectedQuarterFilter}
                onChange={setSelectedQuarterFilter}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">All Quarters</Option>
                {uniqueReportQuarters.map((quarter) => (
                  <Option key={quarter} value={quarter}>
                    {quarter}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedReportsByQuarter).map(([quarter, quarterReports]) => (
              <div key={quarter}>
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide px-1">
                  {quarter}
                </div>
                <div className="space-y-2">
                  {quarterReports.map((report) => (
                    <div
                      key={`${report.report_id}-${report.type}`}
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedReport?.report_id === report.report_id && selectedReport?.type === report.type
                          ? 'bg-purple-50 border-purple-300'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getReportIcon(report.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getReportTypeBadgeColor(report.type)}`}>
                                {getReportTypeLabel(report.type)}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {report.type === 'analyst' ? 'Top Stocks Analysis' : `${report.ticker} Analysis`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {report.model_id} • {new Date(report.generated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          count={report.type === 'analyst' ? report.top_stocks?.length : 1}
                          showZero
                          className="bg-gray-100 text-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedReport && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedReport.type === 'analyst' ? 'AI Analyst Report Preview' : 'Due Diligence Report Preview'}
                </h4>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close Preview
                </button>
              </div>

              {selectedReport.type === 'analyst' && selectedReport.top_stocks ? (
                <div>
                  <table
                    className="w-full"
                    style={{ fontSize: '12px' }}
                  >
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Rank</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Ticker</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium hidden md:table-cell">Company</th>
                        <th className="px-3 py-2 text-right text-gray-700 font-medium w-[90px]">Promise</th>
                        <th className="px-3 py-2 text-right text-gray-700 font-medium w-[90px]">Risk</th>
                        <th className="px-3 py-2 text-right text-gray-700 font-medium w-[90px]">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.top_stocks.map((stock, index) => (
                        <tr key={stock.ticker} className="border-t">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <TickerLogo ticker={stock.ticker} />
                              <span className="font-semibold text-gray-900">{stock.ticker}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden md:table-cell">{stock.company}</td>
                          <td className="px-3 py-2 text-right">{stock.promise_score ? stock.promise_score.toFixed(2) : 'N/A'}</td>
                          <td className="px-3 py-2 text-right">{stock.risk_score ? stock.risk_score.toFixed(2) : 'N/A'}</td>
                          <td className="px-3 py-2 text-right">{stock.growth_score ? stock.growth_score.toFixed(2) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedReport.type === 'dueDiligence' && selectedReport.stock_analysis ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Current Price</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {api.defaults.baseURL ? '$' : ''}
                        {selectedReport.stock_analysis.current_price ? selectedReport.stock_analysis.current_price.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    {selectedReport.stock_analysis.investment_thesis?.price_target && (
                      <div className="flex-1 bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Target Price</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          ${selectedReport.stock_analysis.investment_thesis.price_target.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedReport.stock_analysis.investment_thesis?.overall_sentiment === 'Bullish' ? 'bg-green-100 text-green-800' :
                      selectedReport.stock_analysis.investment_thesis?.overall_sentiment === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedReport.stock_analysis.investment_thesis?.overall_sentiment || 'Neutral'}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">Overall Sentiment</p>
                  </div>

                  {selectedReport.stock_analysis.analysis?.business_summary && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-purple-600" />
                        Business Summary
                      </h4>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {selectedReport.stock_analysis.analysis.business_summary}
                      </p>
                    </div>
                  )}

                  {selectedReport.stock_analysis.analysis?.financial_health && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Financial Health</h4>
                      <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg">
                        {selectedReport.stock_analysis.analysis.financial_health}
                      </p>
                    </div>
                  )}

                  {selectedReport.stock_analysis.analysis?.valuation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Valuation</h4>
                      <p className="text-gray-700 text-sm bg-green-50 p-3 rounded-lg">
                        {selectedReport.stock_analysis.analysis.valuation}
                      </p>
                    </div>
                  )}

                  {selectedReport.stock_analysis.analysis?.growth_vs_risks && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Growth vs Risks</h4>
                      <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded-lg">
                        {selectedReport.stock_analysis.analysis.growth_vs_risks}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="No report data available" />
              )}
            </div>
          )}
        </div>
      ) : (
        <Empty description="No AI reports found" />
      )}
    </div>
  )
}

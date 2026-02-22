import {useState, useEffect, useMemo} from 'react'
import {Select, Badge, Empty, Spin, Modal, Button} from 'antd'
import {BarChart3, FileCheck, Trash2, AlertTriangle} from 'lucide-react'
import {
  getAIReports,
  getAIAnalystReport,
  getAIDueDiligenceReport,
  deleteAIReport
} from '../../../api/ai'
import TickerLogo from '../../../components/TickerLogo'
import api from '../../../services/api'

const {Option} = Select

export default function AIReports() {
  const [aiReports, setAiReports] = useState({analyst: [], dueDiligence: []})
  const [aiReportsLoading, setAiReportsLoading] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('all')
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [latestQuarter, setLatestQuarter] = useState('all')
  const [reportData, setReportData] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [error, setError] = useState('')
  const [deletingReport, setDeletingReport] = useState(null)

  const loadAiReports = async () => {
    setAiReportsLoading(true)
    try {
      const response = await getAIReports()
      setAiReports(response)

      const quarters = new Set()
      const allReports = [
        ...response.analyst.map(r => ({ ...r, type: 'analyst' })),
        ...response.dueDiligence.map(r => ({ ...r, type: 'dueDiligence' }))
      ]
      allReports.forEach(report => {
        quarters.add(report.quarter)
      })
      const sortedQuarters = Array.from(quarters).sort().reverse()
      setLatestQuarter(sortedQuarters[0] || 'all')
      setSelectedQuarterFilter(sortedQuarters[0] || 'all')
    } catch (error) {
      console.error('Error loading AI reports:', error)
    } finally {
      setAiReportsLoading(false)
    }
  }

  useEffect(() => {
    loadAiReports()
  }, [])

  const uniqueReportQuarters = useMemo(() => {
    const quarters = new Set()
    const allReports = [
      ...aiReports.analyst.map(r => ({...r, type: 'analyst'})),
      ...aiReports.dueDiligence.map(r => ({...r, type: 'dueDiligence'}))
    ]
    allReports.forEach(report => {
      quarters.add(report.quarter)
    })
    return Array.from(quarters).sort().reverse()
  }, [aiReports])

  const filteredReports = useMemo(() => {
    const allReports = [
      ...aiReports.analyst.map(r => ({...r, type: 'analyst'})),
      ...aiReports.dueDiligence.map(r => ({...r, type: 'dueDiligence'}))
    ]

    return allReports.filter(report => {
      const typeMatch = selectedReportType === 'all' || report.type
          === selectedReportType
      const quarterMatch = selectedQuarterFilter === 'all' || report.quarter
          === selectedQuarterFilter
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

  const sortedGroupedReports = useMemo(() => {
    return Object.entries(groupedReportsByQuarter)
      .sort(([, reportsA], [, reportsB]) => {
        return uniqueReportQuarters.indexOf(reportsA[0]) - uniqueReportQuarters.indexOf(reportsB[0])
      })
  }, [groupedReportsByQuarter, uniqueReportQuarters])

  const getReportIcon = (type) => {
    return type === 'analyst' ? <BarChart3 className="h-4 w-4 text-purple-600"/>
        : <FileCheck className="h-4 w-4 text-blue-600"/>
  }

  const getReportTypeLabel = (type) => {
    return type === 'analyst' ? 'AI Analyst' : 'Due Diligence'
  }

  const getReportTypeBadgeColor = (type) => {
    return type === 'analyst' ? 'bg-purple-100 text-purple-800'
        : 'bg-blue-100 text-blue-800'
  }

  async function handleLoadReport(report) {
    try {
      setLoadingReport(true)
      setError('')
      setSelectedReport(report)

      if (report.type === 'analyst') {
        const response = await getAIAnalystReport(report.report_id)
        if (response.data && response.data.top_stocks) {
          setReportData(response.data)
        } else {
          setError(response.error || 'Failed to load report')
        }
      } else {
        const response = await getAIDueDiligenceReport(report.report_id)
        if (response.data && response.data.stock_analysis) {
          setReportData(response.data)
        } else {
          setError(response.error || 'Failed to load report')
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load report')
    } finally {
      setLoadingReport(false)
    }
  }

  async function handleDeleteReport(report) {
    try {
      setDeletingReport(report.report_id)
      
      Modal.confirm({
        title: 'Delete AI Report',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
        content: (
          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{report.type}</span>
              </div>
              {report.type === 'analyst' ? (
                <>
                  <div className="flex justify-between">
                    <span>Quarter:</span>
                    <span className="font-medium">{report.quarter}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Ticker:</span>
                    <span className="font-medium">{report.ticker}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="font-medium">{report.model_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Generated:</span>
                <span className="font-medium">
                  {new Date(report.generated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ),
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            const response = await deleteAIReport(report.type, report.report_id)
            if (response.success) {
              Modal.success({
                title: 'Report Deleted',
                content: response.message,
                okText: 'OK',
              })
              loadAiReports()
            } else {
              Modal.error({
                title: 'Delete Failed',
                content: response.error || 'Failed to delete report',
                okText: 'OK',
              })
            }
          } catch (err) {
            Modal.error({
              title: 'Delete Failed',
              content: err.message || 'Failed to delete report',
              okText: 'OK',
            })
          } finally {
            setDeletingReport(null)
          }
        },
        onCancel: () => {
          setDeletingReport(null)
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to initiate deletion')
      setDeletingReport(null)
    }
  }

  return (
      <div className="space-y-6">
        {aiReportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large"/>
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
                  <label
                      className="block text-sm font-medium text-gray-700 mb-2">Report
                    Type</label>
                  <Select
                      value={selectedReportType}
                      onChange={setSelectedReportType}
                      style={{width: '100%'}}
                      size="small"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="analyst">AI Analyst</Option>
                    <Option value="dueDiligence">Due Diligence</Option>
                  </Select>
                </div>
                <div>
                  <label
                      className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                  <Select
                      value={selectedQuarterFilter}
                      onChange={setSelectedQuarterFilter}
                      style={{width: '100%'}}
                      size="small"
                  >
                    <Option value="all">All Quarters</Option>
                    {uniqueReportQuarters.map((quarter) => (
                        <Option key={quarter} value={quarter}>
                          {quarter}
                        </Option>
                    ))}
                  </Select>
                  {latestQuarter && latestQuarter !== 'all' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Showing latest: {latestQuarter}
                      </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {sortedGroupedReports.map(([quarter, quarterReports]) => (
                    <div key={quarter}>
                      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide px-1">
                        {quarter}
                      </div>
                          <div className="space-y-2">
                             {quarterReports.map((report) => (
                                 <div
                                     key={`${report.report_id}-${report.type}`}
                                     className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                         selectedReport?.report_id
                                         === report.report_id
                                         && selectedReport?.type === report.type
                                             ? 'bg-purple-50 border-purple-300'
                                             : 'border-gray-200'
                                     }`}
                                     onClick={() => handleLoadReport(report)}
                                 >
                                   <div
                                       className="flex items-start justify-between">
                                     <div className="flex items-start gap-3">
                                       {getReportIcon(report.type)}
                                       <div>
                                         <div
                                             className="flex items-center gap-2">
                               <span
                                   className={`text-xs px-2 py-0.5 rounded-full font-medium ${getReportTypeBadgeColor(
                                       report.type)}`}>
                                 {getReportTypeLabel(report.type)}
                               </span>
                                           <span
                                               className="text-sm font-medium text-gray-900">
                                 {report.type === 'analyst'
                                     ? 'Top Stocks Analysis'
                                     : `${report.ticker} Analysis`}
                               </span>
                                         </div>
                                         <p className="text-xs text-gray-500 mt-1">
                                           {report.model_id} • {new Date(
                                             report.generated_at).toLocaleDateString()}
                                         </p>
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Badge
                                           count={report.type === 'analyst'
                                               ? report.top_stocks?.length : 1}
                                           showZero
                                           className="bg-gray-100 text-gray-600"
                                       />
                                       <Button
                                           type="text"
                                           danger
                                           size="small"
                                           icon={<Trash2 className="h-4 w-4" />}
                                           onClick={(e) => {
                                             e.stopPropagation()
                                             handleDeleteReport(report)
                                           }}
                                           disabled={deletingReport === report.report_id}
                                           title="Delete Report"
                                       />
                                     </div>
                                   </div>
                                 </div>
                             ))}
                          </div>
                        </div>
                    ))}
              </div>

              <Modal
                  open={selectedReport !== null}
                  onCancel={() => setSelectedReport(null)}
                  width={900}
                  footer={null}
                  title={
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedReport?.type === 'analyst'
                            ? 'AI Analyst Report' : 'Due Diligence Report'}
                      </h4>
                    </div>
                  }
              >
                {loadingReport ? (
                    <div className="flex items-center justify-center py-8">
                      <Spin size="large"/>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">
                      {error}
                    </div>
                ) : selectedReport?.type === 'analyst' && reportData?.top_stocks
                    ? (
                        <div>
                          <table
                              className="w-full"
                              style={{fontSize: '12px'}}
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
                            {reportData.top_stocks.map((stock, index) => (
                                <tr key={stock.ticker} className="border-t">
                                  <td className="px-3 py-2">{index + 1}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <TickerLogo ticker={stock.ticker}/>
                                      <span
                                          className="font-semibold text-gray-900">{stock.ticker}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 hidden md:table-cell">{stock.company}</td>
                                  <td className="px-3 py-2 text-right">{stock.promise_score
                                      ? stock.promise_score.toFixed(2)
                                      : 'N/A'}</td>
                                  <td className="px-3 py-2 text-right">{stock.risk_score
                                      ? stock.risk_score.toFixed(2)
                                      : 'N/A'}</td>
                                  <td className="px-3 py-2 text-right">{stock.growth_score
                                      ? stock.growth_score.toFixed(2)
                                      : 'N/A'}</td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                    ) : selectedReport?.type === 'dueDiligence'
                    && reportData?.stock_analysis ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-blue-700">Current
                                Price</p>
                              <p className="text-2xl font-bold text-blue-900 mt-1">
                                {api.defaults.baseURL ? '$' : ''}
                                {reportData.stock_analysis.current_price
                                    ? reportData.stock_analysis.current_price.toFixed(
                                        2) : 'N/A'}
                              </p>
                            </div>
                            {reportData.stock_analysis.investment_thesis?.price_target
                                && (
                                    <div
                                        className="flex-1 bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-green-700">Target
                                        Price</p>
                                      <p className="text-2xl font-bold text-green-900 mt-1">
                                        ${reportData.stock_analysis.investment_thesis.price_target.toFixed(
                                          2)}
                                      </p>
                                    </div>
                                )}
                          </div>

                          <div>
                  <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                          reportData.stock_analysis.investment_thesis?.overall_sentiment
                          === 'Bullish' ? 'bg-green-100 text-green-800' :
                              reportData.stock_analysis.investment_thesis?.overall_sentiment
                              === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                      }`}>
                    {reportData.stock_analysis.investment_thesis?.overall_sentiment
                        || 'Neutral'}
                  </span>
                            <p className="text-sm text-gray-600 mt-2">Overall
                              Sentiment</p>
                          </div>

                          {reportData.stock_analysis.analysis?.business_summary
                              && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                      <FileCheck
                                          className="h-4 w-4 text-purple-600"/>
                                      Business Summary
                                    </h4>
                                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                                      {reportData.stock_analysis.analysis.business_summary}
                                    </p>
                                  </div>
                              )}

                          {reportData.stock_analysis.analysis?.financial_health
                              && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Financial
                                      Health</h4>
                                    <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg">
                                      {reportData.stock_analysis.analysis.financial_health}
                                    </p>
                                  </div>
                              )}

                          {reportData.stock_analysis.analysis?.valuation && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Valuation</h4>
                                <p className="text-gray-700 text-sm bg-green-50 p-3 rounded-lg">
                                  {reportData.stock_analysis.analysis.valuation}
                                </p>
                              </div>
                          )}

                          {reportData.stock_analysis.analysis?.growth_vs_risks
                              && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Growth
                                      vs Risks</h4>
                                    <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded-lg">
                                      {reportData.stock_analysis.analysis.growth_vs_risks}
                                    </p>
                                  </div>
                              )}
                        </div>
                    ) : (
                        <Empty description="No report data available"/>
                    )}
              </Modal>
            </div>
        ) : (
            <Empty description="No AI reports found"/>
        )}
      </div>
  )
}

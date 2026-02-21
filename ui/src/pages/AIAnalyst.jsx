 import { useEffect, useState, useMemo } from 'react'
 import { getAIModels, runAIAnalyst, getAIAnalystReports, getAIAnalystReport } from '../api/ai'
 import { getQuarters, getLastQuarter } from '../api/analysis'
 import Card from '../components/Card'
 import LoadingSpinner from '../components/LoadingSpinner'
 import ErrorBoundary from '../components/ErrorBoundary'
 import { formatCurrency, formatPercentage } from '../services/api'
 import { TrendingUp, Sparkles, AlertCircle, Clock, FileText, Trash2, CheckCircle } from 'lucide-react'
 import TickerLogo from '../components/TickerLogo'
 import { Table } from 'antd'

const STORAGE_KEY = 'ai-analyst-selected-model'

const saveSelectedModel = (modelId) => {
  localStorage.setItem(STORAGE_KEY, modelId)
}

const loadSelectedModel = () => {
  const savedModel = localStorage.getItem(STORAGE_KEY)
  return savedModel
}

export default function AIAnalyst() {
  const [models, setModels] = useState([])
  const [quarters, setQuarters] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [rankedStocks, setRankedStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
   const [reports, setReports] = useState([])
   const [loadingReports, setLoadingReports] = useState(false)
   const [selectedReport, setSelectedReport] = useState(null)
   const [selectedQuarterFilter, setSelectedQuarterFilter] = useState('all')

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
          const savedModel = loadSelectedModel()
          const defaultModel = modelsData.data[0].ID
          setSelectedModel(savedModel || defaultModel)
        }

        if (lastQuarterData.data && lastQuarterData.data.quarter) {
          setSelectedQuarter(lastQuarterData.data.quarter)
        }
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedModel) {
      saveSelectedModel(selectedModel)
    }
  }, [selectedModel])

   useEffect(() => {
     async function fetchReports() {
       try {
         setLoadingReports(true)
         setError('')
         const response = await getAIAnalystReports()
         if (response.data && response.data.length > 0) {
           setReports(response.data)
         }
       } catch (err) {
         setError(err.message || 'Failed to load reports')
       } finally {
         setLoadingReports(false)
       }
     }

     fetchReports()
   }, [])

   const uniqueQuarters = useMemo(() => {
     return [...new Set(reports.map(report => report.quarter))].sort().reverse()
   }, [reports])

   const filteredReportsByQuarter = useMemo(() => {
     if (selectedQuarterFilter === 'all') {
       return reports
     }
     return reports.filter(report => report.quarter === selectedQuarterFilter)
   }, [reports, selectedQuarterFilter])

    const groupedReports = useMemo(() => {
      return filteredReportsByQuarter.reduce((groups, report) => {
        const quarter = report.quarter
        if (!groups[quarter]) {
          groups[quarter] = []
        }
        groups[quarter].push(report)
        return groups
      }, {})
    }, [filteredReportsByQuarter])

    const sortedGroupedReports = useMemo(() => {
      return Object.entries(groupedReports)
        .sort(([, reportsA], [, reportsB]) => {
          return uniqueQuarters.indexOf(reportsA[0]) - uniqueQuarters.indexOf(reportsB[0])
        })
    }, [groupedReports, uniqueQuarters])

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

      if (response.data) {
        setRankedStocks(response.data)
      } else {
        setError(response.error || 'Failed to generate analysis')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI analysis')
    } finally {
      setGenerating(false)
    }
  }

  async function handleLoadReport(report) {
    try {
      setLoading(true)
      setError('')
      setSelectedReport(report)

      const response = await getAIAnalystReport(report.report_id)
      if (response.data && response.data.top_stocks) {
        setRankedStocks(response.data.top_stocks)
      } else {
        setError(response.error || 'Failed to load report')
      }
    } catch (err) {
      setError(err.message || 'Failed to load report')
    } finally {
      setLoading(false)
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

  if (loadingReports && !reports.length) {
    return (
      <ErrorBoundary>
        <LoadingSpinner message="Loading reports..." />
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

         {reports.length > 0 && (
           <Card>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold flex items-center">
                 <FileText className="mr-2 h-5 w-5 text-purple-600" />
                 Previous Reports
               </h3>
               <span className="text-sm text-gray-500">{reports.length} reports</span>
             </div>
             <div className="mb-4">
               <select
                 value={selectedQuarterFilter}
                 onChange={(e) => setSelectedQuarterFilter(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
               >
                 <option value="all">All Quarters</option>
                 {uniqueQuarters.map((quarter) => (
                   <option key={quarter} value={quarter}>
                     {quarter}
                   </option>
                 ))}
               </select>
             </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sortedGroupedReports.map(([quarter, quarterReports]) => (
                  <div key={quarter}>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide px-1">
                      {quarter}
                    </div>
                   {quarterReports.map((report) => (
                     <div
                       key={report.report_id}
                       className={`border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                         selectedReport?.report_id === report.report_id ? 'bg-purple-50 border-purple-300' : 'border-gray-200'
                       }`}
                       onClick={() => handleLoadReport(report)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Clock className="h-4 w-4 text-gray-400" />
                           <div>
                             <p className="text-sm font-medium text-gray-900">{report.quarter}</p>
                             <p className="text-xs text-gray-500">{report.model_id}</p>
                           </div>
                         </div>
                         <span className="text-xs text-gray-400">
                           {new Date(report.generated_at).toLocaleString()}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               ))}
             </div>
           </Card>
         )}

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                Top {rankedStocks.length} Promising Stocks
              </h3>
              {selectedReport && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Report saved</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Ranked by AI analysis based on hedge fund activity
            </p>
            <Table
              columns={[
                {
                  title: 'Rank',
                  dataIndex: 'rank',
                  key: 'rank',
                  width: 80,
                  fixed: 'left',
                  render: (text, record, index) => index + 1
                },
                {
                  title: 'Ticker',
                  dataIndex: 'ticker',
                  key: 'ticker',
                  width: 120,
                  fixed: 'left',
                  render: (ticker, record) => (
                    <div className="flex items-center gap-2">
                      <TickerLogo ticker={ticker} />
                      <span className="text-sm font-bold text-gray-900">{ticker}</span>
                    </div>
                  )
                },
                {
                  title: 'Company',
                  dataIndex: 'company',
                  key: 'company',
                  width: 200
                },
                {
                  title: 'Industry',
                  dataIndex: 'industry',
                  key: 'industry',
                  width: 150
                },
                {
                  title: 'Promise',
                  dataIndex: 'promise_score',
                  key: 'promise_score',
                  width: 100,
                  sorter: (a, b) => a.promise_score - b.promise_score,
                  render: (value) => typeof value === 'number' ? value.toFixed(2) : value
                },
                {
                  title: 'Risk',
                  dataIndex: 'risk_score',
                  key: 'risk_score',
                  width: 100,
                  sorter: (a, b) => a.risk_score - b.risk_score
                },
                {
                  title: 'Volatility',
                  dataIndex: 'low_volatility_score',
                  key: 'low_volatility_score',
                  width: 100,
                  sorter: (a, b) => a.low_volatility_score - b.low_volatility_score
                },
                {
                  title: 'Momentum',
                  dataIndex: 'momentum_score',
                  key: 'momentum_score',
                  width: 100,
                  sorter: (a, b) => a.momentum_score - b.momentum_score
                },
                {
                  title: 'Growth',
                  dataIndex: 'growth_score',
                  key: 'growth_score',
                  width: 100,
                  sorter: (a, b) => a.growth_score - b.growth_score
                }
              ]}
              dataSource={rankedStocks}
              rowKey="ticker"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Showing ${total} stocks`,
                position: ['bottomCenter']
              }}
              scroll={{ x: 1000 }}
              size="small"
              bordered
            />
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}
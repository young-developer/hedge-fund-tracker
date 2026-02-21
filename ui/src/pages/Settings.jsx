import { useState, useEffect } from 'react'
import { Tabs, Card } from 'antd'
import { getSettingsSummary } from '../api/settings'
import LoadingSpinner from '../components/LoadingSpinner'
import Stocks from './settings/Stocks'
import HedgeFunds from './settings/HedgeFunds'
import AIModels from './settings/AIModels'
import NonQuarterlyFilings from './settings/NonQuarterlyFilings'
import AIReports from './settings/AIReports'
import { Database, Building2, Brain, FileText, TrendingUp } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [activeTab, setActiveTab] = useState('stocks')

  useEffect(() => {
    async function fetchData() {
      try {
        const summaryData = await getSettingsSummary()
        setSummary(summaryData.data)
      } catch (error) {
        console.error('Error fetching settings data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="text-center">
            <Database className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-medium text-gray-500">Stocks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.stocks_total || 0}</p>
          </Card>
          <Card className="text-center">
            <Building2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-xs font-medium text-gray-500">Hedge Funds</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.hedge_funds_total || 0}</p>
          </Card>
          <Card className="text-center">
            <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-xs font-medium text-gray-500">Models</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.models_total || 0}</p>
          </Card>
          <Card className="text-center">
            <FileText className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <p className="text-xs font-medium text-gray-500">Excluded Funds</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.excluded_funds_total || 0}</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-xs font-medium text-gray-500">Non-Quarterly</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.non_quarterly?.count || 0}</p>
          </Card>
        </div>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Stocks" key="stocks">
            <Stocks />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Hedge Funds" key="hedge-funds">
            <HedgeFunds />
          </Tabs.TabPane>
          <Tabs.TabPane tab="AI Models" key="ai-models">
            <AIModels />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Non-Quarterly Filings" key="non-quarterly">
            <NonQuarterlyFilings />
          </Tabs.TabPane>
          <Tabs.TabPane tab="AI Reports" key="ai-reports">
            <AIReports />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Tabs, Card, Button, notification } from 'antd'
import { getSettingsSummary } from '../api/settings'
import { triggerDatabaseUpdate, getDatabaseUpdateStatus } from '../api/database'
import LoadingSpinner from '../components/LoadingSpinner'
import Stocks from './settings/Stocks'
import HedgeFunds from './settings/HedgeFunds'
import AIModels from './settings/AIModels'
import NonQuarterlyFilings from './settings/NonQuarterlyFilings'
import AIReports from './settings/AIReports'
import { Database, Building2, Brain, FileText, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [activeTab, setActiveTab] = useState('stocks')
  const [dbStatus, setDbStatus] = useState(null)
  const [dbStatusLoading, setDbStatusLoading] = useState(true)

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

    async function fetchDbStatus() {
      try {
        const response = await getDatabaseUpdateStatus()
        setDbStatus(response.data)
      } catch (error) {
        console.error('Error fetching DB status:', error)
      } finally {
        setDbStatusLoading(false)
      }
    }

    fetchDbStatus()

    const interval = setInterval(fetchDbStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdateDatabase = async () => {
    notification.open({
      message: 'Database Update',
      description: 'Starting database update...',
      icon: <Database className="w-6 h-6 text-blue-600" />,
      duration: 0,
      key: 'database-update',
      closeIcon: <span className="text-gray-400">Close</span>,
    })

    try {
      await triggerDatabaseUpdate()

      notification.destroy('database-update')

      notification.open({
        message: 'Update Started',
        description: 'Database update has been initiated. You can continue using the app while it runs.',
        icon: <Database className="w-6 h-6 text-blue-600" />,
        duration: 5,
        key: 'update-started',
      })

      let progress = 10
      const interval = setInterval(async () => {
        try {
          const response = await getDatabaseUpdateStatus()
          const data = response.data

          notification.destroy('database-update')

          if (data.status === 'in_progress') {
            let phaseText = data.phase
            if (data.phase.includes('13f_reports')) {
              phaseText = 'Updating 13F reports for all hedge funds...'
              progress = 70
            } else if (data.phase.includes('non_quarterly')) {
              phaseText = 'Fetching latest non-quarterly filings...'
              progress = 90
            }

            notification.open({
              message: 'Database Update in Progress',
              description: phaseText,
              icon: <Database className="w-6 h-6 text-blue-600" />,
              duration: 0,
              key: 'database-update',
              closeIcon: <span className="text-gray-400">Close</span>,
            })
          } else if (data.status === 'completed') {
            clearInterval(interval)
            notification.destroy('database-update')

            notification.success({
              message: 'Update Complete',
              description: 'Database updated successfully!',
              icon: <CheckCircle className="w-6 h-6 text-green-600" />,
              duration: 10,
              key: 'update-complete',
            })
          } else if (data.status === 'completed_with_errors') {
            clearInterval(interval)
            notification.destroy('database-update')

            notification.warning({
              message: 'Update Complete with Errors',
              description: 'Database updated but some errors occurred. Check the errors below.',
              icon: <AlertCircle className="w-6 h-6 text-yellow-600" />,
              duration: 10,
              key: 'update-complete-with-errors',
            })
          } else if (data.status === 'failed') {
            clearInterval(interval)
            notification.destroy('database-update')

            notification.error({
              message: 'Update Failed',
              description: 'Database update failed. Please check the error logs.',
              icon: <AlertCircle className="w-6 h-6 text-red-600" />,
              duration: 10,
              key: 'update-failed',
            })
          }
        } catch (error) {
          console.error('Error checking update status:', error)
          clearInterval(interval)
          notification.destroy('database-update')
          notification.error({
            message: 'Update Failed',
            description: 'Failed to check update status: ' + error.message,
            icon: <AlertCircle className="w-6 h-6 text-red-600" />,
            duration: 10,
            key: 'update-failed',
          })
        }
      }, 2000)

    } catch (error) {
      notification.destroy('database-update')
      notification.error({
        message: 'Update Failed',
        description: 'Failed to start database update: ' + error.message,
        icon: <AlertCircle className="w-6 h-6 text-red-600" />,
        duration: 10,
        key: 'update-failed',
      })
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <Button
          type="primary"
          icon={<Database className="w-4 h-4 mr-2" />}
          onClick={handleUpdateDatabase}
          disabled={dbStatus?.status === 'running'}
          loading={dbStatus?.status === 'running'}
          className={`bg-gradient-to-r from-blue-600 to-blue-700 ${
            dbStatus?.status === 'running' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {dbStatus?.status === 'running' ? 'Updating...' : 'Update Database'}
        </Button>
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

      {dbStatus && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Database Status</h3>
            </div>
            {dbStatusLoading ? (
              <span className="text-xs text-gray-500">Loading...</span>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full ${
                dbStatus.status === 'running' ? 'bg-blue-100 text-blue-700' :
                dbStatus.status === 'idle' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {dbStatus.status === 'running' ? 'Updating' : 'Idle'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Update</p>
              {dbStatus.last_update ? (
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(dbStatus.last_update).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Never</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Funds</p>
              <p className="text-sm font-semibold text-gray-900">
                {dbStatus.fund_count || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Filings</p>
              <p className="text-sm font-semibold text-gray-900">
                {dbStatus.filings_count || 0}
              </p>
            </div>
          </div>

          {dbStatus.status === 'running' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Update in progress...</span>
                <span>Refreshing...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}
        </Card>
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

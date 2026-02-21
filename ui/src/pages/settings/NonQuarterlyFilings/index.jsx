import { useState, useEffect } from 'react'
import { Table, Empty, Spin } from 'antd'
import TickerLogo from '../../../components/TickerLogo'
import { getNonQuarterlyFilings } from '../../../api/settings'

export default function NonQuarterlyFilings() {
  const [nonQuarterlyFilingsData, setNonQuarterlyFilingsData] = useState([])
  const [tabsLoading, setTabsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setTabsLoading(true)
      try {
        const response = await getNonQuarterlyFilings()
        setNonQuarterlyFilingsData(response.data || [])
      } catch (error) {
        console.error('Error loading non-quarterly filings data:', error)
      } finally {
        setTabsLoading(false)
      }
    }

    loadData()
  }, [])

  const getFilingColumns = () => [
    { title: 'Date', dataIndex: 'Date', key: 'date', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Fund', dataIndex: 'Fund', key: 'fund', className: 'hidden sm:table-cell' },
    { title: 'Ticker', dataIndex: 'Ticker', key: 'ticker', render: (ticker) => (
      <div className="flex items-center gap-2">
        <TickerLogo ticker={ticker} />
        <span className="font-medium text-gray-900">{ticker}</span>
      </div>
    )},
    { title: 'Company', dataIndex: 'Company', key: 'company' },
    { title: 'Shares', dataIndex: 'Shares', key: 'shares', className: 'hidden sm:table-cell' },
    { title: 'Value', dataIndex: 'Value', key: 'value', className: 'hidden md:table-cell' },
  ]

  const getUniqueFilingKey = (record) => {
    return record.Date || record.Fund || record.Ticker || record.Company
  }

  return (
    <div className="space-y-4">
      {tabsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      ) : nonQuarterlyFilingsData.length > 0 ? (
        <Table
          columns={getFilingColumns()}
          dataSource={nonQuarterlyFilingsData}
          rowKey={getUniqueFilingKey}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Empty description="No filings found" />
      )}
    </div>
  )
}

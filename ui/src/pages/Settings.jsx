import { useState, useEffect } from 'react'
import { Tabs, Card, Input, Table, Select, Empty, Spin } from 'antd'
import { Database, Building2, Brain, FileText, TrendingUp } from 'lucide-react'
import { getSettingsSummary, searchStocks, getAllStocks, getAllHedgeFunds, getExcludedHedgeFunds, getAllModels, getNonQuarterlyFilings } from '../api/settings'
import api from '../services/api'
import TickerLogo from '../components/TickerLogo'
import LoadingSpinner from '../components/LoadingSpinner'

const { TabPane } = Tabs
const { Search: SearchInput } = Input
const { Option } = Select

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [activeTab, setActiveTab] = useState('stocks')
  const [hedgeFundsSubTab, setHedgeFundsSubTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState('ticker')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchHedgeFundsQuery, setSearchHedgeFundsQuery] = useState('')
  const [searchHedgeFundsField, setSearchHedgeFundsField] = useState('fund')
  const [searchHedgeFundsResults, setSearchHedgeFundsResults] = useState([])
  const [searchHedgeFundsAllQuery, setSearchHedgeFundsAllQuery] = useState('')
  const [searchHedgeFundsAllField, setSearchHedgeFundsAllField] = useState('fund')
  const [searchHedgeFundsAllResults, setSearchHedgeFundsAllResults] = useState([])
  const [searchHedgeFundsExcludedQuery, setSearchHedgeFundsExcludedQuery] = useState('')
  const [searchHedgeFundsExcludedField, setSearchHedgeFundsExcludedField] = useState('fund')
  const [searchHedgeFundsExcludedResults, setSearchHedgeFundsExcludedResults] = useState([])
  const [stocksData, setStocksData] = useState([])
  const [hedgeFundsData, setHedgeFundsData] = useState([])
  const [excludedFundsData, setExcludedFundsData] = useState([])
  const [modelsData, setModelsData] = useState([])
  const [nonQuarterlyFilingsData, setNonQuarterlyFilingsData] = useState([])
  const [tabsLoading, setTabsLoading] = useState(false)
  const [hedgeFundsLoading, setHedgeFundsLoading] = useState(false)

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

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      // Map 'name' to 'company' for backend compatibility
      const backendSearchField = searchField === 'name' ? 'company' : searchField
      const response = await searchStocks(value, backendSearchField)
      setSearchResults(response.data || [])
    } catch (error) {
      console.error('Error searching stocks:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleHedgeFundSearch = (value) => {
    if (!value.trim()) {
      if (hedgeFundsSubTab === 'all') {
        setSearchHedgeFundsAllResults([])
      } else {
        setSearchHedgeFundsExcludedResults([])
      }
      return
    }

    const lowercasedValue = value.toLowerCase()
    const data = hedgeFundsSubTab === 'all' ? hedgeFundsData : excludedFundsData
    const searchField = hedgeFundsSubTab === 'all' ? searchHedgeFundsAllField : searchHedgeFundsExcludedField

    const results = data.filter((fund) => {
      if (searchField === 'fund' && fund.Fund) {
        return fund.Fund.toLowerCase().includes(lowercasedValue)
      } else if (searchField === 'manager' && fund.Manager) {
        return fund.Manager.toLowerCase().includes(lowercasedValue)
      } else if (searchField === 'cik' && fund.CIK) {
        return fund.CIK.toLowerCase().includes(lowercasedValue)
      }
      return false
    })

    if (hedgeFundsSubTab === 'all') {
      setSearchHedgeFundsAllResults(results)
    } else {
      setSearchHedgeFundsExcludedResults(results)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setTabsLoading(true)
      setHedgeFundsLoading(true)
      try {
        const [stocks, hedgeFunds, excludedFunds, models, filings] = await Promise.all([
          getAllStocks(),
          getAllHedgeFunds(),
          getExcludedHedgeFunds(),
          getAllModels(),
          getNonQuarterlyFilings()
        ])

        console.log('Stocks data:', stocks)
        console.log('Hedge funds data:', hedgeFunds)
        console.log('Excluded funds data:', excludedFunds)

        setStocksData(stocks.data || [])
        setHedgeFundsData(hedgeFunds.data || [])
        setExcludedFundsData(excludedFunds.data || [])
        setModelsData(models.data || [])
        setNonQuarterlyFilingsData(filings.data || [])
      } catch (error) {
        console.error('Error loading settings data:', error)
      } finally {
        setTabsLoading(false)
        setHedgeFundsLoading(false)
      }
    }

    loadData()
  }, [])

  const getStockColumns = () => [
    { title: 'Ticker', dataIndex: 'Ticker', key: 'ticker', render: (ticker) => (
      <div className="flex items-center gap-2">
        <TickerLogo ticker={ticker} />
        <span className="font-medium text-gray-900">{ticker}</span>
      </div>
    )},
    { title: 'Company', dataIndex: 'Company', key: 'company', className: 'hidden md:table-cell' },
    { title: 'CUSIP', dataIndex: 'CUSIP', key: 'cusip', className: 'hidden lg:table-cell' },
  ]

  const getUniqueRowKey = (record) => {
    return record.CUSIP || record.Ticker
  }

  const getFundColumns = () => [
    { title: 'CIK', dataIndex: 'CIK', key: 'cik', className: 'hidden sm:table-cell' },
    { title: 'Fund Name', dataIndex: 'Fund', key: 'fund' },
    { title: 'Manager', dataIndex: 'Manager', key: 'manager', className: 'hidden md:table-cell' },
    { title: 'Denomination', dataIndex: 'Denomination', key: 'denomination', className: 'hidden lg:table-cell' },
  ]

  const getModelColumns = () => [
    { title: 'Model ID', dataIndex: 'ID', key: 'id' },
    { title: 'Description', dataIndex: 'Description', key: 'description' },
    { title: 'Client', dataIndex: 'Client', key: 'client' },
  ]

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

  const getTabsItems = () => [
    {
      key: 'stocks',
      label: 'Stocks',
      children: (
        <>
          <div className="mb-4">
              <SearchInput
                placeholder="Search stocks by ticker, name, or CUSIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                loading={searching}
                className="max-w-md"
                allowClear
              />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Search by:</span>
                <Select
                  value={searchField}
                  onChange={setSearchField}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="ticker">Ticker</Option>
                  <Option value="name">Name</Option>
                  <Option value="cusip">CUSIP</Option>
                </Select>
            </div>
          </div>
          {searchResults.length > 0 ? (
            <Table
              columns={getStockColumns()}
              dataSource={searchResults}
              rowKey={getUniqueRowKey}
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Table
              columns={getStockColumns()}
              dataSource={searchResults}
              rowKey={getUniqueRowKey}
              pagination={{ pageSize: 10 }}
            />
          )}
        </>
      ),
    },
    {
      key: 'hedge-funds',
      label: 'Hedge Funds',
      children: (
        <>
          {hedgeFundsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Tabs
              activeKey={hedgeFundsSubTab}
              onChange={setHedgeFundsSubTab}
            >
              <TabPane tab="All Funds" key="all">
                <div className="mb-4">
                  <Input.Search
                    placeholder="Search funds by name, manager, or CIK..."
                    value={searchHedgeFundsAllQuery}
                    onChange={(e) => setSearchHedgeFundsAllQuery(e.target.value)}
                    onSearch={handleHedgeFundSearch}
                    className="max-w-md"
                    allowClear
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Search by:</span>
                    <Select
                      value={searchHedgeFundsAllField}
                      onChange={setSearchHedgeFundsAllField}
                      style={{ width: 140 }}
                      size="small"
                    >
                      <Option value="fund">Fund Name</Option>
                      <Option value="manager">Manager</Option>
                      <Option value="cik">CIK</Option>
                    </Select>
                  </div>
                </div>
                 {searchHedgeFundsAllResults.length > 0 ? (
                  <Table
                    columns={getFundColumns()}
                    dataSource={searchHedgeFundsAllResults}
                    rowKey="CIK"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Table
                    columns={getFundColumns()}
                    dataSource={searchHedgeFundsAllResults}
                    rowKey="CIK"
                    pagination={{ pageSize: 10 }}
                  />
                )}
              </TabPane>
              <TabPane tab="Excluded Funds" key="excluded">
                <div className="mb-4">
                  <Input.Search
                    placeholder="Search funds by name, manager, or CIK..."
                    value={searchHedgeFundsExcludedQuery}
                    onChange={(e) => setSearchHedgeFundsExcludedQuery(e.target.value)}
                    onSearch={handleHedgeFundSearch}
                    className="max-w-md"
                    allowClear
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Search by:</span>
                    <Select
                      value={searchHedgeFundsExcludedField}
                      onChange={setSearchHedgeFundsExcludedField}
                      style={{ width: 140 }}
                      size="small"
                    >
                      <Option value="fund">Fund Name</Option>
                      <Option value="manager">Manager</Option>
                      <Option value="cik">CIK</Option>
                    </Select>
                  </div>
                </div>
                 {searchHedgeFundsExcludedResults.length > 0 ? (
                  <Table
                    columns={getFundColumns()}
                    dataSource={searchHedgeFundsExcludedResults}
                    rowKey="CIK"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Table
                    columns={getFundColumns()}
                    dataSource={searchHedgeFundsExcludedResults}
                    rowKey="CIK"
                    pagination={{ pageSize: 10 }}
                  />
                )}
              </TabPane>
            </Tabs>
          )}
        </>
      ),
    },
    {
      key: 'models',
      label: 'AI Models',
      children: (
        <>
          {tabsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" />
            </div>
          ) : modelsData.length > 0 ? (
            <Table
              columns={getModelColumns()}
              dataSource={modelsData}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Empty description="No AI models found" />
          )}
        </>
      ),
    },
    {
      key: 'non-quarterly',
      label: 'Non-Quarterly Filings',
      children: (
        <>
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
        </>
      ),
    },
  ]

  const getUniqueFilingKey = (record) => {
    return record.Date || record.Fund || record.Ticker || record.Company
  }

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
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={getTabsItems()} />
      </Card>
    </div>
  )
}

import {useState, useEffect} from 'react'
import {Tabs, Input, Select, Table} from 'antd'
import {getAllHedgeFunds, getExcludedHedgeFunds} from '../../../api/settings'

const {TabPane} = Tabs
const {Search: SearchInput} = Input
const {Option} = Select

export default function HedgeFunds() {
  const [hedgeFundsSubTab, setHedgeFundsSubTab] = useState('all')
  const [searchHedgeFundsAllQuery, setSearchHedgeFundsAllQuery] = useState('')
  const [searchHedgeFundsAllField, setSearchHedgeFundsAllField] = useState(
      'fund')
  const [searchHedgeFundsAllResults, setSearchHedgeFundsAllResults] = useState(
      [])
  const [searchHedgeFundsExcludedQuery, setSearchHedgeFundsExcludedQuery] = useState(
      '')
  const [searchHedgeFundsExcludedField, setSearchHedgeFundsExcludedField] = useState(
      'fund')
  const [searchHedgeFundsExcludedResults, setSearchHedgeFundsExcludedResults] = useState(
      [])
  const [trackedFundsResults, setTrackedFundsResults] = useState(null)
  const [excludedFundsResults, setExcludedFundsResults] = useState(null)
  const [hedgeFundsData, setHedgeFundsData] = useState([])
  const [excludedFundsData, setExcludedFundsData] = useState([])
  const [hedgeFundsLoading, setHedgeFundsLoading] = useState(true)

  const handleTrackedFundsSearch = (value) => {
    if (!value.trim()) {
      setTrackedFundsResults(hedgeFundsData)
      return
    }

    const lowercasedValue = value.toLowerCase()
    const results = hedgeFundsData.filter((fund) => {
      if (searchHedgeFundsAllField === 'fund' && fund.Fund) {
        return fund.Fund.toLowerCase().includes(lowercasedValue)
      } else if (searchHedgeFundsAllField === 'manager' && fund.Manager) {
        return fund.Manager.toLowerCase().includes(lowercasedValue)
      } else if (searchHedgeFundsAllField === 'cik' && fund.CIK) {
        return fund.CIK.toLowerCase().includes(lowercasedValue)
      }
      return false
    })

    setTrackedFundsResults(results)
  }

  const handleExcludedFundsSearch = (value) => {
    if (!value.trim()) {
      setExcludedFundsResults(excludedFundsData)
      return
    }

    const lowercasedValue = value.toLowerCase()
    const results = excludedFundsData.filter((fund) => {
      if (searchHedgeFundsExcludedField === 'fund' && fund.Fund) {
        return fund.Fund.toLowerCase().includes(lowercasedValue)
      } else if (searchHedgeFundsExcludedField === 'manager' && fund.Manager) {
        return fund.Manager.toLowerCase().includes(lowercasedValue)
      } else if (searchHedgeFundsExcludedField === 'cik' && fund.CIK) {
        return fund.CIK.toLowerCase().includes(lowercasedValue)
      }
      return false
    })

    setExcludedFundsResults(results)
  }

  const getFundColumns = () => [
    {
      title: 'CIK',
      dataIndex: 'CIK',
      key: 'cik',
      className: 'hidden sm:table-cell'
    },
    {title: 'Fund Name', dataIndex: 'Fund', key: 'fund'},
    {
      title: 'Manager',
      dataIndex: 'Manager',
      key: 'manager',
      className: 'hidden md:table-cell'
    },
    {
      title: 'Denomination',
      dataIndex: 'Denomination',
      key: 'denomination',
      className: 'hidden lg:table-cell'
    },
  ]

  useEffect(() => {
    const loadData = async () => {
      setHedgeFundsLoading(true)
      try {
        const [hedgeFunds, excludedFunds] = await Promise.all([
          getAllHedgeFunds(),
          getExcludedHedgeFunds()
        ])

        setHedgeFundsData(hedgeFunds.data || [])
        setExcludedFundsData(excludedFunds.data || [])
      } catch (error) {
        console.error('Error loading hedge funds data:', error)
      } finally {
        setHedgeFundsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
      <Tabs activeKey={hedgeFundsSubTab} onChange={setHedgeFundsSubTab}>
        <TabPane tab="Tracked Funds" key="all">
          <div className="mb-4">
            <SearchInput
                placeholder="Search funds by name, manager, or CIK..."
                value={searchHedgeFundsAllQuery}
                onChange={(e) => setSearchHedgeFundsAllQuery(e.target.value)}
                onSearch={handleTrackedFundsSearch}
                className="max-w-md"
                allowClear
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Search by:</span>
              <Select
                  value={searchHedgeFundsAllField}
                  onChange={setSearchHedgeFundsAllField}
                  style={{width: 140}}
                  size="small"
              >
                <Option value="fund">Fund Name</Option>
                <Option value="manager">Manager</Option>
                <Option value="cik">CIK</Option>
              </Select>
            </div>
          </div>
          {hedgeFundsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-gray-500">Loading...</span>
              </div>
      ) : (
          <Table
              columns={getFundColumns()}
              dataSource={trackedFundsResults || hedgeFundsData}
              rowKey="CIK"
              pagination={{pageSize: 10}}
          />
      )}
          <div className="mt-2 text-sm text-gray-600">
            Showing <span className="font-semibold">{(trackedFundsResults || hedgeFundsData).length}</span> funds
          </div>
        </TabPane>
        <TabPane tab="Excluded Funds" key="excluded">
          <div className="mb-4">
            <SearchInput
                placeholder="Search funds by name, manager, or CIK..."
                value={searchHedgeFundsExcludedQuery}
                onChange={(e) => setSearchHedgeFundsExcludedQuery(
                    e.target.value)}
                onSearch={handleExcludedFundsSearch}
                className="max-w-md"
                allowClear
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Search by:</span>
              <Select
                  value={searchHedgeFundsExcludedField}
                  onChange={setSearchHedgeFundsExcludedField}
                  style={{width: 140}}
                  size="small"
              >
                <Option value="fund">Fund Name</Option>
                <Option value="manager">Manager</Option>
                <Option value="cik">CIK</Option>
              </Select>
            </div>
          </div>
          {hedgeFundsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-gray-500">Loading...</span>
              </div>
      ) : (
          <Table
              columns={getFundColumns()}
              dataSource={excludedFundsResults || excludedFundsData}
              rowKey="CIK"
              pagination={{pageSize: 10}}
          />
      )}
          <div className="mt-2 text-sm text-gray-600">
            Showing <span className="font-semibold">{(excludedFundsResults || excludedFundsData).length}</span> funds
          </div>
        </TabPane>
      </Tabs>
  )
}

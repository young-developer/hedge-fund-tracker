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
  const [hedgeFundsData, setHedgeFundsData] = useState([])
  const [excludedFundsData, setExcludedFundsData] = useState([])
  const [hedgeFundsLoading, setHedgeFundsLoading] = useState(true)

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
    const searchField = hedgeFundsSubTab === 'all' ? searchHedgeFundsAllField
        : searchHedgeFundsExcludedField

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
        <TabPane tab="All Funds" key="all">
          <div className="mb-4">
            <SearchInput
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
                  dataSource={searchHedgeFundsAllResults}
                  rowKey="CIK"
                  pagination={{pageSize: 10}}
              />
          )}
        </TabPane>
        <TabPane tab="Excluded Funds" key="excluded">
          <div className="mb-4">
            <SearchInput
                placeholder="Search funds by name, manager, or CIK..."
                value={searchHedgeFundsExcludedQuery}
                onChange={(e) => setSearchHedgeFundsExcludedQuery(
                    e.target.value)}
                onSearch={handleHedgeFundSearch}
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
                  dataSource={searchHedgeFundsExcludedResults}
                  rowKey="CIK"
                  pagination={{pageSize: 10}}
              />
          )}
        </TabPane>
      </Tabs>
  )
}

import {useState} from 'react'
import {Input, Table} from 'antd'
import {searchStocks} from '../../../api/settings'
import TickerLogo from '../../../components/TickerLogo'

const {Search: SearchInput} = Input

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState('ticker')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const backendSearchField = searchField === 'name' ? 'company'
          : searchField
      const response = await searchStocks(value, backendSearchField)
      setSearchResults(response.data || [])
    } catch (error) {
      console.error('Error searching stocks:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const getStockColumns = () => [
    {
      title: 'Ticker', dataIndex: 'Ticker', key: 'ticker', render: (ticker) => (
          <div className="flex items-center gap-2">
            <TickerLogo ticker={ticker}/>
            <span className="font-medium text-gray-900">{ticker}</span>
          </div>
      )
    },
    {
      title: 'Company',
      dataIndex: 'Company',
      key: 'company',
      className: 'hidden md:table-cell'
    },
    {
      title: 'CUSIP',
      dataIndex: 'CUSIP',
      key: 'cusip',
      className: 'hidden lg:table-cell'
    },
  ]

  const getUniqueRowKey = (record) => {
    return record.CUSIP || record.Ticker
  }

  return (
      <div className="space-y-4">
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
            <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                style={{width: 120}}
                className="text-sm border rounded px-2 py-1"
            >
              <option value="ticker">Ticker</option>
              <option value="name">Name</option>
              <option value="cusip">CUSIP</option>
            </select>
          </div>
        </div>
        <Table
            columns={getStockColumns()}
            dataSource={searchResults}
            rowKey={getUniqueRowKey}
            pagination={{pageSize: 10}}
        />
      </div>
  )
}

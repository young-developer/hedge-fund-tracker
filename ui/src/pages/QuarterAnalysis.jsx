import {useEffect, useState} from 'react'
import {getQuarters, getQuarterAnalysis} from '../api/analysis'
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Users,
  ArrowUp,
  TrendingDown,
  Play,
  Trophy
} from 'lucide-react'
import TickerLogo from '../components/TickerLogo'
import Card from '../components/Card'
import {Table as AntdTable, Tabs} from 'antd'
import {formatValue, formatPercentage, formatPrice} from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'

export default function QuarterAnalysis() {
  const [quarters, setQuarters] = useState([])
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState({})
  const [sortedData, setSortedData] = useState({})
  const [activeTab, setActiveTab] = useState('TOP_BUYS')

  const handleSort = (columnKey, sectionKey) => {
    setSortOrder((prev) => {
      const newOrder = {...prev}
      if (newOrder[sectionKey] === columnKey) {
        newOrder[sectionKey] = newOrder[sectionKey] + 1
      } else {
        newOrder[sectionKey] = columnKey
      }
      return newOrder
    })
  }

  const getSortedData = (data, sectionKey) => {
    const sortKey = sortOrder[sectionKey]
    if (!sortKey) {
      return data
    }

    const multiplier = sortOrder[sectionKey] % 2 === 0 ? 1 : -1
    return [...data].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      if (aValue === null || aValue === undefined) {
        return 1
      }
      if (bValue === null || bValue === undefined) {
        return -1
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier
      }
      return String(aValue).localeCompare(String(bValue), undefined,
          {numeric: true}) * multiplier
    })
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await getQuarters()
        setQuarters(data || [])
        if (data && data.length > 0) {
          setSelectedQuarter(data[0])
        }
      } catch (error) {
        console.error('Error fetching quarters:', error)
      }
    }

    fetchData()
  }, [])

  async function fetchAnalysis(quarter) {
    setLoading(true)
    try {
      const {data} = await getQuarterAnalysis(quarter)
      setAnalysis(data)
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColumns = (customColumns, sectionKey) => {
    return customColumns.map((col) => ({
      title: col.header,
      dataIndex: col.key,
      key: col.key,
      ellipsis: true,
      sorter: (a, b) => {
        const aValue = a[col.key]
        const bValue = b[col.key]
        if (aValue === null || aValue === undefined) {
          return 1
        }
        if (bValue === null || bValue === undefined) {
          return -1
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue
        }
        return String(aValue).localeCompare(String(bValue), undefined,
            {numeric: true})
      },
      render: (value, record) => {
        if (col.key === 'Ticker') {
          return <TickerLogo ticker={record.Ticker}/>
        }
        if (typeof value === 'number') {
          if (col.key === 'Delta' || col.key === 'Avg_Portfolio_Pct' || col.key === 'Max_Portfolio_Pct') {
            return formatPercentage(value)
          }
          if (col.key === 'Total_Delta_Value' || col.key === 'Total_Value' || col.key === 'Total_Delta_Value') {
            return formatValue(value)
          }
          if (col.key === 'price_change') {
            const formatted = formatPercentage(value)
            const colorClass = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
            return <span className={colorClass}>{formatted}</span>
          }
        }
        return value
      },
    }))
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
  }

  const items = [
    {
      key: 'TOP_BUYS',
      label: (
          <span className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600"/>
          Consensus Buys
        </span>
      ),
      children: analysis?.TOP_BUYS && analysis.TOP_BUYS.length > 0 && (
            <div
                className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <AntdTable
                  columns={getColumns([
                    {key: 'Ticker', header: 'Ticker'},
                    {key: 'Company', header: 'Company'},
                    {key: 'price_change', header: 'Price Change %'},
                    {key: 'Delta', header: 'Delta'},
                    {key: 'Net_Buyers', header: 'Net_Buyers'},
                    {key: 'Buyer_Count', header: 'Buyer_Count'},
                    {key: 'Seller_Count', header: 'Seller_Count'},
                    {key: 'Holder_Count', header: 'Holder_Count'},
                    {key: 'Total_Delta_Value', header: 'Total Delta Value'}
                  ], 'TOP_BUYS')}
                 dataSource={getSortedData(analysis.TOP_BUYS, 'TOP_BUYS')}
                rowKey={(record) => record.Ticker}
                size="small"
                pagination={false}
                scroll={{x: 'max-content'}}
                onChange={(pagination, filters, sorter) => {
                  if (sorter.columnKey) {
                    handleSort(sorter.columnKey, 'TOP_BUYS')
                  }
                }}
            />
          </div>
      ),
    },
    {
      key: 'TOP_NEW_CONSENSUS',
      label: (
          <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600"/>
          New Consensus
        </span>
      ),
        children: analysis?.TOP_NEW_CONSENSUS && analysis.TOP_NEW_CONSENSUS.length
            > 0 && (
                <div
                    className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  <AntdTable
                      columns={getColumns([
                        {key: 'Ticker', header: 'Ticker'},
                        {key: 'Company', header: 'Company'},
                        {key: 'price_change', header: 'Price Change %'},
                        {key: 'New_Holder_Count', header: 'New Holder Count'},
                        {key: 'Net_Buyers', header: 'Net Buyers'},
                        {key: 'Holder_Count', header: 'Holder Count'},
                        {key: 'Delta', header: 'Delta'},
                        {key: 'Total_Delta_Value', header: 'Total Delta Value'},
                        {key: 'Total_Value', header: 'Total Value'}
                      ], 'TOP_NEW_CONSENSUS')}
                     dataSource={getSortedData(analysis.TOP_NEW_CONSENSUS,
                         'TOP_NEW_CONSENSUS')}
                    rowKey={(record) => record.Ticker}
                    size="small"
                    pagination={false}
                    scroll={{x: 'max-content'}}
                    onChange={(pagination, filters, sorter) => {
                      if (sorter.columnKey) {
                        handleSort(sorter.columnKey, 'TOP_NEW_CONSENSUS')
                      }
                    }}
                />
              </div>
          ),
    },
    {
      key: 'TOP_INCREASING_POSITIONS',
      label: (
          <span className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-purple-600"/>
          Increasing Positions
        </span>
      ),
        children: analysis?.TOP_INCREASING_POSITIONS
            && analysis.TOP_INCREASING_POSITIONS.length > 0 && (
                <div
                    className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  <AntdTable
                      columns={getColumns([
                        {key: 'Ticker', header: 'Ticker'},
                        {key: 'Company', header: 'Company'},
                        {key: 'price_change', header: 'Price Change %'},
                        {key: 'New_Holder_Count', header: 'New Holder Count'},
                        {key: 'Net_Buyers', header: 'Net Buyers'},
                        {key: 'Holder_Count', header: 'Holder Count'},
                        {key: 'Delta', header: 'Delta'},
                        {key: 'Total_Delta_Value', header: 'Total Delta Value'},
                        {key: 'Total_Value', header: 'Total Value'}
                      ], 'TOP_INCREASING_POSITIONS')}
                     dataSource={getSortedData(analysis.TOP_INCREASING_POSITIONS,
                         'TOP_INCREASING_POSITIONS')}
                    rowKey={(record) => record.Ticker}
                    size="small"
                    pagination={false}
                    scroll={{x: 'max-content'}}
                    onChange={(pagination, filters, sorter) => {
                      if (sorter.columnKey) {
                        handleSort(sorter.columnKey, 'TOP_INCREASING_POSITIONS')
                      }
                    }}
                />
              </div>
          ),
    },
     {
       key: 'TOP_BETS',
       label: (
           <span className="flex items-center gap-2">
           <Trophy className="h-4 w-4 text-red-600"/>
           Big Bets
         </span>
       ),
        children: analysis?.TOP_BETS && analysis.TOP_BETS.length > 0 && (
            <div
                className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <AntdTable
                  columns={getColumns([
                    {key: 'Ticker', header: 'Ticker'},
                    {key: 'Company', header: 'Company'},
                    {key: 'price_change', header: 'Price Change %'},
                    {key: 'Max_Portfolio_Pct', header: 'Max Portfolio %'},
                    {key: 'Avg_Portfolio_Pct', header: 'Avg Portfolio %'},
                    {key: 'Delta', header: 'Delta'},
                    {key: 'Total_Delta_Value', header: 'Total Delta Value'},
                    {key: 'Total_Value', header: 'Total Value'}
                  ], 'TOP_BETS')}
                 dataSource={getSortedData(analysis.TOP_BETS, 'TOP_BETS')}
                rowKey={(record) => record.Ticker}
                size="small"
                pagination={false}
                scroll={{x: 'max-content'}}
                onChange={(pagination, filters, sorter) => {
                  if (sorter.columnKey) {
                    handleSort(sorter.columnKey, 'TOP_BETS')
                  }
                }}
            />
          </div>
      ),
    },
     {
       key: 'AVERAGE_PORTFOLIO',
       label: (
           <span className="flex items-center gap-2">
           <BarChart3 className="h-4 w-4 text-yellow-600"/>
           Average Portfolio
         </span>
       ),
         children: analysis?.AVERAGE_PORTFOLIO && analysis.AVERAGE_PORTFOLIO.length
             > 0 && (
                 <div
                     className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <AntdTable
                        columns={getColumns([
                          {key: 'Ticker', header: 'Ticker'},
                          {key: 'Company', header: 'Company'},
                          {key: 'price_change', header: 'Price Change %'},
                          {key: 'Avg_Portfolio_Pct', header: 'Avg Portfolio %'},
                          {key: 'Max_Portfolio_Pct', header: 'Max Portfolio %'},
                          {key: 'Holder_Count', header: 'Holder Count'},
                          {key: 'Delta', header: 'Delta'},
                          {key: 'Total_Value', header: 'Total Value'}
                        ], 'AVERAGE_PORTFOLIO')}
                      dataSource={getSortedData(analysis.AVERAGE_PORTFOLIO,
                          'AVERAGE_PORTFOLIO')}
                     rowKey={(record) => record.Ticker}
                     size="small"
                     pagination={false}
                     scroll={{x: 'max-content'}}
                     onChange={(pagination, filters, sorter) => {
                       if (sorter.columnKey) {
                         handleSort(sorter.columnKey, 'AVERAGE_PORTFOLIO')
                       }
                     }}
                 />
               </div>
           ),
     },
     {
       key: 'TOP_SELLS',
       label: (
           <span className="flex items-center gap-2">
           <TrendingDown className="h-4 w-4 text-red-600"/>
           Consensus Sells
         </span>
       ),
         children: analysis?.TOP_SELLS && analysis.TOP_SELLS.length > 0 && (
             <div
                 className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
               <AntdTable
                   columns={getColumns([
                     {key: 'Ticker', header: 'Ticker'},
                     {key: 'Company', header: 'Company'},
                     {key: 'price_change', header: 'Price Change %'},
                     {key: 'Net_Buyers', header: 'Net Sellers'},
                     {key: 'Seller_Count', header: 'Seller Count'},
                     {key: 'Buyer_Count', header: 'Buyer Count'},
                     {key: 'Delta', header: 'Delta'},
                     {key: 'Total_Delta_Value', header: 'Total Delta Value'}
                   ], 'TOP_SELLS')}
                  dataSource={getSortedData(analysis.TOP_SELLS, 'TOP_SELLS')}
                 rowKey={(record) => record.Ticker}
                 size="small"
                 pagination={false}
                 scroll={{x: 'max-content'}}
                 onChange={(pagination, filters, sorter) => {
                   if (sorter.columnKey) {
                     handleSort(sorter.columnKey, 'TOP_SELLS')
                   }
                 }}
             />
           </div>
       ),
     },
   ]

  if (quarters.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-gray-400"/>
          <p className="ml-4 text-gray-500">No quarters available</p>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quarter Analysis</h2>
          <p className="mt-2 text-gray-600">Analyze hedge fund trends and stock
            activity</p>
        </div>

         {/* Quarter Selector */}
        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Quarter
          </label>
          <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {quarters.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
            ))}
          </select>
          {selectedQuarter && analysis && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Total Stocks</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {analysis.TOTAL_STOCKS}
                </p>
              </div>
          )}
        </Card>

        {/* Run Analysis Button */}
        {selectedQuarter && (
            <button
                onClick={() => fetchAnalysis(selectedQuarter)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5"/>
              {loading ? 'Running Analysis...' : 'Run Analysis'}
            </button>
        )}

        {/* Loading State */}
        {loading && (
            <LoadingSpinner message="Analyzing market data..." />
        )}

         {/* Analysis Results */}
        {!loading && analysis && (
            <Card>
              <Tabs activeKey={activeTab} onChange={handleTabChange}
                    items={items}/>
            </Card>
        )}
      </div>
  )
}

import {Modal, Select} from 'antd'
import {formatCurrency, formatPercentage} from '../services/api'
import TickerLogo from './TickerLogo'

export default function StockAnalysisModal({stockData, onClose, quarter, onQuarterChange, quarters}) {
  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={<span>X</span>}
    >
      <div className="flex items-center gap-3 mb-6">
        <TickerLogo ticker={stockData.TICKER}/>
        <h3 className="text-xl font-semibold text-gray-900">
          {stockData.TICKER} ({stockData.COMPANY})
        </h3>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Quarter</h3>
        <Select
          value={quarter}
          onChange={onQuarterChange}
          className="w-full md:w-64"
        >
          {quarters?.map((q) => (
            <Select.Option key={q} value={q}>
              {q}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-700">Total Value</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(stockData.TOTAL_VALUE)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-700">Total Delta Value</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatCurrency(stockData.TOTAL_DELTA_VALUE)} {stockData.DELTA_PCT
              ? `(${formatPercentage(stockData.DELTA_PCT, 2)})` : ''}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-700">Avg Portfolio %</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {formatPercentage(stockData.AVG_PERCENTAGE, 2)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-700">Holder Count</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {stockData.HOLDER_COUNT}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-red-700">Buyers</p>
          <p className="text-xl font-bold text-red-900 mt-1">
            {stockData.NUM_BUYERS} ({stockData.NEW_HOLDER_COUNT} new)
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-700">Sellers</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            {stockData.NUM_SELLERS} ({stockData.CLOSE_COUNT} sold out)
          </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-indigo-700">Max Portfolio %</p>
          <p className="text-xl font-bold text-indigo-900 mt-1">
            {formatPercentage(stockData.MAX_PERCENTAGE, 2)}
          </p>
        </div>
        <div className="bg-pink-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-pink-700">Buyer/Seller Ratio</p>
          <p className="text-xl font-bold text-pink-900 mt-1">
            {formatCurrency(stockData.NUM_BUYERS / stockData.NUM_SELLERS || 0)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Holders by Shares</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Delta Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Portfolio %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Delta
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {stockData.HOLDERS.map((holder, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(holder.DELTA_VALUE)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holder.FUND}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatPercentage(parseFloat(holder.PORTFOLIO_PCT) || 0, 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(holder.DELTA_SHARES || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(holder.VALUE)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {holder.DELTA}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

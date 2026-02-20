import { formatCurrency, formatPercentage, formatDate, formatNumber } from '../services/api'

export default function Table({ columns, data, title, sortKey = null, sortDirection = 'asc', onSort = null }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  const handleSort = (key) => {
    if (onSort) {
      onSort(key)
    }
  }

  const renderValue = (value, key) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">N/A</span>
    }

    if (key === 'Value' || key === 'Delta_Value' || key === 'Total_Delta_Value') {
      return formatCurrency(value)
    }

    if (key === 'Portfolio_Pct' || key === 'Max_Portfolio_Pct' || key === 'Avg_Portfolio_Pct' || key.includes('Score')) {
      return formatPercentage(value, 2)
    }

    if (key === 'Shares' || key === 'Weight' || key === 'Return' || key === 'Weighted_Return') {
      return formatNumber(value, 2)
    }

    if (key === 'Date') {
      return formatDate(value)
    }

    return value
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{column.header}</span>
                  {sortKey === column.key && (
                    <span className="text-gray-400 flex-shrink-0">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {renderValue(row[column.key], column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
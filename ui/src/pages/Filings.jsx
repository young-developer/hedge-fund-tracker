import { useEffect, useState } from 'react'
import { getRecentFilings } from '../api/filings'
import { Clock, AlertCircle, DollarSign, Share2, TrendingUp, TrendingDown } from 'lucide-react'

export default function Filings() {
  const [filings, setFilings] = useState({ data: { recent_filings: [] } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getRecentFilings(30)
        setFilings(response)
      } catch (error) {
        console.error('Error fetching filings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Non-Quarterly Filings</h2>
        <p className="mt-2 text-gray-600">
          Latest 13D/G and Form 4 filings from hedge funds
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {filings.data && filings.data.recent_filings && filings.data.recent_filings.length > 0 ? (
          <div className="space-y-4">
              {filings.data.recent_filings.map((filing) => (
                <div
                  key={filing.TICKER}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={`https://cdn.brandfetch.io/ticker/${filing.TICKER}?c=${import.meta.env.VITE_BRANDFETCH_API_KEY}`}
                      alt={`${filing.TICKER} logo`}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{filing.TICKER}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{filing.CUSIP}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{filing.COMPANY}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-600">Fund:</span>
                        <span>{filing.FUND}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-600">Date:</span>
                        <span>{new Date(filing.DATE).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-600">Filing:</span>
                        <span>{new Date(filing.FILING_DATE).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{filing.Shares?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${typeof filing.VALUE === 'string' ? filing.VALUE.replace(/,/g, '').toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>${typeof filing.AVG_PRICE === 'string' ? filing.AVG_PRICE.replace(/,/g, '').toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      (filing.DELTA || '').includes('NEW') ? 'bg-green-100 text-green-800' :
                      (filing.DELTA || '').includes('CLOSE') ? 'bg-red-100 text-red-800' :
                      (filing.DELTA || '').includes('+') ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {filing.DELTA || '-'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      (filing.DELTA || '').includes('NEW') ? 'bg-green-200 text-green-800' :
                      (filing.DELTA || '').includes('CLOSE') ? 'bg-red-200 text-red-800' :
                      (filing.DELTA || '').includes('+') ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {filing.DELTA?.includes('NEW') || filing.DELTA?.includes('+') ? 'Buy' : 'Sell'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent filings found</p>
          </div>
        )}
      </div>
    </div>
  )
}

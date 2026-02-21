import { createContext, useContext, useState } from 'react'

const DashboardContext = createContext()

export function DashboardProvider({ children }) {
  const [dashboardData, setDashboardData] = useState({
    availableQuarters: 0,
    recentFilings: 0,
    lastUpdated: 'N/A',
    lastDatabaseUpdate: null,
  })
  const [loading, setLoading] = useState(true)

  const updateQuarters = (quarters) => {
    setDashboardData(prev => ({
      ...prev,
      availableQuarters: quarters?.length || 0,
      lastUpdated: quarters?.[0] || 'N/A',
    }))
  }

  const updateRecentFilings = (filings) => {
    let totalFilings = 0
    if (filings?.data?.recent_filings) {
      totalFilings = filings.data.recent_filings.length
    } else if (filings?.recent_filings) {
      totalFilings = filings.recent_filings.length
    } else if (filings?.length) {
      totalFilings = filings.length
    } else if (filings?.total_filings) {
      totalFilings = filings.total_filings
    }
    setDashboardData(prev => ({
      ...prev,
      recentFilings: totalFilings,
    }))
  }

  const updateDashboardData = (data) => {
    setDashboardData({
      availableQuarters: data.quarters?.length || 0,
      recentFilings: data.filings?.total_filings || data.filings?.length || 0,
      lastUpdated: data.quarters?.[0] || 'N/A',
    })
    setLoading(false)
  }

  const updateLastDatabaseUpdate = (timestamp) => {
    setDashboardData(prev => ({
      ...prev,
      lastDatabaseUpdate: timestamp,
    }))
  }

  return (
    <DashboardContext.Provider value={{ dashboardData, loading, updateDashboardData, updateQuarters, updateRecentFilings, updateLastDatabaseUpdate }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}

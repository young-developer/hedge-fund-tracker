import api from '../services/api'

export const getRecentFilings = (days = 30) => api.get('/api/filings/recent', { params: { days } })
export const getFundFilings = (fundName, days = 30) => api.get(`/api/filings/fund/${fundName}`, { params: { days } })
export const getStockFilings = (ticker, days = 30) => api.get(`/api/filings/stock/${ticker}`, { params: { days } })
export const getFilingsSummary = (days = 30) => api.get('/api/filings/summary', { params: { days } })

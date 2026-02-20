import api from '../services/api'

export const searchStocks = (query) => api.get('/api/stocks/search', { params: { query } })
export const getAllStocks = () => api.get('/api/stocks/all')
export const getStockHoldings = (ticker, quarter) => api.get(`/api/stocks/${ticker}/holdings/${quarter}`)
export const getStockAnalysis = (ticker, quarter) => api.get(`/api/stocks/${ticker}/analysis/${quarter}`)
export const getStockCusips = (ticker) => api.get(`/api/stocks/${ticker}/cusips`)
export const getTopStocksByQuarter = (quarter, limit) => api.get(`/api/stocks/top/${quarter}`, { params: { limit } })
export const getRisingStocks = (quarter, limit) => api.get(`/api/stocks/rising/${quarter}`, { params: { limit } })
export const getStockQuarterData = (ticker, quarter) => api.get(`/api/stocks/${ticker}/data/${quarter}`)

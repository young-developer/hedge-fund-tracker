import api from '../services/api'

export const getSettingsSummary = () => api.get('/api/settings/summary')
export const getDataSources = () => api.get('/api/settings/data-sources')
export const getAllStocks = (limit = 100) => api.get(`/api/settings/stocks?limit=${limit}`)
export const searchStocks = (query, searchField = 'ticker') => api.get(`/api/settings/stocks/bulk-search?query=${encodeURIComponent(query)}&search_field=${searchField}`)
export const getStockByTicker = (ticker) => api.get(`/api/settings/stocks/${ticker.toUpperCase()}`)
export const getStockByCusip = (cusip) => api.get(`/api/settings/stocks/${cusip.toUpperCase()}`)
export const getAllHedgeFunds = () => api.get('/api/settings/hedge-funds')
export const getExcludedHedgeFunds = () => api.get('/api/settings/hedge-funds/excluded')
export const getHedgeFundByCik = (cik) => api.get(`/api/settings/hedge-funds/${cik.toUpperCase()}`)
export const getAllModels = () => api.get('/api/settings/models')
export const getModelById = (modelId) => api.get(`/api/settings/models/${modelId}`)
export const getNonQuarterlyFilings = () => api.get('/api/settings/non-quarterly')

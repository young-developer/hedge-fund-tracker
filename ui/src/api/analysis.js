import api from '../services/api'

export const getQuarters = () => api.get('/api/analysis/quarters')
export const getQuarterAnalysis = (quarter, includePriceChange = true) => api.get(`/api/analysis/quarters/${quarter}`, {params: {include_price_change: includePriceChange}})
export const getLastQuarter = () => api.get('/api/analysis/last-quarter')
export const getAllAvailableQuarters = () => api.get('/api/analysis/quarters/all')

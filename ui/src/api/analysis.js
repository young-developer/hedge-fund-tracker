import api from '../services/api'

export const getQuarters = () => api.get('/api/analysis/quarters')
export const getQuarterAnalysis = (quarter) => api.get(`/api/analysis/quarters/${quarter}`)
export const getLastQuarter = () => api.get('/api/analysis/last-quarter')
export const getAllAvailableQuarters = () => api.get('/api/analysis/quarters/all')

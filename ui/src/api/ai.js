import api from '../services/api'

export const getAIModels = () => api.get('/api/ai/models')
export const runAIAnalyst = (request) => api.post('/api/ai/analyst', request)
export const runAIDueDiligence = (request) => api.post('/api/ai/due-diligence', request)
export const getAIModelInfo = (modelId) => api.get(`/api/ai/model/${modelId}`)

export const getAIAnalystReports = () => api.get('/api/ai/reports/analyst')
export const getAIAnalystReport = (reportId) => api.get(`/api/ai/reports/analyst/${reportId}`)
export const getLastAIAnalystReport = () => api.get('/api/ai/reports/analyst/latest')
export const getAIDueDiligenceReports = () => api.get('/api/ai/reports/due-diligence')
export const getAIDueDiligenceReport = (reportId) => api.get(`/api/ai/reports/due-diligence/${reportId}`)
export const getLastAIDueDiligenceReport = () => api.get('/api/ai/reports/due-diligence/latest')

export const getAIReports = () => Promise.all([
  getAIAnalystReports(),
  getAIDueDiligenceReports()
]).then(([analystReports, dueDiligenceReports]) => ({
  analyst: analystReports.data || [],
  dueDiligence: dueDiligenceReports.data || []
}))

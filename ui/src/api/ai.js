import api from '../services/api'

export const getAIModels = () => api.get('/api/ai/models')
export const runAIAnalyst = (request) => api.post('/api/ai/analyst', request)
export const runAIDueDiligence = (request) => api.post('/api/ai/due-diligence', request)
export const getAIModelInfo = (modelId) => api.get(`/api/ai/model/${modelId}`)

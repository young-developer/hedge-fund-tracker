import api from '../services/api'

export const triggerDatabaseUpdate = () => api.post('/api/database/update')
export const getDatabaseUpdateStatus = () => api.get('/api/database/status')

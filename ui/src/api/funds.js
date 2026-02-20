import api from '../services/api'

export const getAllFunds = () => api.get('/api/funds')
export const getFundQuarters = (fundName) => api.get(`/api/funds/${fundName}/quarters`)
export const getFundHoldings = (fundName, quarter) => api.get(`/api/funds/${fundName}/holdings/${quarter}`)
export const getFundPerformance = (fundName, quarter) => api.get(`/api/funds/${fundName}/performance/${quarter}`)
export const getQuarterFunds = (quarter) => api.get(`/api/funds/quarters/${quarter}`)
export const getFundLastQuarter = (fundName) => api.get(`/api/funds/${fundName}/last-quarter`)
export const getFundData = (fund, quarter) => api.get(`/api/funds/${fund}/data/${quarter}`)

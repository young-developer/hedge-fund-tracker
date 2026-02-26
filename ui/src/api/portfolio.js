import api from '../services/api'

export const getStockRecommendation = async (ticker, quarter) => {
  const params = quarter ? { quarter } : {}
  const response = await api.get(`/api/portfolio/recommendation/${ticker}`, { params })
  return response.data || response
}

export const getPortfolioAnalysis = async (tickers, quarter) => {
  const params = quarter ? { tickers, quarter } : { tickers }
  const response = await api.get('/api/portfolio/analysis', { params })
  return response.data || response
}

export const getStockHolders = async (ticker, quarter) => {
  const response = await api.get(`/api/portfolio/${ticker}/holders/${quarter}`)
  return response.data || response
}

export const getAllAvailableQuarters = async () => {
  const response = await api.get('/api/analysis/quarters/all')
  return response.data || response
}

export const getStockPriceChange = async (ticker, quarter) => {
  const params = quarter ? { quarter } : {}
  const response = await api.get(`/api/portfolio/price/change/${ticker}`, { params })
  return response.data || response
}

export const getPortfolioPriceChanges = async (tickers, quarter) => {
  const params = quarter ? { tickers, quarter } : { tickers }
  const response = await api.get('/api/portfolio/price/changes', { params })
  return response.data || response
}

export const getPortfolioFullData = async (tickers, quarter) => {
  const params = quarter ? { tickers, quarter } : { tickers }
  const response = await api.get('/api/portfolio/full-data', { params })
  return response.data || response
}

export const getPortfolioFromStorage = () => {
  try {
    const data = localStorage.getItem('portfolio')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading portfolio from storage:', error)
    return []
  }
}

export const savePortfolioToStorage = (portfolio) => {
  try {
    localStorage.setItem('portfolio', JSON.stringify(portfolio))
    return true
  } catch (error) {
    console.error('Error saving portfolio to storage:', error)
    return false
  }
}

export const addToPortfolio = (stock) => {
  const portfolio = getPortfolioFromStorage()
  const existingIndex = portfolio.findIndex(s => s.ticker === stock.ticker)

  if (existingIndex !== -1) {
    portfolio[existingIndex] = { ...portfolio[existingIndex], ...stock, addedAt: new Date().toISOString() }
  } else {
    portfolio.push({ ...stock, addedAt: new Date().toISOString() })
  }

  return savePortfolioToStorage(portfolio)
}

export const removeFromPortfolio = (ticker) => {
  const portfolio = getPortfolioFromStorage()
  const filtered = portfolio.filter(s => s.ticker !== ticker)
  return savePortfolioToStorage(filtered)
}

export const isStockInPortfolio = (ticker) => {
  const portfolio = getPortfolioFromStorage()
  return portfolio.some(s => s.ticker === ticker)
}

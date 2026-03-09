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

export const addToPortfolio = (stock, categoryId = 'my') => {
  const portfolio = getPortfolioFromStorage()
  const existingIndex = portfolio.findIndex(s => s.ticker === stock.ticker)

  const stockData = {
    ...stock,
    categoryId,
    addedAt: new Date().toISOString()
  }

  if (existingIndex !== -1) {
    portfolio[existingIndex] = { ...portfolio[existingIndex], ...stockData }
  } else {
    portfolio.push(stockData)
  }

  return savePortfolioToStorage(portfolio)
}

export const updateStockCategory = (ticker, categoryId) => {
  const portfolio = getPortfolioFromStorage()
  const index = portfolio.findIndex(s => s.ticker === ticker)

  if (index === -1) {
    return false
  }

  portfolio[index] = { ...portfolio[index], categoryId }
  return savePortfolioToStorage(portfolio)
}

export const getStocksByCategory = (categoryId) => {
  const portfolio = getPortfolioFromStorage()
  return portfolio.filter(s => {
    const stockCategory = s.categoryId || 'my'
    return stockCategory === categoryId
  })
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

export const getStockSP500Status = async (ticker) => {
  const response = await api.get(`/api/stocks/${ticker}/is-sp500-stock`)
  return response.data || false
}

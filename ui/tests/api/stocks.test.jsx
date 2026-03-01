import { vi } from 'vitest'
import {
  searchStocks,
  getAllStocks,
  getStockHoldings,
  getStockAnalysis,
  getStockCusips,
  getTopStocksByQuarter,
  getRisingStocks,
  getStockQuarterData,
  getStockPriceHistory,
  getStockFundamentals,
} from '@/api/stocks'
import api from '@/services/api'

vi.mock('@/services/api')

describe('Stocks API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('searchStocks returns search results', async () => {
    const mockData = [{ TICKER: 'AAPL', COMPANY: 'Apple Inc.' }]
    api.get.mockResolvedValue({ data: mockData })

    const result = await searchStocks('AAPL')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/search', { params: { query: 'AAPL' } })
    expect(result.data).toEqual(mockData)
  })

  test('searchStocks returns empty array for no results', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await searchStocks('INVALID')

    expect(result.data).toEqual([])
  })

  test('searchStocks handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(searchStocks('AAPL')).rejects.toThrow('API Error')
  })

  test('getAllStocks returns all stocks', async () => {
    const mockData = [
      { TICKER: 'AAPL', COMPANY: 'Apple Inc.' },
      { TICKER: 'MSFT', COMPANY: 'Microsoft Corp.' },
    ]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getAllStocks()

    expect(api.get).toHaveBeenCalledWith('/api/stocks/all')
    expect(result.data).toEqual(mockData)
  })

  test('getAllStocks returns empty array', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getAllStocks()

    expect(result.data).toEqual([])
  })

  test('getStockHoldings returns holdings data', async () => {
    const mockData = [{ FUND: 'Fund A', VALUE: '1000000', DELTA: '1000' }]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockHoldings('AAPL', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/holdings/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockHoldings handles empty holdings', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getStockHoldings('AAPL', 'Q1 2024')

    expect(result.data).toEqual([])
  })

  test('getStockHoldings handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockHoldings('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
  })

  test('getStockAnalysis returns analysis data', async () => {
    const mockData = { recommendation: 'BUY', confidence: 0.95 }
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockAnalysis('AAPL', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/analysis/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockAnalysis handles empty analysis', async () => {
    api.get.mockResolvedValue({ data: {} })

    const result = await getStockAnalysis('AAPL', 'Q1 2024')

    expect(result.data).toEqual({})
  })

  test('getStockAnalysis handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockAnalysis('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
  })

  test('getStockCusips returns CUSIP data', async () => {
    const mockData = [{ CUSIP: '123456789', NAME: 'Apple Inc.' }]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockCusips('AAPL')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/cusips')
    expect(result.data).toEqual(mockData)
  })

  test('getStockCusips handles empty CUSIP data', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getStockCusips('AAPL')

    expect(result.data).toEqual([])
  })

  test('getStockCusips handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockCusips('AAPL')).rejects.toThrow('API Error')
  })

  test('getTopStocksByQuarter returns top stocks', async () => {
    const mockData = [
      { TICKER: 'AAPL', COMPANY: 'Apple Inc.', RANK: 1 },
      { TICKER: 'MSFT', COMPANY: 'Microsoft Corp.', RANK: 2 },
    ]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getTopStocksByQuarter('Q1 2024', 10)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/top/Q1 2024', { params: { limit: 10 } })
    expect(result.data).toEqual(mockData)
  })

  test('getTopStocksByQuarter handles empty results', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getTopStocksByQuarter('Q1 2024', 10)

    expect(result.data).toEqual([])
  })

  test('getTopStocksByQuarter handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getTopStocksByQuarter('Q1 2024', 10)).rejects.toThrow('API Error')
  })

  test('getRisingStocks returns rising stocks', async () => {
    const mockData = [
      { TICKER: 'AAPL', COMPANY: 'Apple Inc.', CHANGE: 10.5 },
      { TICKER: 'MSFT', COMPANY: 'Microsoft Corp.', CHANGE: 8.2 },
    ]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getRisingStocks('Q1 2024', 10)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/rising/Q1 2024', { params: { limit: 10 } })
    expect(result.data).toEqual(mockData)
  })

  test('getRisingStocks handles empty results', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getRisingStocks('Q1 2024', 10)

    expect(result.data).toEqual([])
  })

  test('getRisingStocks handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getRisingStocks('Q1 2024', 10)).rejects.toThrow('API Error')
  })

  test('getStockQuarterData returns stock quarter data', async () => {
    const mockData = { price: 150.25, volume: 1000000 }
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockQuarterData('AAPL', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/data/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockQuarterData handles empty data', async () => {
    api.get.mockResolvedValue({ data: {} })

    const result = await getStockQuarterData('AAPL', 'Q1 2024')

    expect(result.data).toEqual({})
  })

  test('getStockQuarterData handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockQuarterData('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
  })

  test('getStockPriceHistory returns price history', async () => {
    const mockData = [
      { DATE: '2024-01-01', PRICE: 150.25 },
      { DATE: '2024-01-02', PRICE: 151.00 },
    ]
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL', 30)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 30 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory uses default limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 365 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory handles empty history', async () => {
    api.get.mockResolvedValue({ data: [] })

    const result = await getStockPriceHistory('AAPL', 30)

    expect(result.data).toEqual([])
  })

  test('getStockPriceHistory handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockPriceHistory('AAPL', 30)).rejects.toThrow('API Error')
  })

  test('getStockFundamentals returns fundamentals', async () => {
    const mockData = { PE: 25.5, EPS: 5.25, MARKET_CAP: 2500000000000 }
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockFundamentals('AAPL', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/fundamentals', { params: { quarter: 'Q1 2024' } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockFundamentals without quarter', async () => {
    const mockData = { PE: 25.5, EPS: 5.25 }
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockFundamentals('AAPL')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/fundamentals', { params: { quarter: null } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockFundamentals handles empty fundamentals', async () => {
    api.get.mockResolvedValue({ data: {} })

    const result = await getStockFundamentals('AAPL', 'Q1 2024')

    expect(result.data).toEqual({})
  })

  test('getStockFundamentals handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getStockFundamentals('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
  })

  test('searchStocks with special characters', async () => {
    const mockData = [{ TICKER: 'AAPL', COMPANY: 'Apple Inc.' }]
    api.get.mockResolvedValue({ data: mockData })

    const result = await searchStocks('AAPL-1')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/search', { params: { query: 'AAPL-1' } })
    expect(result.data).toEqual(mockData)
  })

  test('searchStocks with empty query', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await searchStocks('')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/search', { params: { query: '' } })
    expect(result.data).toEqual(mockData)
  })

  test('searchStocks with whitespace query', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await searchStocks('   ')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/search', { params: { query: '   ' } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockHoldings with undefined quarter', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockHoldings('AAPL', undefined)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/holdings/undefined')
    expect(result.data).toEqual(mockData)
  })

  test('getStockAnalysis with undefined quarter', async () => {
    const mockData = {}
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockAnalysis('AAPL', undefined)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/analysis/undefined')
    expect(result.data).toEqual(mockData)
  })

  test('getTopStocksByQuarter with zero limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getTopStocksByQuarter('Q1 2024', 0)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/top/Q1 2024', { params: { limit: 0 } })
    expect(result.data).toEqual(mockData)
  })

  test('getTopStocksByQuarter with negative limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getTopStocksByQuarter('Q1 2024', -1)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/top/Q1 2024', { params: { limit: -1 } })
    expect(result.data).toEqual(mockData)
  })

  test('getRisingStocks with zero limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getRisingStocks('Q1 2024', 0)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/rising/Q1 2024', { params: { limit: 0 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory with custom limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL', 60)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 60 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory with very large limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL', 3650)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 3650 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockFundamentals with null quarter', async () => {
    const mockData = {}
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockFundamentals('AAPL', null)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/fundamentals', { params: { quarter: null } })
    expect(result.data).toEqual(mockData)
  })

  test('getAllStocks handles API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    await expect(getAllStocks()).rejects.toThrow('API Error')
  })

  test('getStockHoldings with empty ticker', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockHoldings('', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks//holdings/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockAnalysis with empty ticker', async () => {
    const mockData = {}
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockAnalysis('', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks//analysis/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockCusips with empty ticker', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockCusips('')

    expect(api.get).toHaveBeenCalledWith('/api/stocks//cusips')
    expect(result.data).toEqual(mockData)
  })

  test('getStockQuarterData with empty ticker', async () => {
    const mockData = {}
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockQuarterData('', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks//data/Q1 2024')
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory with empty ticker', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('', 30)

    expect(api.get).toHaveBeenCalledWith('/api/stocks//price-history', { params: { limit: 30 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockFundamentals with empty ticker', async () => {
    const mockData = {}
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockFundamentals('', 'Q1 2024')

    expect(api.get).toHaveBeenCalledWith('/api/stocks//fundamentals', { params: { quarter: 'Q1 2024' } })
    expect(result.data).toEqual(mockData)
  })

  test('searchStocks with very long query', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await searchStocks('This is a very long search query that should still work correctly')

    expect(api.get).toHaveBeenCalledWith('/api/stocks/search', { params: { query: 'This is a very long search query that should still work correctly' } })
    expect(result.data).toEqual(mockData)
  })

  test('getTopStocksByQuarter with very large limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getTopStocksByQuarter('Q1 2024', 1000)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/top/Q1 2024', { params: { limit: 1000 } })
    expect(result.data).toEqual(mockData)
  })

  test('getRisingStocks with very large limit', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getRisingStocks('Q1 2024', 1000)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/rising/Q1 2024', { params: { limit: 1000 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory with limit of 1', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL', 1)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 1 } })
    expect(result.data).toEqual(mockData)
  })

  test('getStockPriceHistory with limit of 0', async () => {
    const mockData = []
    api.get.mockResolvedValue({ data: mockData })

    const result = await getStockPriceHistory('AAPL', 0)

    expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/price-history', { params: { limit: 0 } })
    expect(result.data).toEqual(mockData)
  })
})
import { vi } from 'vitest'
import {
  getStockRecommendation,
  getPortfolioAnalysis,
  getStockHolders,
  getAllAvailableQuarters,
  getStockPriceChange,
  getPortfolioPriceChanges,
  getPortfolioFullData,
  getPortfolioFromStorage,
  savePortfolioToStorage,
  addToPortfolio,
  removeFromPortfolio,
  isStockInPortfolio,
  getStockSP500Status,
} from '@/api/portfolio'
import api from '@/services/api'

vi.mock('@/services/api')

describe('Portfolio API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStockRecommendation', () => {
    test('returns recommendation with quarter', async () => {
      const mockData = { label: 'BUY', confidence: 0.95 }
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation('AAPL', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/AAPL', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('returns recommendation without quarter', async () => {
      const mockData = { label: 'BUY', confidence: 0.95 }
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation('AAPL')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/AAPL', { params: {} })
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getStockRecommendation('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getPortfolioAnalysis', () => {
    test('returns portfolio analysis with quarter', async () => {
      const mockData = [{ ticker: 'AAPL', recommendation: 'BUY' }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioAnalysis('AAPL,MSFT', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/analysis', { params: { tickers: 'AAPL,MSFT', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('returns portfolio analysis without quarter', async () => {
      const mockData = [{ ticker: 'AAPL', recommendation: 'BUY' }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioAnalysis('AAPL,MSFT')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/analysis', { params: { tickers: 'AAPL,MSFT' } })
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getPortfolioAnalysis('AAPL,MSFT', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getStockHolders', () => {
    test('returns stock holders', async () => {
      const mockData = [{ FUND: 'Fund A', VALUE: '1000000' }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockHolders('AAPL', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/AAPL/holders/Q1 2024')
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getStockHolders('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getAllAvailableQuarters', () => {
    test('returns available quarters', async () => {
      const mockData = ['Q1 2024', 'Q2 2024']
      api.get.mockResolvedValue({ data: mockData })

      const result = await getAllAvailableQuarters()

      expect(api.get).toHaveBeenCalledWith('/api/analysis/quarters/all')
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getAllAvailableQuarters()).rejects.toThrow('API Error')
    })
  })

  describe('getStockPriceChange', () => {
    test('returns price change with quarter', async () => {
      const mockData = { price_change: 12.5 }
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockPriceChange('AAPL', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/change/AAPL', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('returns price change without quarter', async () => {
      const mockData = { price_change: 12.5 }
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockPriceChange('AAPL')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/change/AAPL', { params: {} })
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getStockPriceChange('AAPL', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getPortfolioPriceChanges', () => {
    test('returns portfolio price changes with quarter', async () => {
      const mockData = [{ ticker: 'AAPL', price_change: 12.5 }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioPriceChanges('AAPL,MSFT', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/changes', { params: { tickers: 'AAPL,MSFT', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('returns portfolio price changes without quarter', async () => {
      const mockData = [{ ticker: 'AAPL', price_change: 12.5 }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioPriceChanges('AAPL,MSFT')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/changes', { params: { tickers: 'AAPL,MSFT' } })
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getPortfolioPriceChanges('AAPL,MSFT', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getPortfolioFullData', () => {
    test('returns portfolio full data with quarter', async () => {
      const mockData = [{ ticker: 'AAPL', recommendation: 'BUY', price_change: 12.5 }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioFullData('AAPL,MSFT', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/full-data', { params: { tickers: 'AAPL,MSFT', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('returns portfolio full data without quarter', async () => {
      const mockData = [{ ticker: 'AAPL', recommendation: 'BUY' }]
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioFullData('AAPL,MSFT')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/full-data', { params: { tickers: 'AAPL,MSFT' } })
      expect(result).toEqual(mockData)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getPortfolioFullData('AAPL,MSFT', 'Q1 2024')).rejects.toThrow('API Error')
    })
  })

  describe('getPortfolioFromStorage', () => {
    test('returns portfolio from localStorage', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'AAPL' }]))

      const result = getPortfolioFromStorage()

      expect(result).toEqual([{ ticker: 'AAPL' }])
      localStorage.getItem.mockClear()
    })

    test('returns empty array when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null)

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })

    test('returns empty array when localStorage has invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json')

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })

    test('returns empty array when localStorage throws error', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })
  })

  describe('savePortfolioToStorage', () => {
    test('saves portfolio to localStorage', () => {
      const portfolio = [{ ticker: 'AAPL' }]
      localStorage.setItem.mockImplementation(() => {})

      const result = savePortfolioToStorage(portfolio)

      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio', JSON.stringify(portfolio))
      expect(result).toBe(true)
      localStorage.setItem.mockClear()
    })

    test('returns false when save fails', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = savePortfolioToStorage([{ ticker: 'AAPL' }])

      expect(result).toBe(false)
      localStorage.setItem.mockClear()
    })
  })

  describe('addToPortfolio', () => {
    test('adds new stock to portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem.mockImplementation(() => true)

      const result = addToPortfolio({ ticker: 'AAPL', company: 'Apple Inc.' })

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('updates existing stock in portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'AAPL' }]))
      localStorage.setItem.mockImplementation(() => true)

      const result = addToPortfolio({ ticker: 'AAPL', company: 'Apple Inc.' })

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('returns false when add fails', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const result = addToPortfolio({ ticker: 'AAPL' })

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })
  })

  describe('removeFromPortfolio', () => {
    test('removes stock from portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'AAPL' }, { ticker: 'MSFT' }]))
      localStorage.setItem.mockImplementation(() => true)

      const result = removeFromPortfolio('AAPL')

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('handles removing non-existent stock', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'MSFT' }]))
      localStorage.setItem.mockImplementation(() => true)

      const result = removeFromPortfolio('AAPL')

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('returns false when remove fails', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'AAPL' }]))
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const result = removeFromPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })
  })

  describe('isStockInPortfolio', () => {
    test('returns true when stock is in portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'AAPL' }]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
    })

    test('returns false when stock is not in portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: 'MSFT' }]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })

    test('returns false when portfolio is empty', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })

    test('returns false when portfolio is null', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(null))

      expect(() => isStockInPortfolio('AAPL')).toThrow()
      localStorage.getItem.mockClear()
    })

    test('returns false when portfolio contains null values', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([null]))

      expect(() => isStockInPortfolio('AAPL')).toThrow()
      localStorage.getItem.mockClear()
    })
  })

  describe('getStockSP500Status', () => {
    test('returns SP500 status', async () => {
      api.get.mockResolvedValue({ data: { data: true } })

      const result = await getStockSP500Status('AAPL')

      expect(api.get).toHaveBeenCalledWith('/api/stocks/AAPL/is-sp500-stock')
      expect(result).toBe(true)
    })

    test('returns false when not in SP500', async () => {
      api.get.mockResolvedValue({ data: false })

      const result = await getStockSP500Status('INVALID')

      expect(result).toBe(false)
    })

    test('handles API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(getStockSP500Status('AAPL')).rejects.toThrow('API Error')
    })
  })

  describe('getStockRecommendation edge cases', () => {
    test('handles undefined ticker', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/undefined', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles null ticker', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation(null, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/null', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles empty ticker', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles undefined quarter', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation('AAPL', undefined)

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/AAPL', { params: { quarter: undefined } })
      expect(result).toEqual(mockData)
    })

    test('handles null quarter', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockRecommendation('AAPL', null)

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/recommendation/AAPL', { params: {} })
      expect(result).toEqual(mockData)
    })
  })

  describe('getPortfolioAnalysis edge cases', () => {
    test('handles empty tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioAnalysis('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/analysis', { params: { tickers: '', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles undefined tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioAnalysis(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/analysis', { params: { tickers: undefined, quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles null tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioAnalysis(null, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/analysis', { params: { tickers: null, quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })
  })

  describe('getStockHolders edge cases', () => {
    test('handles empty ticker', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockHolders('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio//holders/Q1 2024')
      expect(result).toEqual(mockData)
    })

    test('handles undefined ticker', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockHolders(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/undefined/holders/Q1 2024')
      expect(result).toEqual(mockData)
    })
  })

  describe('getStockPriceChange edge cases', () => {
    test('handles empty ticker', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockPriceChange('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/change/', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles undefined ticker', async () => {
      const mockData = {}
      api.get.mockResolvedValue({ data: mockData })

      const result = await getStockPriceChange(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/change/undefined', { params: { quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })
  })

  describe('getPortfolioPriceChanges edge cases', () => {
    test('handles empty tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioPriceChanges('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/changes', { params: { tickers: '', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles undefined tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioPriceChanges(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/price/changes', { params: { tickers: undefined, quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })
  })

  describe('getPortfolioFullData edge cases', () => {
    test('handles empty tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioFullData('', 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/full-data', { params: { tickers: '', quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })

    test('handles undefined tickers', async () => {
      const mockData = []
      api.get.mockResolvedValue({ data: mockData })

      const result = await getPortfolioFullData(undefined, 'Q1 2024')

      expect(api.get).toHaveBeenCalledWith('/api/portfolio/full-data', { params: { tickers: undefined, quarter: 'Q1 2024' } })
      expect(result).toEqual(mockData)
    })
  })

  describe('getStockSP500Status edge cases', () => {
    test('handles empty ticker', async () => {
      api.get.mockResolvedValue({ data: false })

      const result = await getStockSP500Status('')

      expect(api.get).toHaveBeenCalledWith('/api/stocks//is-sp500-stock')
      expect(result).toBe(false)
    })

    test('handles undefined ticker', async () => {
      api.get.mockResolvedValue({ data: false })

      const result = await getStockSP500Status(undefined)

      expect(api.get).toHaveBeenCalledWith('/api/stocks/undefined/is-sp500-stock')
      expect(result).toBe(false)
    })

    test('handles null ticker', async () => {
      api.get.mockResolvedValue({ data: false })

      const result = await getStockSP500Status(null)

      expect(api.get).toHaveBeenCalledWith('/api/stocks/null/is-sp500-stock')
      expect(result).toBe(false)
    })
  })

  describe('getPortfolioFromStorage edge cases', () => {
    test('handles empty string from localStorage', () => {
      localStorage.getItem.mockReturnValue('')

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })

    test('handles whitespace from localStorage', () => {
      localStorage.getItem.mockReturnValue('   ')

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })

    test('handles "[]" from localStorage', () => {
      localStorage.getItem.mockReturnValue('[]')

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })

    test('handles "null" from localStorage', () => {
      localStorage.getItem.mockReturnValue('null')

      const result = getPortfolioFromStorage()

      expect(result).toBe(null)
      localStorage.getItem.mockClear()
    })

    test('handles "undefined" from localStorage', () => {
      localStorage.getItem.mockReturnValue('undefined')

      const result = getPortfolioFromStorage()

      expect(result).toEqual([])
      localStorage.getItem.mockClear()
    })
  })

  describe('savePortfolioToStorage edge cases', () => {
    test('saves empty portfolio', () => {
      localStorage.setItem.mockImplementation(() => {})

      const result = savePortfolioToStorage([])

      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio', '[]')
      expect(result).toBe(true)
      localStorage.setItem.mockClear()
    })

    test('saves portfolio with null values', () => {
      localStorage.setItem.mockImplementation(() => {})

      const result = savePortfolioToStorage([{ ticker: null }])

      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio', JSON.stringify([{ ticker: null }]))
      expect(result).toBe(true)
      localStorage.setItem.mockClear()
    })

    test('saves portfolio with undefined values', () => {
      localStorage.setItem.mockImplementation(() => {})

      const result = savePortfolioToStorage([{ ticker: undefined }])

      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio', JSON.stringify([{ ticker: undefined }]))
      expect(result).toBe(true)
      localStorage.setItem.mockClear()
    })
  })

  describe('addToPortfolio edge cases', () => {
    test('adds stock with undefined company', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem.mockImplementation(() => true)

      const result = addToPortfolio({ ticker: 'AAPL', company: undefined })

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('adds stock with null company', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem.mockImplementation(() => true)

      const result = addToPortfolio({ ticker: 'AAPL', company: null })

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('adds stock with empty ticker', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem.mockImplementation(() => true)

      const result = addToPortfolio({ ticker: '', company: 'Test' })

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })
  })

  describe('removeFromPortfolio edge cases', () => {
    test('handles removing from empty portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      localStorage.setItem.mockImplementation(() => true)

      const result = removeFromPortfolio('AAPL')

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })

    test('handles removing with empty ticker', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: '' }]))
      localStorage.setItem.mockImplementation(() => true)

      const result = removeFromPortfolio('')

      expect(result).toBe(true)
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
    })
  })

  describe('isStockInPortfolio edge cases', () => {
    test('handles empty portfolio', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })

    test('handles portfolio with empty ticker', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: '' }]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })

    test('handles portfolio with null ticker', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([{ ticker: null }]))

      const result = isStockInPortfolio('AAPL')

      expect(result).toBe(false)
      localStorage.getItem.mockClear()
    })
  })
})
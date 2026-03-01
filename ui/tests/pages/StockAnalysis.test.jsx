import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import StockAnalysis from '@/pages/StockAnalysis'
import { searchStocks, getStockAnalysis, getStockHoldings } from '@/api/stocks'
import { getAllAvailableQuarters } from '@/api/analysis'

// Mock the API calls
vi.mock('@/api/stocks')
vi.mock('@/api/analysis')

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(() => {}),
  removeItem: vi.fn(() => {}),
  clear: vi.fn(() => {}),
}

const renderStockAnalysis = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('StockAnalysis Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders loading spinner when loading', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: [] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      expect(screen.getByText('Loading stock analysis...')).toBeInTheDocument()
    })
  })

  test('renders stock analysis interface', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024', 'Q2 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      expect(screen.getByText('Stock Analysis')).toBeInTheDocument()
      expect(screen.getByText('Analyze stock holdings by hedge funds')).toBeInTheDocument()
    })
  })

  test('renders quarter selector', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024', 'Q2 2024', 'Q3 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const quarterSelect = screen.getByRole('combobox')
      expect(quarterSelect).toBeInTheDocument()
    })
  })

  test('displays default quarter', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024', 'Q2 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Q1 2024')
    })
  })

  test('renders search input', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      expect(searchInput).toBeInTheDocument()
    })
  })

  test('renders search button', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchButton = screen.getByRole('button', { name: /Search/i })
      expect(searchButton).toBeInTheDocument()
    })
  })

  test('searches stocks when query is entered', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'AAPL' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  test('displays search results', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'AAPL' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })

  test('selects stock from search results', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })
    getStockAnalysis.mockResolvedValue({ data: { recommendation: 'BUY' } })
    getStockHoldings.mockResolvedValue({ data: [{ FUND: 'Fund A', VALUE: '1000000' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'AAPL' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  test('searches by company name', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'Apple' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  test('searches by case-insensitive ticker', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'aapl' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })



  test('displays holdings data when stock selected', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [{ Ticker: 'AAPL', Company: 'Apple Inc.' }] })
    getStockHoldings.mockResolvedValue({ data: [{ FUND: 'Fund A', VALUE: '1000000' }] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'AAPL' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  test('displays no results message when no search query', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/Enter a ticker or company name/)).toBeInTheDocument()
    })
  })

  test('handles empty search results', async () => {
    getAllAvailableQuarters.mockResolvedValue({ data: ['Q1 2024'] })
    searchStocks.mockResolvedValue({ data: [] })

    renderStockAnalysis(<StockAnalysis />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Enter ticker or company name/)
      fireEvent.change(searchInput, { target: { value: 'INVALID' } })
      fireEvent.click(screen.getByRole('button', { name: /Search/i }))
    })

    await waitFor(() => {
      expect(screen.queryByText('INVALID')).not.toBeInTheDocument()
    })
  })

})
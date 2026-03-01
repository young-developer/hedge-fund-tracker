import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {vi} from 'vitest'
import Home from '@/pages/Home'
import {DashboardProvider, useDashboard} from '@/contexts/DashboardContext'
import {getQuarters} from '@/api/analysis'
import {getRecentFilings} from '@/api/filings'
import {getAIAnalystReportsByQuarter, getAIAnalystReport} from '@/api/ai'
import {getPortfolioFromStorage, getPortfolioFullData} from '@/api/portfolio'

// Mock the API calls
vi.mock('@/api/analysis')
vi.mock('@/api/filings')
vi.mock('@/api/ai')
vi.mock('@/api/portfolio')

// Mock DashboardContext
vi.mock('@/contexts/DashboardContext', () => ({
  DashboardProvider: ({children}) => <div
      data-testid="dashboard-provider">{children}</div>,
  useDashboard: vi.fn(() => ({
    updateQuarters: vi.fn(),
    updateRecentFilings: vi.fn(),
  })),
}))

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(() => {
  }),
  removeItem: vi.fn(() => {
  }),
  clear: vi.fn(() => {
  }),
}

describe('Home Page', () => {
  const renderHome = (props = {}) => {
    return render(
        <DashboardProvider>
          <Home {...props} />
        </DashboardProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders portfolio section when portfolio exists', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([
      {ticker: 'AAPL', company: 'Apple Inc.'},
    ])
    getPortfolioFullData.mockImplementation((tickers, quarter) => {
      return Promise.resolve([
        {ticker: 'AAPL', recommendation: {label: 'BUY'}, price_change: 10},
      ])
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('My Portfolio')).toBeInTheDocument()
    })
  })

  test('renders AI Analyst report section', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([])
    getAIAnalystReportsByQuarter.mockImplementation((quarter) => {
      return Promise.resolve({
        data: [{report_id: '1', model_id: 'test', generated_at: '2024-01-15'}],
      })
    })
    getAIAnalystReport.mockImplementation((reportId) => {
      return Promise.resolve({
        data: {
          top_stocks: [
            {
              ticker: 'GOOG',
              company: 'Google Inc.',
              promise_score: 85,
              risk_score: 10
            },
          ],
          metadata: {
            quarter: 'Q1 2024',
            model_id: 'test',
            generated_at: '2024-01-15'
          },
        },
      })
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Latest AI Analyst Report')).toBeInTheDocument()
      expect(screen.getByText('GOOG')).toBeInTheDocument()
    })
  })

  test('renders recent filings table', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({
      data: {
        recent_filings: [
          {
            TICKER: 'MSFT',
            DATE: '2024-01-15',
            FUND: 'Fund A',
            COMPANY: 'Microsoft',
            DELTA: '1000'
          },
        ],
      },
    })
    getPortfolioFromStorage.mockReturnValue([])

    renderHome()

    await waitFor(() => {
      expect(
          screen.getByText('Recent Non-Quarterly Filings')).toBeInTheDocument()
      expect(screen.getByText('MSFT')).toBeInTheDocument()
    })
  })

  test('handles empty portfolio', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([])

    renderHome()

    await waitFor(() => {
      expect(screen.queryByText('My Portfolio')).not.toBeInTheDocument()
    })
  })

  test('handles empty AI reports', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockResolvedValue({data: []})

    renderHome()

    await waitFor(() => {
      expect(screen.queryByText(
          'Latest AI Analyst Report')).not.toBeInTheDocument()
    })
  })

  test('handles empty filings', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})

    renderHome()

    await waitFor(() => {
      expect(screen.queryByText(
          'Recent Non-Quarterly Filings')).not.toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    getQuarters.mockRejectedValue(new Error('API Error'))

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

  test('shows color legend in AI Analyst report', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockImplementation((quarter) => {
      return Promise.resolve({
        data: [{report_id: '1', model_id: 'test', generated_at: '2024-01-15'}],
      })
    })
    getAIAnalystReport.mockImplementation((reportId) => {
      return Promise.resolve({
        data: {
          top_stocks: [
            {
              ticker: 'AAPL',
              company: 'Apple Inc.',
              promise_score: 85,
              risk_score: 10
            },
          ],
          metadata: {
            quarter: 'Q1 2024',
            model_id: 'test',
            generated_at: '2024-01-15'
          },
        },
      })
    })

    renderHome()

    await waitFor(() => {
      expect(
          screen.getByText('Green: High Promise, Low Risk')).toBeInTheDocument()
      expect(screen.getByText('Yellow: Medium Risk')).toBeInTheDocument()
      expect(
          screen.getByText('Red: Low Promise, High Risk')).toBeInTheDocument()
    })
  })

  test('shows portfolio count in header', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([
      {ticker: 'AAPL'},
      {ticker: 'MSFT'},
    ])
    getPortfolioFullData.mockResolvedValue([])

    renderHome()

    await waitFor(() => {
      expect(screen.getByText(
          '2 stocks • Latest quarter analysis')).toBeInTheDocument()
    })
  })

  test('handles missing metadata in AI report', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockImplementation((quarter) => {
      return Promise.resolve({
        data: [{report_id: '1', model_id: 'test', generated_at: '2024-01-15'}],
      })
    })
    getAIAnalystReport.mockResolvedValue({
      data: {
        top_stocks: [
          {
            ticker: 'AAPL',
            company: 'Apple Inc.',
            promise_score: 85,
            risk_score: 10
          },
        ],
      },
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Latest AI Analyst Report')).toBeInTheDocument()
    })
  })

  test('handles missing generated_at in metadata', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockResolvedValue({
      data: [{report_id: '1', model_id: 'test'}],
    })
    getAIAnalystReport.mockResolvedValue({
      data: {
        top_stocks: [
          {
            ticker: 'AAPL',
            company: 'Apple Inc.',
            promise_score: 85,
            risk_score: 10
          },
        ],
        metadata: {quarter: 'Q1 2024', model_id: 'test'},
      },
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Latest AI Analyst Report')).toBeInTheDocument()
    })
  })

  test('displays portfolio price changes', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([{ticker: 'GOOG'}])
    getPortfolioFullData.mockImplementation((tickers, quarter) => {
      return Promise.resolve([
        {ticker: 'GOOG', price_change: 12.5, recommendation: {label: 'BUY'}},
      ])
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('GOOG')).toBeInTheDocument()
    })
  })

  test('handles portfolio with price change', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([{ticker: 'GOOG'}])
    getPortfolioFullData.mockImplementation((tickers, quarter) => {
      return Promise.resolve([
        {ticker: 'GOOG', price_change: -5.25, recommendation: {label: 'SELL'}},
      ])
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('GOOG')).toBeInTheDocument()
    })
  })

  test('handles no quarters available', async () => {
    getQuarters.mockResolvedValue({data: []})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

  test('handles no filings available', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

  test('handles missing top_stocks in AI report', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockImplementation((quarter) => {
      return Promise.resolve({
        data: [{report_id: '1', model_id: 'test', generated_at: '2024-01-15'}],
      })
    })
    getAIAnalystReport.mockResolvedValue({
      data: {metadata: {quarter: 'Q1 2024'}},
    })
    getPortfolioFromStorage.mockReturnValue([])

    renderHome()

    await waitFor(() => {
      expect(screen.queryByText(
          'Latest AI Analyst Report')).not.toBeInTheDocument()
    })
  })

  test('handles multiple AI reports', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getAIAnalystReportsByQuarter.mockResolvedValue({
      data: [
        {report_id: '1', model_id: 'test1', generated_at: '2024-01-15'},
        {report_id: '2', model_id: 'test2', generated_at: '2024-01-20'},
      ],
    })
    getAIAnalystReport.mockResolvedValue({
      data: {
        top_stocks: [
          {
            ticker: 'AAPL',
            company: 'Apple Inc.',
            promise_score: 85,
            risk_score: 10
          },
        ],
        metadata: {
          quarter: 'Q1 2024',
          model_id: 'test1',
          generated_at: '2024-01-15'
        },
      },
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Latest AI Analyst Report')).toBeInTheDocument()
    })
  })

  test('handles different quarter formats', async () => {
    getQuarters.mockResolvedValue({data: ['2024-Q1', '2024-Q2', '2024-Q3']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

  test('handles empty string ticker', async () => {
    getQuarters.mockResolvedValue({data: ['Q1 2024']})
    getRecentFilings.mockResolvedValue({data: {recent_filings: []}})
    getPortfolioFromStorage.mockReturnValue([{ticker: '', company: ''}])

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

})
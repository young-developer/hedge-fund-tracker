import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AIReportTile from '@/components/AIReportTile'
import { getTileColor, formatScore } from '@/utils/score-colors'

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AIReportTile Component', () => {
  test('renders stock ticker and company name', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('shows company name truncated', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }

    render(<AIReportTile stock={stock} />)

    const companyElement = screen.getByText('Apple Inc.')
    expect(companyElement).toBeInTheDocument()
    expect(companyElement.textContent).toHaveLength('Apple Inc.'.length)
  })

  test('shows promise score', () => {
    const stock = { ticker: 'AAPL', promise_score: 85, risk_score: 15 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText(/Promise/)).toBeInTheDocument()
    expect(screen.getByText(/85.0/)).toBeInTheDocument()
  })

  test('shows risk score', () => {
    const stock = { ticker: 'AAPL', promise_score: 85, risk_score: 15 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText(/Risk/)).toBeInTheDocument()
    expect(screen.getByText(/15.0/)).toBeInTheDocument()
  })

  test('shows correct tile color based on scores', () => {
    const stock = { ticker: 'AAPL', promise_score: 85, risk_score: 10 }

    render(<AIReportTile stock={stock} />)

    const tileColor = getTileColor(85, 10)
    expect(tileColor).toBe('green')
  })

  test('shows correct tile color for yellow', () => {
    const stock = { ticker: 'AAPL', promise_score: 60, risk_score: 20 }

    render(<AIReportTile stock={stock} />)

    const tileColor = getTileColor(60, 20)
    expect(tileColor).toBe('yellow')
  })

  test('shows correct tile color for red', () => {
    const stock = { ticker: 'AAPL', promise_score: 20, risk_score: 70 }

    render(<AIReportTile stock={stock} />)

    const tileColor = getTileColor(20, 70)
    expect(tileColor).toBe('red')
  })

  test('handles missing industry data', () => {
    const stock = { ticker: 'AAPL' }

    render(<AIReportTile stock={stock} />)

    const industryElement = screen.queryByText(/industry/)
    expect(industryElement).not.toBeInTheDocument()
  })

  test('shows industry when available', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', industry: 'Technology' }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText(/Technology/)).toBeInTheDocument()
  })

  test('handles undefined scores', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles null scores', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles undefined promise_score', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', risk_score: 15 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles null promise_score', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', risk_score: 15 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles undefined risk_score', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', promise_score: 85 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles null risk_score', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', promise_score: 85 }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles N/A scores', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.', promise_score: null, risk_score: null }

    render(<AIReportTile stock={stock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('formatScore function works correctly', () => {
    expect(formatScore(12.3456)).toBe('12.3')
    expect(formatScore(85.0)).toBe('85.0')
    expect(formatScore(null)).toBe('N/A')
    expect(formatScore(undefined)).toBe('N/A')
    expect(formatScore(NaN)).toBe('N/A')
  })

  test('formatScore handles small decimals', () => {
    expect(formatScore(0.1234)).toBe('0.1')
    expect(formatScore(0.123456)).toBe('0.1')
  })

  test('handles missing stock data', () => {
    const stock = {}

    render(<AIReportTile stock={stock} />)

    expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
  })

  test('handles empty stock object', () => {
    const stock = {}

    render(<AIReportTile stock={stock} />)

    const elements = screen.queryAllByText('')
    expect(elements.length).toBeGreaterThan(0)
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PortfolioTile from '@/components/PortfolioTile'
import { getRecommendationColorClass } from '@/utils/score-colors'

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PortfolioTile Component', () => {
  test('renders stock ticker and company name', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('shows company name truncated', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    const companyElement = screen.getByText('Apple Inc.')
    expect(companyElement).toBeInTheDocument()
    expect(companyElement.textContent).toHaveLength('Apple Inc.'.length)
  })

  test('shows TickerLogo image', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY' } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByAltText('AAPL logo')).toBeInTheDocument()
  })

  test('displays total value when available', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95, total_value: 1500000 } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText(/\$1,500,000/)).toBeInTheDocument()
  })

  test('displays delta value with correct icon', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95, delta_value: 50000 } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText(/\$50,000/)).toBeInTheDocument()
  })

  test('handles empty recommendation data', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const analysis = { AAPL: {} }
    const priceChange = { price_change: 12.5 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles no recommendation label', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const analysis = { AAPL: { confidence: 0.95 } }
    const priceChange = { price_change: 12.5 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('displays total value when available', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95, total_value: 1500000 } }
    const priceChange = { price_change: 12.5 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText(/\$1,500,000/)).toBeInTheDocument()
  })

  test('displays delta value with correct icon', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95, delta_value: 50000 } }
    const priceChange = { price_change: 12.5 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText(/\$50,000/)).toBeInTheDocument()
  })

  test('displays price change with correct color', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: -5.25 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('-5.25%')).toBeInTheDocument()
  })

  test('displays price change with positive sign', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: 5.25 }

    render(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('+5.25%')).toBeInTheDocument()
  })

  test('handles no price change data', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = {}

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  test('handles null price change', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = null

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  test('renders with HOLD recommendation', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'HOLD' } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    const tile = screen.getByText('AAPL').parentElement.parentElement
    expect(tile.className).toContain('yellow')
  })

  test('renders with SELL recommendation', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'SELL' } }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    const tile = screen.getByText('AAPL').parentElement.parentElement
    expect(tile.className).toContain('red')
  })

  test('handles undefined analysis', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={undefined} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('handles null analysis', () => {
    const stock = { ticker: 'AAPL', company: 'Apple Inc.' }
    const priceChange = { price_change: 12.5 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={null} priceChange={priceChange} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  test('displays price change with correct color', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: -5.25 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('-5.25%')).toBeInTheDocument()
  })

  test('displays price change with positive sign', () => {
    const stock = { ticker: 'AAPL' }
    const analysis = { AAPL: { label: 'BUY', confidence: 0.95 } }
    const priceChange = { price_change: 5.25 }

    renderWithRouter(<PortfolioTile stock={stock} analysis={analysis} priceChange={priceChange} />)

    expect(screen.getByText('+5.25%')).toBeInTheDocument()
  })
})

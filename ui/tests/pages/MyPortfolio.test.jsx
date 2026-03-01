import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MyPortfolio from '@/pages/MyPortfolio'
import { searchStocks } from '@/api/stocks'
import {
  getPortfolioFromStorage,
  getAllAvailableQuarters,
  getStockRecommendation,
  getStockHolders,
  addToPortfolio,
  removeFromPortfolio,
  isStockInPortfolio,
} from '@/api/portfolio'

vi.mock('@/api/stocks')
vi.mock('@/api/portfolio')

global.localStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(() => {}),
  removeItem: vi.fn(() => {}),
  clear: vi.fn(() => {}),
}

const renderMyPortfolio = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('MyPortfolio Page', () => {
  test('renders loading spinner initially', async () => {
    getPortfolioFromStorage.mockResolvedValue([])
    getAllAvailableQuarters.mockResolvedValue([])

    renderMyPortfolio(<MyPortfolio />)

    await waitFor(() => {
      expect(screen.getByText('Loading portfolio...')).toBeInTheDocument()
    })
  })
})
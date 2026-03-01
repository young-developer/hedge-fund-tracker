import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  test('renders with default message', () => {
    render(<LoadingSpinner message="Loading..." />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders with custom message', () => {
    render(<LoadingSpinner message="Fetching data..." />)

    expect(screen.getByText('Fetching data...')).toBeInTheDocument()
  })

  test('renders with long message', () => {
    const longMessage = 'Loading all the data from the server...'

    render(<LoadingSpinner message={longMessage} />)

    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  test('renders without message prop', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders multiple times with different messages', () => {
    const { rerender } = render(<LoadingSpinner message="Loading..." />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    rerender(<LoadingSpinner message="Processing..." />)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  test('renders with emoji message', () => {
    render(<LoadingSpinner message="⏳ Processing data..." />)

    expect(screen.getByText('⏳ Processing data...')).toBeInTheDocument()
  })

  test('renders with status update message', () => {
    render(<LoadingSpinner message="Updating database..." />)

    expect(screen.getByText('Updating database...')).toBeInTheDocument()
  })

  test('renders with error message', () => {
    render(<LoadingSpinner message="Error loading data..." />)

    expect(screen.getByText('Error loading data...')).toBeInTheDocument()
  })

  test('renders with success message', () => {
    render(<LoadingSpinner message="Data loaded successfully!" />)

    expect(screen.getByText('Data loaded successfully!')).toBeInTheDocument()
  })

  test('renders with technical term message', () => {
    render(<LoadingSpinner message="Fetching API response..." />)

    expect(screen.getByText('Fetching API response...')).toBeInTheDocument()
  })

  test('renders with short message', () => {
    render(<LoadingSpinner message="Loading" />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  test('renders with multiple words message', () => {
    render(<LoadingSpinner message="Loading all stocks..." />)

    expect(screen.getByText('Loading all stocks...')).toBeInTheDocument()
  })
})

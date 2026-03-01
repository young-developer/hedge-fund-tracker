import { render, screen } from '@testing-library/react'
import Card from '@/components/Card'

describe('Card Component', () => {
  test('renders with children', () => {
    render(<Card>Test content</Card>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  test('renders with custom content', () => {
    render(<Card>Custom card content</Card>)
    expect(screen.getByText('Custom card content')).toBeInTheDocument()
  })

  test('renders with multiple children', () => {
    render(
      <Card>
        <p>Line 1</p>
        <p>Line 2</p>
      </Card>
    )
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
  })

  test('renders with numeric content', () => {
    render(<Card>123456</Card>)
    expect(screen.getByText('123456')).toBeInTheDocument()
  })

  test('renders with decimal content', () => {
    render(<Card>123.456</Card>)
    expect(screen.getByText('123.456')).toBeInTheDocument()
  })

  test('renders with negative content', () => {
    render(<Card>-123</Card>)
    expect(screen.getByText('-123')).toBeInTheDocument()
  })

  test('renders with zero content', () => {
    render(<Card>0</Card>)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('renders with short content', () => {
    render(<Card>Short</Card>)
    expect(screen.getByText('Short')).toBeInTheDocument()
  })

  test('renders with long content', () => {
    const longContent = 'This is a very long piece of content that should be displayed in the card component.'
    render(<Card>{longContent}</Card>)
    expect(screen.getByText(longContent)).toBeInTheDocument()
  })

  test('renders with empty content', () => {
    render(<Card></Card>)
    
    const card = screen.queryByRole("div") || document.querySelector(".bg-white"); expect(card).toBeInTheDocument();
  })

  test('renders with className prop', () => {
    render(<Card className="custom-class">Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('renders with React elements as children', () => {
    render(
      <Card>
        <span>Span content</span>
      </Card>
    )
    expect(screen.getByText('Span content')).toBeInTheDocument()
  })

  test('renders with array of children', () => {
    render(
      <Card>
        {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </Card>
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})

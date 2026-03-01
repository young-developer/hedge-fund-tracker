import { render, screen } from '@testing-library/react'
import TickerLogo from '@/components/TickerLogo'

describe('TickerLogo Component', () => {
  test('renders ticker symbol', () => {
    render(<TickerLogo ticker="AAPL" />)

    expect(screen.getByAltText('AAPL logo')).toBeInTheDocument()
  })

  test('renders uppercase ticker', () => {
    render(<TickerLogo ticker="aapl" />)

    expect(screen.getByAltText('aapl logo')).toBeInTheDocument()
  })

  test('renders lowercase ticker', () => {
    render(<TickerLogo ticker="aapl" />)

    expect(screen.getByAltText('aapl logo')).toBeInTheDocument()
  })

  test('renders mixed case ticker', () => {
    render(<TickerLogo ticker="ApPl" />)

    expect(screen.getByAltText('ApPl logo')).toBeInTheDocument()
  })

  test('renders long ticker symbol', () => {
    const longTicker = 'MSFT'

    render(<TickerLogo ticker={longTicker} />)

    expect(screen.getByAltText('MSFT logo')).toBeInTheDocument()
  })

  test('renders ticker with multiple letters', () => {
    render(<TickerLogo ticker="AMZN" />)

    expect(screen.getByAltText('AMZN logo')).toBeInTheDocument()
  })

  test('renders ticker with number', () => {
    render(<TickerLogo ticker="MSFT" />)

    expect(screen.getByAltText('MSFT logo')).toBeInTheDocument()
  })

  test('handles undefined ticker', () => {
    render(<TickerLogo ticker={undefined} />)

    const element = screen.queryByAltText('AAPL logo')
    expect(element).toBeNull()
  })

  test('handles null ticker', () => {
    render(<TickerLogo ticker={null} />)

    const element = screen.queryByAltText('AAPL logo')
    expect(element).toBeNull()
  })

  test('handles empty string ticker', () => {
    render(<TickerLogo ticker="" />)

    const element = screen.queryByAltText('AAPL logo')
    expect(element).toBeNull()
  })

  test('renders ticker with special characters', () => {
    render(<TickerLogo ticker="AAPL1" />)

    expect(screen.getByAltText('AAPL1 logo')).toBeInTheDocument()
  })

  test('renders ticker with multiple special characters', () => {
    render(<TickerLogo ticker="AAPL-1" />)

    expect(screen.getByAltText('AAPL-1 logo')).toBeInTheDocument()
  })

  test('renders ticker with dollar sign', () => {
    render(<TickerLogo ticker="$AAPL" />)

    expect(screen.getByAltText('$AAPL logo')).toBeInTheDocument()
  })

  test('renders ticker with plus sign', () => {
    render(<TickerLogo ticker="+AAPL" />)

    expect(screen.getByAltText('+AAPL logo')).toBeInTheDocument()
  })

  test('renders ticker with underscore', () => {
    render(<TickerLogo ticker="AAPL_" />)

    expect(screen.getByAltText('AAPL_ logo')).toBeInTheDocument()
  })

  test('renders ticker with dash', () => {
    render(<TickerLogo ticker="AAPL-" />)

    expect(screen.getByAltText('AAPL- logo')).toBeInTheDocument()
  })

  test('renders ticker with dot', () => {
    render(<TickerLogo ticker="AAPL." />)

    expect(screen.getByAltText('AAPL. logo')).toBeInTheDocument()
  })

  test('renders ticker with multiple dots', () => {
    render(<TickerLogo ticker="AAPL..XYZ" />)

    expect(screen.getByAltText('AAPL..XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with slash', () => {
    render(<TickerLogo ticker="AAPL/XYZ" />)

    expect(screen.getByAltText('AAPL/XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with ampersand', () => {
    render(<TickerLogo ticker="AAPL&XYZ" />)

    expect(screen.getByAltText('AAPL&XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with hash', () => {
    render(<TickerLogo ticker="AAPL#XYZ" />)

    expect(screen.getByAltText('AAPL#XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with percent', () => {
    render(<TickerLogo ticker="AAPL%XYZ" />)

    expect(screen.getByAltText('AAPL%XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with plus sign and multiple letters', () => {
    render(<TickerLogo ticker="+AAPL" />)

    expect(screen.getByAltText('+AAPL logo')).toBeInTheDocument()
  })

  test('renders ticker with star', () => {
    render(<TickerLogo ticker="AAPL*" />)

    expect(screen.getByAltText('AAPL* logo')).toBeInTheDocument()
  })

  test('renders ticker with caret', () => {
    render(<TickerLogo ticker="AAPL^" />)

    expect(screen.getByAltText('AAPL^ logo')).toBeInTheDocument()
  })

  test('renders ticker with question mark', () => {
    render(<TickerLogo ticker="AAPL?" />)

    expect(screen.getByAltText('AAPL? logo')).toBeInTheDocument()
  })

  test('renders ticker with exclamation mark', () => {
    render(<TickerLogo ticker="AAPL!" />)

    expect(screen.getByAltText('AAPL! logo')).toBeInTheDocument()
  })

  test('renders ticker with parenthesis', () => {
    render(<TickerLogo ticker="AAPL(XYZ)" />)

    expect(screen.getByAltText('AAPL(XYZ) logo')).toBeInTheDocument()
  })

  test('renders ticker with square brackets', () => {
    render(<TickerLogo ticker="AAPL[XYZ]" />)

    expect(screen.getByAltText('AAPL[XYZ] logo')).toBeInTheDocument()
  })

  test('renders ticker with curly braces', () => {
    render(<TickerLogo ticker="AAPL{XYZ}" />)

    expect(screen.getByAltText('AAPL{XYZ} logo')).toBeInTheDocument()
  })

  test('renders ticker with angle brackets', () => {
    render(<TickerLogo ticker="AAPL<XYZ>" />)

    expect(screen.getByAltText('AAPL<XYZ> logo')).toBeInTheDocument()
  })

  test('renders ticker with vertical bar', () => {
    render(<TickerLogo ticker="AAPL|XYZ" />)

    expect(screen.getByAltText('AAPL|XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with equals sign', () => {
    render(<TickerLogo ticker="AAPL=XYZ" />)

    expect(screen.getByAltText('AAPL=XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with tilde', () => {
    render(<TickerLogo ticker="AAPL~XYZ" />)

    expect(screen.getByAltText('AAPL~XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with colon', () => {
    render(<TickerLogo ticker="AAPL:XYZ" />)

    expect(screen.getByAltText('AAPL:XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with semicolon', () => {
    render(<TickerLogo ticker="AAPL;XYZ" />)

    expect(screen.getByAltText('AAPL;XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with comma', () => {
    render(<TickerLogo ticker="AAPL,XYZ" />)

    expect(screen.getByAltText('AAPL,XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with space', () => {
    render(<TickerLogo ticker="AAPL XYZ" />)

    expect(screen.getByAltText('AAPL XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with hyphen', () => {
    render(<TickerLogo ticker="AAPL-XYZ" />)

    expect(screen.getByAltText('AAPL-XYZ logo')).toBeInTheDocument()
  })

  test('renders ticker with apostrophe', () => {
    render(<TickerLogo ticker="AAPL'XYZ" />)

    expect(screen.getByAltText("AAPL'XYZ logo")).toBeInTheDocument()
  })

  test('renders ticker with quote', () => {
    const tickerWithQuote = 'AAPL"XYZ'
    render(<TickerLogo ticker={tickerWithQuote} />)

    expect(screen.getByAltText('AAPL"XYZ logo')).toBeInTheDocument()
  })




  test('renders ticker with escape character', () => {
  })

  test('renders ticker with unicode character', () => {
    render(<TickerLogo ticker="AAPL™" />)

    expect(screen.getByAltText('AAPL™ logo')).toBeInTheDocument()
  })

  test('renders ticker with emoji', () => {
    render(<TickerLogo ticker="AAPL🚀" />)

    expect(screen.getByAltText('AAPL🚀 logo')).toBeInTheDocument()
  })

  test('renders ticker with multiple emojis', () => {
    render(<TickerLogo ticker="AAPL🚀📈" />)

    expect(screen.getByAltText('AAPL🚀📈 logo')).toBeInTheDocument()
  })

  test('renders ticker with combination of special characters and letters', () => {
    render(<TickerLogo ticker="AAPL-1.0" />)

    expect(screen.getByAltText('AAPL-1.0 logo')).toBeInTheDocument()
  })
})

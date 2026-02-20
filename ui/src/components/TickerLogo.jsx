import { useEffect, useState } from 'react'

export default function TickerLogo({ ticker }) {
  const [logoUrl, setLogoUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (ticker && !error) {
      setLogoUrl(`https://cdn.brandfetch.io/ticker/${ticker}?c=${import.meta.env.VITE_BRANDFETCH_API_KEY}`)
    }
  }, [ticker, error])

  if (!ticker || error) {
    return null
  }

  return (
    <img
      src={logoUrl}
      alt={`${ticker} logo`}
      title={ticker}
      className="w-8 h-8 object-contain"
      onError={() => {
        setError(true)
      }}
    />
  )
}

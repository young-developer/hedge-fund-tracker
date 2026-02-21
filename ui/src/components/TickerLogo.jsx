export default function TickerLogo({ticker}) {
  if (!ticker) {
    return null
  }

  return (
      <img
          src={`https://cdn.brandfetch.io/ticker/${ticker}?c=${import.meta.env.VITE_BRANDFETCH_API_KEY}`}
          alt={`${ticker} logo`}
          title={ticker}
          className="w-8 h-8 object-contain"
      />
  )
}

export const getTileColor = (promiseScore, riskScore) => {
  const combinedScore = promiseScore - riskScore

  if (combinedScore > 58) {
    return 'green'
  } else if (combinedScore > 27) {
    return 'yellow'
  } else {
    return 'red'
  }
}

export const getTileClass = (color) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      scoreBg: 'bg-green-100',
      scoreText: 'text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      scoreBg: 'bg-yellow-100',
      scoreText: 'text-yellow-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      scoreBg: 'bg-red-100',
      scoreText: 'text-red-700'
    }
  }
  return colorClasses[color] || colorClasses.red
}

export const formatScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) return 'N/A'
  return score.toFixed(1)
}

export const getRecommendationColorClass = (recommendation) => {
  switch (recommendation) {
    case 'BUY':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'SELL':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'HOLD':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

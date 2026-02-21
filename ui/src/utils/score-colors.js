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

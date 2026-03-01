import {
  getTileColor,
  getTileClass,
  formatScore,
  getRecommendationColorClass,
} from '@/utils/score-colors'

describe('Score Colors Utilities', () => {
  describe('getTileColor', () => {
    test('returns green for high promise and low risk (combined > 58)', () => {
      expect(getTileColor(70, 10)).toBe('green')
      expect(getTileColor(80, 10)).toBe('green')
      expect(getTileColor(90, 10)).toBe('green')
      expect(getTileColor(100, 10)).toBe('green')
      expect(getTileColor(85, 15)).toBe('green')
      expect(getTileColor(80, 20)).toBe('green')
    })

    test('returns green for exact boundary (combined = 59)', () => {
      expect(getTileColor(60, 1)).toBe('green')
      expect(getTileColor(59, 0)).toBe('green')
    })

    test('returns yellow for medium risk (combined > 27 and <= 58)', () => {
      expect(getTileColor(50, 20)).toBe('yellow')
      expect(getTileColor(45, 15)).toBe('yellow')
      expect(getTileColor(40, 10)).toBe('yellow')
      expect(getTileColor(35, 5)).toBe('yellow')
      expect(getTileColor(30, 0)).toBe('yellow')
    })

    test('returns yellow for exact boundary (combined = 28)', () => {
      expect(getTileColor(28, 0)).toBe('yellow')
      expect(getTileColor(29, 1)).toBe('yellow')
    })

    test('returns red for low promise and high risk (combined <= 27)', () => {
      expect(getTileColor(20, 10)).toBe('red')
      expect(getTileColor(15, 10)).toBe('red')
      expect(getTileColor(10, 10)).toBe('red')
      expect(getTileColor(5, 5)).toBe('red')
      expect(getTileColor(0, 0)).toBe('red')
      expect(getTileColor(27, 0)).toBe('red')
      expect(getTileColor(20, 7)).toBe('red')
    })

    test('returns red for negative combined score', () => {
      expect(getTileColor(10, 20)).toBe('red')
      expect(getTileColor(5, 15)).toBe('red')
      expect(getTileColor(0, 10)).toBe('red')
      expect(getTileColor(-10, 10)).toBe('red')
    })

    test('handles equal promise and risk scores', () => {
      expect(getTileColor(50, 50)).toBe('red')
      expect(getTileColor(40, 40)).toBe('red')
      expect(getTileColor(30, 30)).toBe('red')
      expect(getTileColor(20, 20)).toBe('red')
      expect(getTileColor(10, 10)).toBe('red')
    })

    test('handles high promise with high risk', () => {
      expect(getTileColor(90, 80)).toBe('red')
      expect(getTileColor(80, 70)).toBe('red')
      expect(getTileColor(70, 60)).toBe('red')
    })

    test('handles low promise with low risk', () => {
      expect(getTileColor(10, 5)).toBe('red')
      expect(getTileColor(20, 10)).toBe('red')
      expect(getTileColor(30, 15)).toBe('red')
    })

    test('handles zero scores', () => {
      expect(getTileColor(0, 0)).toBe('red')
    })

    test('handles maximum scores', () => {
      expect(getTileColor(100, 0)).toBe('green')
      expect(getTileColor(100, 10)).toBe('green')
    })

    test('handles undefined promise score', () => {
      expect(getTileColor(undefined, 10)).toBe('red')
    })

    test('handles undefined risk score', () => {
      expect(getTileColor(50, undefined)).toBe('red')
    })

    test('handles null scores', () => {
      expect(getTileColor(null, 10)).toBe('red')
      expect(getTileColor(50, null)).toBe('yellow')
      expect(getTileColor(null, null)).toBe('red')
    })

    test('handles NaN scores', () => {
      expect(getTileColor(NaN, 10)).toBe('red')
      expect(getTileColor(50, NaN)).toBe('red')
      expect(getTileColor(NaN, NaN)).toBe('red')
    })

    test('handles negative promise score', () => {
      expect(getTileColor(-10, 10)).toBe('red')
      expect(getTileColor(-20, 5)).toBe('red')
    })

    test('handles negative risk score', () => {
      expect(getTileColor(50, -10)).toBe('green')
      expect(getTileColor(40, -5)).toBe('yellow')
    })
  })

  describe('getTileClass', () => {
    test('returns correct classes for green', () => {
      const classes = getTileClass('green')
      expect(classes.bg).toBe('bg-green-50')
      expect(classes.border).toBe('border-green-200')
      expect(classes.text).toBe('text-green-800')
      expect(classes.scoreBg).toBe('bg-green-100')
      expect(classes.scoreText).toBe('text-green-700')
    })

    test('returns correct classes for yellow', () => {
      const classes = getTileClass('yellow')
      expect(classes.bg).toBe('bg-yellow-50')
      expect(classes.border).toBe('border-yellow-200')
      expect(classes.text).toBe('text-yellow-800')
      expect(classes.scoreBg).toBe('bg-yellow-100')
      expect(classes.scoreText).toBe('text-yellow-700')
    })

    test('returns correct classes for red', () => {
      const classes = getTileClass('red')
      expect(classes.bg).toBe('bg-red-50')
      expect(classes.border).toBe('border-red-200')
      expect(classes.text).toBe('text-red-800')
      expect(classes.scoreBg).toBe('bg-red-100')
      expect(classes.scoreText).toBe('text-red-700')
    })

    test('returns red classes for unknown color', () => {
      const classes = getTileClass('unknown')
      expect(classes.bg).toBe('bg-red-50')
      expect(classes.border).toBe('border-red-200')
      expect(classes.text).toBe('text-red-800')
      expect(classes.scoreBg).toBe('bg-red-100')
      expect(classes.scoreText).toBe('text-red-700')
    })

    test('returns red classes for empty string', () => {
      const classes = getTileClass('')
      expect(classes.bg).toBe('bg-red-50')
    })

    test('returns red classes for null', () => {
      const classes = getTileClass(null)
      expect(classes.bg).toBe('bg-red-50')
    })

    test('returns red classes for undefined', () => {
      const classes = getTileClass(undefined)
      expect(classes.bg).toBe('bg-red-50')
    })
  })

  describe('formatScore', () => {
    test('formats score to 1 decimal place', () => {
      expect(formatScore(12.3456)).toBe('12.3')
      expect(formatScore(85.1234)).toBe('85.1')
      expect(formatScore(50.5678)).toBe('50.6')
    })

    test('rounds correctly', () => {
      expect(formatScore(12.34)).toBe('12.3')
      expect(formatScore(12.35)).toBe('12.3')
      expect(formatScore(12.36)).toBe('12.4')
    })

    test('handles whole numbers', () => {
      expect(formatScore(10)).toBe('10.0')
      expect(formatScore(50)).toBe('50.0')
      expect(formatScore(100)).toBe('100.0')
    })

    test('handles zero', () => {
      expect(formatScore(0)).toBe('0.0')
    })

    test('handles negative numbers', () => {
      expect(formatScore(-10.5678)).toBe('-10.6')
      expect(formatScore(-50.1234)).toBe('-50.1')
    })

    test('handles null', () => {
      expect(formatScore(null)).toBe('N/A')
    })

    test('handles undefined', () => {
      expect(formatScore(undefined)).toBe('N/A')
    })

    test('handles NaN', () => {
      expect(formatScore(NaN)).toBe('N/A')
    })

    test('handles very small decimals', () => {
      expect(formatScore(0.1234)).toBe('0.1')
      expect(formatScore(0.0123)).toBe('0.0')
    })

    test('handles very large numbers', () => {
      expect(formatScore(1000.5678)).toBe('1000.6')
      expect(formatScore(9999.1234)).toBe('9999.1')
    })
  })

  describe('getRecommendationColorClass', () => {
    test('returns correct class for BUY', () => {
      const className = getRecommendationColorClass('BUY')
      expect(className).toBe('bg-green-100 text-green-800 border-green-300')
    })

    test('returns correct class for SELL', () => {
      const className = getRecommendationColorClass('SELL')
      expect(className).toBe('bg-red-100 text-red-800 border-red-300')
    })

    test('returns correct class for HOLD', () => {
      const className = getRecommendationColorClass('HOLD')
      expect(className).toBe('bg-yellow-100 text-yellow-800 border-yellow-300')
    })

    test('returns gray class for unknown recommendation', () => {
      const className = getRecommendationColorClass('UNKNOWN')
      expect(className).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('returns gray class for empty string', () => {
      const className = getRecommendationColorClass('')
      expect(className).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('returns gray class for null', () => {
      const className = getRecommendationColorClass(null)
      expect(className).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('returns gray class for undefined', () => {
      const className = getRecommendationColorClass(undefined)
      expect(className).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('returns gray class for N/A', () => {
      const className = getRecommendationColorClass('N/A')
      expect(className).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('is case sensitive for BUY', () => {
      expect(getRecommendationColorClass('buy')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getRecommendationColorClass('Buy')).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('is case sensitive for SELL', () => {
      expect(getRecommendationColorClass('sell')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getRecommendationColorClass('Sell')).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('is case sensitive for HOLD', () => {
      expect(getRecommendationColorClass('hold')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getRecommendationColorClass('Hold')).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })

    test('handles special characters', () => {
      expect(getRecommendationColorClass('BUY!')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getRecommendationColorClass('SELL@')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getRecommendationColorClass('HOLD#')).toBe('bg-gray-100 text-gray-800 border-gray-300')
    })
  })

  describe('Integration tests', () => {
    test('getTileColor and getTileClass work together for green', () => {
      const color = getTileColor(70, 10)
      const classes = getTileClass(color)
      expect(color).toBe('green')
      expect(classes.bg).toBe('bg-green-50')
    })

    test('getTileColor and getTileClass work together for yellow', () => {
      const color = getTileColor(40, 10)
      const classes = getTileClass(color)
      expect(color).toBe('yellow')
      expect(classes.bg).toBe('bg-yellow-50')
    })

    test('getTileColor and getTileClass work together for red', () => {
      const color = getTileColor(20, 10)
      const classes = getTileClass(color)
      expect(color).toBe('red')
      expect(classes.bg).toBe('bg-red-50')
    })

    test('formatScore and getTileColor work together', () => {
      const score = formatScore(85.1234)
      const color = getTileColor(85, 10)
      expect(score).toBe('85.1')
      expect(color).toBe('green')
    })
  })
})
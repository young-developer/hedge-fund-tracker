import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext'

describe('DashboardContext', () => {
  const wrapper = ({ children }) => (
    <DashboardProvider>{children}</DashboardProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDashboard', () => {
    test('provides dashboardData', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      expect(result.current.dashboardData).toBeDefined()
      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.recentFilings).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
      expect(result.current.dashboardData.lastDatabaseUpdate).toBe(null)
    })

    test('provides loading state', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      expect(result.current.loading).toBe(true)
    })

    test('throws error when used outside DashboardProvider', () => {
      expect(() => renderHook(() => useDashboard())).toThrow('useDashboard must be used within DashboardProvider')
    })
  })

  describe('updateQuarters', () => {
    test('updates availableQuarters count', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024'])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(2)
    })

    test('updates lastUpdated to first quarter', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024', 'Q3 2024'])
      })

      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024')
    })

    test('handles empty quarters array', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters([])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles null quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(null)
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles undefined quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(undefined)
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles quarters with one element', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024'])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024')
    })

    test('handles quarters with many elements', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(5)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2023')
    })
  })

  describe('updateRecentFilings', () => {
    test('updates recentFilings from data.recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: { recent_filings: [1, 2, 3] } })
      })

      expect(result.current.dashboardData.recentFilings).toBe(3)
    })

    test('updates recentFilings from recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ recent_filings: [1, 2, 3, 4] })
      })

      expect(result.current.dashboardData.recentFilings).toBe(4)
    })

    test('updates recentFilings from array', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings([1, 2, 3, 4, 5])
      })

      expect(result.current.dashboardData.recentFilings).toBe(5)
    })

    test('updates recentFilings from total_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ total_filings: 100 })
      })

      expect(result.current.dashboardData.recentFilings).toBe(100)
    })

    test('handles empty recent_filings array', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: { recent_filings: [] } })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles null recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: { recent_filings: null } })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles undefined recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: { recent_filings: undefined } })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles empty data object', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: {} })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles null input', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings(null)
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles undefined input', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings(undefined)
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles object with no recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ something: 'else' })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles nested recent_filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({ data: { recent_filings: [1, 2] } })
      })

      expect(result.current.dashboardData.recentFilings).toBe(2)
    })

    test('handles large number of filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      const largeArray = Array(1000).fill(1)
      act(() => {
        result.current.updateRecentFilings(largeArray)
      })

      expect(result.current.dashboardData.recentFilings).toBe(1000)
    })
  })

  describe('updateDashboardData', () => {
    test('updates all dashboard data at once', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024', 'Q2 2024'],
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(2)
      expect(result.current.dashboardData.recentFilings).toBe(50)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024')
    })

    test('handles empty quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: [],
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles empty filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: [],
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles null quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: null,
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles null filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: null,
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles undefined quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: undefined,
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles undefined filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: undefined,
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('updates loading to false', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      expect(result.current.loading).toBe(true)

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.loading).toBe(false)
    })

    test('handles object with no quarters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          filings: { total_filings: 50 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(0)
      expect(result.current.dashboardData.lastUpdated).toBe('N/A')
    })

    test('handles object with no filings', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
        })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })

    test('handles filings as array', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: [1, 2, 3],
        })
      })

      expect(result.current.dashboardData.recentFilings).toBe(3)
    })

    test('handles filings as number', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q1 2024'],
          filings: 100,
        })
      })

      expect(result.current.dashboardData.recentFilings).toBe(0)
    })
  })

  describe('updateLastDatabaseUpdate', () => {
    test('updates lastDatabaseUpdate timestamp', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateLastDatabaseUpdate('2024-01-15T10:30:00Z')
      })

      expect(result.current.dashboardData.lastDatabaseUpdate).toBe('2024-01-15T10:30:00Z')
    })

    test('handles null timestamp', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateLastDatabaseUpdate(null)
      })

      expect(result.current.dashboardData.lastDatabaseUpdate).toBe(null)
    })

    test('handles undefined timestamp', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateLastDatabaseUpdate(undefined)
      })

      expect(result.current.dashboardData.lastDatabaseUpdate).toBe(undefined)
    })

    test('handles empty string timestamp', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateLastDatabaseUpdate('')
      })

      expect(result.current.dashboardData.lastDatabaseUpdate).toBe('')
    })

    test('preserves other dashboard data', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024'])
        result.current.updateLastDatabaseUpdate('2024-01-15T10:30:00Z')
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.lastDatabaseUpdate).toBe('2024-01-15T10:30:00Z')
    })
  })

  describe('Multiple updates', () => {
    test('can update quarters multiple times', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024'])
      })
      expect(result.current.dashboardData.availableQuarters).toBe(1)

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024'])
      })
      expect(result.current.dashboardData.availableQuarters).toBe(2)

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024', 'Q3 2024'])
      })
      expect(result.current.dashboardData.availableQuarters).toBe(3)
    })

    test('can update filings multiple times', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings([1, 2])
      })
      expect(result.current.dashboardData.recentFilings).toBe(2)

      act(() => {
        result.current.updateRecentFilings([1, 2, 3, 4])
      })
      expect(result.current.dashboardData.recentFilings).toBe(4)
    })

    test('can update all data independently', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024'])
        result.current.updateRecentFilings([1, 2, 3])
        result.current.updateLastDatabaseUpdate('2024-01-15T10:30:00Z')
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.recentFilings).toBe(3)
      expect(result.current.dashboardData.lastDatabaseUpdate).toBe('2024-01-15T10:30:00Z')
    })

    test('updateDashboardData overrides previous updates', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024'])
        result.current.updateRecentFilings([1, 2, 3])
      })
      expect(result.current.dashboardData.availableQuarters).toBe(2)
      expect(result.current.dashboardData.recentFilings).toBe(3)

      act(() => {
        result.current.updateDashboardData({
          quarters: ['Q3 2024'],
          filings: { total_filings: 10 },
        })
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.recentFilings).toBe(10)
    })
  })

  describe('Edge cases', () => {
    test('handles quarters with special characters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024 (Test)', 'Q2 2024'])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(2)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024 (Test)')
    })

    test('handles quarters with unicode characters', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024', 'Q2 2024 日本語'])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(2)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024')
    })

    test('handles very long quarter names', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      const longQuarter = 'Q1 2024 - This is a very long quarter name that should still work correctly'
      act(() => {
        result.current.updateQuarters([longQuarter])
      })

      expect(result.current.dashboardData.availableQuarters).toBe(1)
      expect(result.current.dashboardData.lastUpdated).toBe(longQuarter)
    })

    test('handles filings with nested data', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateRecentFilings({
          data: {
            recent_filings: [
              { id: 1, title: 'Filing 1' },
              { id: 2, title: 'Filing 2' },
            ],
          },
        })
      })

      expect(result.current.dashboardData.recentFilings).toBe(2)
    })

    test('handles all updates at once', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper })

      act(() => {
        result.current.updateQuarters(['Q1 2024'])
        result.current.updateRecentFilings([1, 2, 3, 4, 5])
        result.current.updateLastDatabaseUpdate('2024-01-15T10:30:00Z')
        result.current.updateDashboardData({
          quarters: ['Q1 2024', 'Q2 2024'],
          filings: { total_filings: 100 },
        })
        result.current.updateLastDatabaseUpdate('2024-01-15T10:30:00Z')
      })

      expect(result.current.dashboardData.availableQuarters).toBe(2)
      expect(result.current.dashboardData.recentFilings).toBe(100)
      expect(result.current.dashboardData.lastUpdated).toBe('Q1 2024')
      expect(result.current.dashboardData.lastDatabaseUpdate).toBe('2024-01-15T10:30:00Z')
      expect(result.current.loading).toBe(false)
    })
  })
})
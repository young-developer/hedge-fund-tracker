import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => {
    const data = response.data
    // If response is an APIResponse wrapper and successful, return the entire response
    if (data && data.success) {
      // Check if the data is a nested object with quarter key
      if ('quarter' in data) {
        return data.quarter
      }
      // Return the entire APIResponse object
      return data
    }
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    throw error
  }
)

// Log intercepted requests for debugging
console.log('API Interceptor configured')


export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.error || error.response.data?.message || 'API request failed'
  } else if (error.request) {
    return 'No response from server'
  } else {
    return error.message
  }
}

export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0'

  const absValue = Math.abs(value)
  let formatted, label

  if (absValue >= 1e9) {
    formatted = (value / 1e9).toFixed(2)
    label = 'B'
  } else if (absValue >= 1e6) {
    formatted = (value / 1e6).toFixed(2)
    label = 'M'
  } else if (absValue >= 1e3) {
    formatted = (value / 1e3).toFixed(2)
    label = 'K'
  } else if (absValue === 0) {
    formatted = '0'
    label = ''
  } else {
    formatted = value.toFixed(2)
    label = ''
  }

  return `${formatted}${label}`
}

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'

  const absValue = Math.abs(value)

  if (absValue >= 1e9) {
    return ((value / 1e9) * 100).toFixed(decimals) + 'B'
  } else if (absValue >= 1e6) {
    return ((value / 1e6) * 100).toFixed(decimals) + 'M'
  } else if (absValue >= 1e3) {
    return ((value / 1e3) * 100).toFixed(decimals) + 'K'
  } else if (absValue === 0) {
    return '0'
  } else {
    return (value * 100).toFixed(decimals) + '%'
  }
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatNumber = (value, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export default api

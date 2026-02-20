import { Component } from 'react'
import { AlertCircle } from 'lucide-react'
import { handleApiError } from '../services/api'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorMessage: ''
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      errorMessage: handleApiError(error)
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-500">{this.state.errorMessage || 'An unexpected error occurred'}</p>
          {this.state.error && (
            <details className="mt-4">
              <summary className="text-xs text-gray-400 cursor-pointer">View error details</summary>
              <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
export default function LoadingSpinner({ size = 'large', message = 'Loading...' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-b-2 border-blue-600 animate-spin`}
      />
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  )
}
import { Spin } from 'antd'

export default function LoadingSpinner({ size = 'large', message = 'Loading...' }) {
  const antdSizeMap = {
    small: 'small',
    medium: 'default',
    large: 'large'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spin size={antdSizeMap[size]} />
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  )
}
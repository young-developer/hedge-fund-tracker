import {getCategoryColorClass} from '../api/categories'

export default function CategoryBadge({categoryId, size = 'sm'}) {
  const categoryColors = {
    my: 'blue',
    watchlist: 'green'
  }

  const category = getCategoryById(categoryId)
  const color = category?.color || categoryColors[categoryId] || 'gray'

  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0.5',
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  }

  const bgColor = getCategoryColorClass(color, 'bg')
  const textColor = getCategoryColorClass(color, 'text')

  return (
      <span className={`${bgColor} ${textColor} rounded-full font-medium ${sizeClasses[size]}`}>
        {category?.name || categoryId}
      </span>
  )
}

function getCategoryById(id) {
  try {
    const data = localStorage.getItem('portfolioCategories')
    if (data) {
      const categories = JSON.parse(data)
      return categories.find(c => c.id === id) || null
    }
    return null
  } catch (error) {
    console.error('Error getting category:', error)
    return null
  }
}

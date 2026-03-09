import {useCategories} from '../contexts/CategoryContext'
import {getCategoryColorClass} from '../api/categories'
import {Settings2} from 'lucide-react'

export default function CategoryFilter({onManageClick, compact = false}) {
  const {categories, selectedCategory, selectCategory, getCategoryCount} = useCategories()

  return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id
          const count = getCategoryCount(category.id)
          const bgColor = isActive
              ? getCategoryColorClass(category.color, 'bg')
              : 'bg-gray-100'
          const textColor = isActive
              ? getCategoryColorClass(category.color, 'text')
              : 'text-gray-600'
          const hoverClass = getCategoryColorClass(category.color, 'hover')

          return (
              <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive ? `${bgColor} ${textColor}` : `${bgColor} ${textColor} hover:${hoverClass}`
                  }`}
              >
                <span className={`w-2 h-2 rounded-full bg-${category.color}-500`}/>
                {category.name}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    isActive
                        ? 'bg-white/30'
                        : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
          )
        })}

        {onManageClick && (
            <button
                onClick={onManageClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <Settings2 className="h-4 w-4"/>
              {!compact && 'Manage'}
            </button>
        )}
      </div>
  )
}

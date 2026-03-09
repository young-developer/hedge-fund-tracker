const CATEGORIES_STORAGE_KEY = 'portfolioCategories'
const DEFAULT_COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'teal', 'indigo']

export const getDefaultCategories = () => {
  return [
    { id: 'my', name: 'My', color: 'blue', isDefault: true },
    { id: 'watchlist', name: 'Watchlist', color: 'green', isDefault: true }
  ]
}

export const getCategories = () => {
  try {
    const data = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    const defaults = getDefaultCategories()
    saveCategories(defaults)
    return defaults
  } catch (error) {
    console.error('Error reading categories from storage:', error)
    const defaults = getDefaultCategories()
    saveCategories(defaults)
    return defaults
  }
}

export const saveCategories = (categories) => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
    return true
  } catch (error) {
    console.error('Error saving categories to storage:', error)
    return false
  }
}

export const createCategory = (name, color = null) => {
  const categories = getCategories()
  
  const existingIndex = categories.findIndex(c => c.name.toLowerCase() === name.toLowerCase())
  if (existingIndex !== -1) {
    return { success: false, error: 'Category with this name already exists' }
  }

  const selectedColor = color || DEFAULT_COLORS[categories.length % DEFAULT_COLORS.length]
  const newCategory = {
    id: `custom-${Date.now()}`,
    name,
    color: selectedColor,
    isDefault: false,
    createdAt: new Date().toISOString()
  }

  categories.push(newCategory)
  saveCategories(categories)
  
  return { success: true, category: newCategory }
}

export const updateCategory = (id, updates) => {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  
  if (index === -1) {
    return { success: false, error: 'Category not found' }
  }

  if (updates.name && updates.name.trim() === '') {
    return { success: false, error: 'Category name cannot be empty' }
  }

  if (updates.name) {
    const duplicateIndex = categories.findIndex(c => 
      c.id !== id && c.name.toLowerCase() === updates.name.toLowerCase()
    )
    if (duplicateIndex !== -1) {
      return { success: false, error: 'Category with this name already exists' }
    }
  }

  categories[index] = { ...categories[index], ...updates }
  saveCategories(categories)
  
  return { success: true, category: categories[index] }
}

export const deleteCategory = (id) => {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  
  if (index === -1) {
    return { success: false, error: 'Category not found' }
  }

  if (categories[index].isDefault) {
    return { success: false, error: 'Cannot delete default categories' }
  }

  categories.splice(index, 1)
  saveCategories(categories)
  
  return { success: true }
}

export const getCategoryById = (id) => {
  const categories = getCategories()
  return categories.find(c => c.id === id) || null
}

export const getCategoryColorClass = (color, type = 'bg') => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      hover: 'hover:bg-green-200'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-200'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-200'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      hover: 'hover:bg-red-200'
    },
    pink: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-300',
      hover: 'hover:bg-pink-200'
    },
    teal: {
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      border: 'border-teal-300',
      hover: 'hover:bg-teal-200'
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      hover: 'hover:bg-indigo-200'
    }
  }
  
  return colorClasses[color]?.[type] || colorClasses.blue[type]
}

import { createContext, useContext, useState, useEffect } from 'react'
import {
  getCategories,
  getDefaultCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} from '../api/categories'

const CategoryContext = createContext()

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(getDefaultCategories())
  const [selectedCategory, setSelectedCategory] = useState('my')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadedCategories = getCategories()
    setCategories(loadedCategories)
    
    const defaultCat = loadedCategories.find(c => c.id === 'my')
    if (defaultCat) {
      setSelectedCategory('my')
    }
    setLoading(false)
  }, [])

  const handleCreateCategory = (name, color) => {
    const result = createCategory(name, color)
    if (result.success) {
      setCategories(getCategories())
      return result
    }
    return result
  }

  const handleUpdateCategory = (id, updates) => {
    const result = updateCategory(id, updates)
    if (result.success) {
      setCategories(getCategories())
      return result
    }
    return result
  }

  const handleDeleteCategory = (id) => {
    const result = deleteCategory(id)
    if (result.success) {
      setCategories(getCategories())
      if (selectedCategory === id) {
        setSelectedCategory('my')
      }
      return result
    }
    return result
  }

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const getCategoryCount = (categoryId) => {
    try {
      const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]')
      return portfolio.filter(s => {
        const stockCategory = s.categoryId || 'my'
        return stockCategory === categoryId
      }).length
    } catch (error) {
      console.error('Error getting category count:', error)
      return 0
    }
  }

  const getStocksByCategory = (portfolio, categoryId) => {
    if (categoryId === 'all') {
      return portfolio
    }
    return portfolio.filter(stock => {
      const stockCategory = stock.categoryId || 'my'
      return stockCategory === categoryId
    })
  }

  const value = {
    categories,
    selectedCategory,
    loading,
    createCategory: handleCreateCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    selectCategory: handleSelectCategory,
    getCategoryCount,
    getStocksByCategory,
    getCategoryById
  }

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider')
  }
  return context
}

import {useState, useEffect} from 'react'
import {useCategories} from '../contexts/CategoryContext'
import {getCategoryColorClass} from '../api/categories'
import {X, Trash2, Edit2, Plus} from 'lucide-react'

const AVAILABLE_COLORS = [
  {name: 'blue', label: 'Blue'},
  {name: 'green', label: 'Green'},
  {name: 'purple', label: 'Purple'},
  {name: 'orange', label: 'Orange'},
  {name: 'red', label: 'Red'},
  {name: 'pink', label: 'Pink'},
  {name: 'teal', label: 'Teal'},
  {name: 'indigo', label: 'Indigo'}
]

export default function CategoryManagerModal({onClose}) {
  const {categories, createCategory, updateCategory, deleteCategory} = useCategories()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('blue')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const handleCreateCategory = (e) => {
    e.preventDefault()
    setError('')

    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    const result = createCategory(newCategoryName.trim(), newCategoryColor)
    if (result.success) {
      setSuccess('Category created successfully')
      setNewCategoryName('')
    } else {
      setError(result.error)
    }
  }

  const handleEditClick = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    setError('')

    if (!editName.trim()) {
      setError('Category name is required')
      return
    }

    const result = updateCategory(editingId, {name: editName.trim(), color: editColor})
    if (result.success) {
      setSuccess('Category updated successfully')
      setEditingId(null)
      setEditName('')
      setEditColor('')
    } else {
      setError(result.error)
    }
  }

  const handleDeleteCategory = async (category) => {
    setError('')

    const stocksInCategory = JSON.parse(localStorage.getItem('portfolio') || '[]').filter(s => s.categoryId === category.id).length
    if (stocksInCategory > 0) {
      const confirmed = window.confirm(`This category has ${stocksInCategory} stock(s). They will be moved to "My" category. Continue?`)
      if (!confirmed) return
    }

    const result = deleteCategory(category.id)
    if (result.success) {
      setSuccess('Category deleted successfully')
    } else {
      setError(result.error)
    }
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6"/>
            </button>
          </div>

          {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                {error}
              </div>
          )}

          {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                {success}
              </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Create New Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="flex gap-3">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name (e.g., Tech Stocks)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {AVAILABLE_COLORS.map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.label}
                      </option>
                  ))}
                </select>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4"/>
                  Add
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Existing Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const bgColor = getCategoryColorClass(category.color, 'bg')
                const textColor = getCategoryColorClass(category.color, 'text')
                const count = JSON.parse(localStorage.getItem('portfolio') || '[]').filter(s => s.categoryId === category.id).length

                if (editingId === category.id) {
                  return (
                      <div key={category.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {AVAILABLE_COLORS.map((color) => (
                              <option key={color.name} value={color.name}>
                                {color.label}
                              </option>
                          ))}
                        </select>
                        <button
                            onClick={handleSaveEdit}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                            onClick={() => {
                              setEditingId(null)
                              setEditName('')
                              setEditColor('')
                            }}
                            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                  )
                }

                return (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-500">{count} stocks</span>
                        {category.isDefault && (
                            <span className="text-xs text-gray-400">(default)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!category.isDefault && (
                            <>
                              <button
                                  onClick={() => handleEditClick(category)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit category"
                              >
                                <Edit2 className="h-4 w-4"/>
                              </button>
                              <button
                                  onClick={() => handleDeleteCategory(category)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete category"
                              >
                                <Trash2 className="h-4 w-4"/>
                              </button>
                            </>
                        )}
                      </div>
                    </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  )
}

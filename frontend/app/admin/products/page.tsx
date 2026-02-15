'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getAdminCategories,
  getAdminItems,
  createAdminCategory,
  createAdminItem,
  updateAdminCategory,
  updateAdminItem,
  type AdminMenuCategory,
  type AdminMenuItem,
  ApiError,
} from '@/lib/api'

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<AdminMenuCategory[]>([])
  const [items, setItems] = useState<AdminMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | ''>('')

  // Form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  const [showItemForm, setShowItemForm] = useState(false)
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    isActive: true,
  })
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, its] = await Promise.all([
        getAdminCategories(),
        getAdminItems(filterCategory || undefined),
      ])
      setCategories(Array.isArray(cats) ? cats : [])
      setItems(Array.isArray(its) ? its : [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterCategory is the only dynamic dep
  }, [filterCategory])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAdminCategory(name)
      setNewCategoryName('')
      setShowCategoryForm(false)
      await fetchData()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not create category.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategoryId) return
    const name = editCategoryName.trim()
    if (!name) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateAdminCategory(editingCategoryId, name)
      setEditingCategoryId(null)
      setEditCategoryName('')
      await fetchData()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not update category.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = itemForm.name.trim()
    const price = parseFloat(itemForm.price)
    const categoryId = itemForm.categoryId
    if (!name || !Number.isFinite(price) || price < 0 || !categoryId) {
      setSubmitError('Name, price, and category are required.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAdminItem({
        name,
        price,
        description: itemForm.description.trim() || null,
        categoryId,
        isActive: itemForm.isActive,
      })
      setItemForm({ name: '', price: '', description: '', categoryId: '', isActive: true })
      setShowItemForm(false)
      await fetchData()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not create product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const name = itemForm.name.trim()
    const price = parseFloat(itemForm.price)
    const categoryId = itemForm.categoryId
    if (!name || !Number.isFinite(price) || price < 0 || !categoryId) {
      setSubmitError('Name, price, and category are required.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateAdminItem(editingItem.id, {
        name,
        price,
        description: itemForm.description.trim() || null,
        isActive: itemForm.isActive,
        categoryId,
      })
      setEditingItem(null)
      setItemForm({ name: '', price: '', description: '', categoryId: '', isActive: true })
      await fetchData()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not update product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (item: AdminMenuItem) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateAdminItem(item.id, { isActive: !item.isActive })
      await fetchData()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not update product.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEditItem = (item: AdminMenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      categoryId: item.categoryId,
      isActive: item.isActive,
    })
    setShowItemForm(false)
  }

  const filteredItems = filterCategory
    ? items.filter((i) => i.categoryId === filterCategory)
    : items

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Products
        </h1>
        <p className="mt-1 text-sm text-venue-muted">
          Manage menu categories and items
        </p>
      </header>

      {error && (
        <p className="mb-6 text-sm text-red-600">{error}</p>
      )}

      {/* Categories */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-venue-primary">Categories</h2>
          <button
            type="button"
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="btn-primary text-sm"
          >
            {showCategoryForm ? 'Cancel' : 'Add category'}
          </button>
        </div>
        {showCategoryForm && (
          <Card className="mb-4 p-4">
            <form onSubmit={handleCreateCategory} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="input-field max-w-xs"
                disabled={submitting}
              />
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Adding…' : 'Add'}
              </button>
            </form>
          </Card>
        )}
        {editingCategoryId && (
          <Card className="mb-4 p-4">
            <form onSubmit={handleUpdateCategory} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Category name"
                className="input-field max-w-xs"
                disabled={submitting}
              />
              <button type="submit" disabled={submitting} className="btn-primary">
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditingCategoryId(null); setEditCategoryName('') }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </form>
          </Card>
        )}
        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Add a category to create menu items."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-xl border border-venue-border bg-white px-4 py-2 shadow-card"
              >
                {editingCategoryId === c.id ? null : (
                  <>
                    <span className="font-medium text-venue-primary">{c.name}</span>
                    <span className="text-sm text-venue-muted">({c.count})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(c.id)
                        setEditCategoryName(c.name)
                      }}
                      className="text-sm text-venue-primary hover:underline"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-venue-primary">Products</h2>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field w-auto max-w-[180px]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null)
              setItemForm({
                name: '',
                price: '',
                description: '',
                categoryId: categories[0]?.id ?? '',
                isActive: true,
              })
              setShowItemForm(!showItemForm)
            }}
            className="btn-primary text-sm"
          >
            {showItemForm || editingItem ? 'Cancel' : 'Add product'}
          </button>
        </div>

        {(showItemForm || editingItem) && (
          <Card className="mb-6 p-6">
            <h3 className="mb-4 font-semibold text-venue-primary">
              {editingItem ? 'Edit product' : 'New product'}
            </h3>
            <form
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="Product name"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
                  className="input-field w-32"
                  placeholder="0.00"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Category</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="input-field"
                  required
                  disabled={submitting}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Description (optional)</label>
                <input
                  type="text"
                  value={itemForm.description}
                  onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                  className="input-field"
                  placeholder="Short description"
                  disabled={submitting}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={itemForm.isActive}
                  onChange={(e) => setItemForm((f) => ({ ...f, isActive: e.target.checked }))}
                  disabled={submitting}
                />
                <label htmlFor="isActive" className="text-sm text-venue-primary">
                  Active (visible to guests)
                </label>
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving…' : editingItem ? 'Save' : 'Add product'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => { setEditingItem(null); setItemForm({ name: '', price: '', description: '', categoryId: '', isActive: true }) }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>
        )}

        {filteredItems.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add products to display in the guest menu."
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-venue-primary">{item.name}</h3>
                    <Badge variant={item.isActive ? 'available' : 'occupied'}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-venue-muted">{item.description}</p>
                  )}
                  <p className="mt-1 text-sm font-medium text-venue-primary">
                    ${Number(item.price).toFixed(2)} · {item.category?.name ?? '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditItem(item)}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    disabled={submitting}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    {item.isActive ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

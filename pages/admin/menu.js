'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminMenu() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', category: '', price: '', available: true })
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = ['Starters', 'Main Course', 'Rice & Noodles', 'Breads', 'Beverages', 'Desserts']

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) router.push('/admin/login')
    else fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setMenuItems(data.items || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch menu:', err)
      setLoading(false)
    }
  }

  const handleAddOrUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('adminToken')
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/menu/${editingId}` : '/api/admin/menu'

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchMenuItems()
        setFormData({ name: '', category: '', price: '', available: true })
        setShowAddForm(false)
        setEditingId(null)
      }
    } catch (err) {
      console.error('Failed to save item:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) fetchMenuItems()
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const handleEdit = (item) => {
    setFormData(item)
    setEditingId(item._id)
    setShowAddForm(true)
  }

  const filteredItems = filterCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === filterCategory)

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">Loading...</div>

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Menu Management</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken')
              router.push('/admin/login')
            }}
            className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
          >
            <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
              </svg>
            </div>
            <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              Logout
            </div>
          </button>
        </div>
      </header>

      <div className="container py-6">
        {/* Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/orders', label: 'Orders' },
            { href: '/admin/payments', label: 'Payments' },
            { href: '/admin/menu', label: 'Menu' },
            { href: '/admin/settings', label: 'Settings' },
            { href: '/admin/analytics', label: 'Analytics' }
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded whitespace-nowrap text-sm font-semibold transition ${
                router.pathname === tab.href
                  ? 'bg-[var(--petuk-orange)] text-white'
                  : 'bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Add Item Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingId(null)
              setFormData({ name: '', category: '', price: '', available: true })
            }}
            className="px-4 py-2 bg-[var(--petuk-orange)] text-white rounded font-semibold hover:bg-[var(--petuk-orange)]/80 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add New Item'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleAddOrUpdate} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none font-semibold cursor-pointer"
              >
                <option value="" className="bg-[var(--petuk-charcoal)] text-[var(--petuk-offwhite)]">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[var(--petuk-charcoal)] text-[var(--petuk-offwhite)]">{cat}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
              />
              <label className="flex items-center gap-2 text-[var(--petuk-offwhite)]">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Available</span>
              </label>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--petuk-orange)] text-white rounded font-semibold hover:bg-[var(--petuk-orange)]/80 transition"
            >
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        )}

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No items found
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item._id} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4 hover:border-[var(--petuk-orange)]/60 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-[var(--petuk-offwhite)]">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${item.available ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {item.available ? 'Available' : 'Out'}
                  </span>
                </div>
                <div className="text-xl font-bold text-[var(--petuk-orange)] mb-4">₹{item.price}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-1 bg-[var(--petuk-orange)]/20 border border-[var(--petuk-orange)]/50 text-[var(--petuk-orange)] rounded text-xs font-semibold hover:bg-[var(--petuk-orange)]/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 px-3 py-1 bg-red-900/20 border border-red-900/50 text-red-400 rounded text-xs font-semibold hover:bg-red-900/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

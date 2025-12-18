import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function OrderDetail() {
	const router = useRouter()
	const { id } = router.query
	const [order, setOrder] = useState(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [status, setStatus] = useState('')
	const [internalNotes, setInternalNotes] = useState('')

	useEffect(() => {
		if (!id) return
		fetchOrder()
	}, [id])

	const fetchOrder = async () => {
		setLoading(true)
		try {
			const token = localStorage.getItem('adminToken')
			const res = await fetch(`/api/admin/orders/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) throw new Error('Failed to fetch')
			const data = await res.json()
			setOrder(data.order || data)
			setStatus(data.order?.status || data.status || '')
			setInternalNotes(data.order?.internalNotes || data.internalNotes || '')
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		setSaving(true)
		try {
			const token = localStorage.getItem('adminToken')
			const res = await fetch(`/api/admin/orders/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ status, internalNotes })
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Failed to save')
			setOrder(data.order || data)
			alert('Order updated')
		} catch (err) {
			console.error(err)
			alert(err.message || 'Failed to update')
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--petuk-orange)]">Loading...</div>

	if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400">Order not found</div>

	return (
		<div className="min-h-screen bg-[var(--petuk-charcoal)]">
			<div className="container py-6">
				<button className="mb-4 text-xs text-[var(--petuk-orange)] hover:underline" onClick={() => router.back()}>← Back</button>

				<div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
					<h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-2">Order {order.order_id}</h2>
					<div className="text-sm text-gray-400 mb-4">Placed: {new Date(order.createdAt).toLocaleString()}</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div>
							<h3 className="text-sm text-gray-300 font-semibold mb-2">Customer</h3>
							<div className="text-sm text-[var(--petuk-offwhite)]">{order.customer?.name} · {order.customer?.phone}</div>
							<div className="text-sm text-gray-400 mt-2">Address: {order.delivery_address || 'N/A'}</div>
						</div>

						<div>
							<h3 className="text-sm text-gray-300 font-semibold mb-2">Payment</h3>
							<div className="text-sm text-[var(--petuk-offwhite)]">Method: {order.payment_method || 'N/A'}</div>
							<div className="text-sm text-gray-400">Status: {order.payment_status || 'N/A'}</div>
						</div>
					</div>

					<div className="mb-6">
						<h3 className="text-sm text-gray-300 font-semibold mb-2">Items</h3>
						<ul className="text-sm text-[var(--petuk-offwhite)]">
							{(order.items || []).map((it, idx) => (
								<li key={idx} className="py-1 border-b border-[var(--petuk-orange)]/10">{it.name} × {it.qty} — ₹{it.price}</li>
							))}
						</ul>
					</div>

					<div className="mb-6">
						<h3 className="text-sm text-gray-300 font-semibold mb-2">Status</h3>
						<select className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded px-3 py-2 text-sm w-full md:w-1/2" value={status} onChange={e => setStatus(e.target.value)}>
							{['placed','confirmed','preparing','ready','delivered','cancelled'].map(s => (
								<option key={s} value={s}>{s}</option>
							))}
						</select>
					</div>

					<div className="mb-6">
						<h3 className="text-sm text-gray-300 font-semibold mb-2">Internal Notes</h3>
						<textarea className="w-full md:w-1/2 bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-3 text-sm" rows="4" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} />
					</div>

					<div className="flex gap-3">
						<button className="btn-uiverse" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
						<button className="btn-uiverse-outline" onClick={() => router.push('/admin/orders')}>Back to Orders</button>
					</div>
				</div>
			</div>
		</div>
	)
}

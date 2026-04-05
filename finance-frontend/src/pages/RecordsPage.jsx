import { useEffect, useState, useCallback } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const CATS = ['Salary', 'Freelance', 'Investment', 'Business', 'Food', 'Transport', 'Utilities',
  'Healthcare', 'Education', 'Entertainment', 'Shopping', 'Rent', 'Subscriptions', 'Other']

const EMPTY = { amount: '', type: 'expense', category: '', note: '', date: '' }

function Skel() {
  return (
    <tr className="border-b border-gray-50">
      {[120, 80, 100, 160, 90, 60].map((w, i) => (
        <td key={i} className="px-5 py-3.5"><div className={`skeleton h-4 rounded`} style={{ width: w }} /></td>
      ))}
    </tr>
  )
}

export default function RecordsPage() {
  const { can } = useAuth()
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' })
  const [modal, setModal] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  const fetch = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const { data } = await api.get('/records', { params })
      setRecords(data.records)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetch(1) }, [fetch])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setFormErr(''); setModal('form') }
  const openEdit = r => { setForm({ amount: r.amount, type: r.type, category: r.category, note: r.note || '', date: r.date?.slice(0, 10) || '' }); setEditId(r._id); setFormErr(''); setModal('form') }
  const close = () => { setModal(null); setEditId(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormErr('')
    setSaving(true)
    try {
      const body = { ...form, amount: Number(form.amount) }
      if (editId) await api.put(`/records/${editId}`, body)
      else await api.post('/records', body)
      close()
      fetch(pagination.page)
    } catch (err) {
      const e = err.response?.data
      setFormErr(e?.details?.[0]?.message || e?.error || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this record?')) return
    try { await api.delete(`/records/${id}`); fetch(pagination.page) }
    catch (err) { alert(err.response?.data?.error || 'Delete failed.') }
  }

  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center justify-between page-header mb-0">
        <div>
          <h1 className="page-title">Records</h1>
          <p className="page-sub">{pagination.total} transactions</p>
        </div>
        {can('admin') && (
          <button onClick={openAdd} className="btn-primary">
            <span className="text-base leading-none">+</span> Add Record
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select className="input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="input" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="input" placeholder="Search notes..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
          <input type="date" className="input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          <input type="date" className="input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        {(filters.type || filters.category || filters.search || filters.startDate || filters.endDate) && (
          <button className="mt-3 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            onClick={() => setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' })}>
            Clear filters
          </button>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {['Date', 'Type', 'Category', 'Note', 'Amount', ''].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_, i) => <Skel key={i} />) :
              records.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400 text-sm">
                  <p className="text-2xl mb-2">📭</p>No records found.
                </td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="tr group">
                  <td className="td font-mono text-xs text-gray-500">
                    {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="td">
                    <span className={`badge badge-${r.type}`}>{r.type}</span>
                  </td>
                  <td className="td text-gray-700">{r.category}</td>
                  <td className="td text-gray-400 max-w-[160px] truncate">{r.note || '—'}</td>
                  <td className={`td font-mono font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '−'}{fmt(r.amount)}
                  </td>
                  <td className="td">
                    {can('admin') && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="text-xs text-gray-400 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(r._id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetch(pagination.page - 1)} disabled={pagination.page <= 1}
                className="btn-ghost text-xs disabled:opacity-30 py-1.5 px-3">← Prev</button>
              <button onClick={() => fetch(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="btn-ghost text-xs disabled:opacity-30 py-1.5 px-3">Next →</button>
            </div>
          </div>
        )}
      </div>

      {modal === 'form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-md card p-7 fade-up">
            <h2 className="text-base font-semibold text-gray-900 mb-5">{editId ? 'Edit Record' : 'Add Record'}</h2>

            {formErr && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{formErr}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" className="input"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category...</option>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note</label>
                <input type="text" placeholder="Optional description..." className="input"
                  value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save changes' : 'Add record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
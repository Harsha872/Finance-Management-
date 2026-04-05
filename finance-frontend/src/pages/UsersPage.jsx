import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
      notify('Role updated')
    } catch (err) { alert(err.response?.data?.error || 'Failed.') }
  }

  const toggleStatus = async (id, status) => {
    const next = status === 'active' ? 'inactive' : 'active'
    if (!window.confirm(`${next === 'inactive' ? 'Deactivate' : 'Activate'} this user?`)) return
    try {
      await api.put(`/users/${id}/status`, { status: next })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: next } : u))
      notify(`User ${next === 'active' ? 'activated' : 'deactivated'}`)
    } catch (err) { alert(err.response?.data?.error || 'Failed.') }
  }

  const counts = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a }, {})

  return (
    <div className="space-y-6 fade-up">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-sub">{users.length} registered users</p>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { role: 'admin', count: counts.admin || 0 },
          { role: 'analyst', count: counts.analyst || 0 },
          { role: 'viewer', count: counts.viewer || 0 },
        ].map(({ role, count }) => (
          <div key={role} className="stat-card text-center">
            <p className={`text-2xl font-semibold font-mono mb-1`}>{count}</p>
            <span className={`badge badge-${role}`}>{role}s</span>
          </div>
        ))}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(4).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {[0, 1, 2, 3, 4, 5].map(j => <td key={j} className="px-5 py-3.5"><div className="skeleton h-4 rounded" /></td>)}
              </tr>
            )) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No users found.</td></tr>
            ) : users.map(u => {
              const isMe = u._id === me?.id
              return (
                <tr key={u._id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {u.name}
                          {isMe && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="td font-mono text-xs text-gray-400">{u.email}</td>
                  <td className="td">
                    {isMe ? (
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    ) : (
                      <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700
                                   focus:outline-none focus:border-gray-400 cursor-pointer">
                        <option value="viewer">viewer</option>
                        <option value="analyst">analyst</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td className="td">
                    <span className={`badge badge-${u.status}`}>{u.status}</span>
                  </td>
                  <td className="td text-xs font-mono text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="td">
                    {!isMe && (
                      <button onClick={() => toggleStatus(u._id, u.status)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                          ${u.status === 'active'
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-xl fade-up">
          {toast}
        </div>
      )}
    </div>
  )
}
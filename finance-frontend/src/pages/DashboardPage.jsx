import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const fmt = n => `₹${Math.abs(Number(n)).toLocaleString('en-IN')}`

function Skel({ className }) { return <div className={`skeleton ${className}`} /> }

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-2xl font-semibold font-mono ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs shadow-lg">
      <p className="text-gray-600 font-medium mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400 capitalize">{p.name}:</span>
          <span className="text-gray-900 font-mono font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, can } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const reqs = [api.get('/analytics/summary')]
        if (can('admin', 'analyst')) reqs.push(api.get('/analytics/trends'))
        const [s, t] = await Promise.all(reqs)
        setSummary(s.data)
        if (t) setTrends(t.data.slice(-6))
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-7 fade-up">
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="page-sub">Here is your financial overview.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        {loading ? [0, 1, 2].map(i => <Skel key={i} className="h-28 rounded-2xl" />) : summary ? (
          <>
            <StatCard label="Total Income" value={fmt(summary.totalIncome)} sub="All time" accent="text-emerald-600" />
            <StatCard label="Total Expenses" value={fmt(summary.totalExpense)} sub="All time" accent="text-red-500" />
            <StatCard label="Net Balance" value={fmt(summary.balance)}
              sub={summary.balance >= 0 ? 'You are in surplus' : 'You are in deficit'}
              accent={summary.balance >= 0 ? 'text-gray-900' : 'text-red-500'} />
          </>
        ) : null}
      </div>

      {summary?.topExpenseCategory && (
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Top Expense Category</p>
            <p className="text-gray-900 font-medium mt-0.5">
              {summary.topExpenseCategory.name} —{' '}
              <span className="text-red-500 font-mono">{fmt(summary.topExpenseCategory.amount)}</span>
            </p>
          </div>
        </div>
      )}

      {can('admin', 'analyst') && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Monthly Trend</h2>
              <p className="text-xs text-gray-400">Income vs expenses over last 6 months</p>
            </div>
            <Link to="/analytics" className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors">
              View full report →
            </Link>
          </div>
          {loading ? <Skel className="h-48" /> : trends.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No trend data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#gi)" dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#ge)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {!loading && trends.length > 0 && (
            <div className="flex gap-5 mt-3">
              {[['#10b981', 'Income'], ['#ef4444', 'Expenses']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-px" style={{ background: c }} />
                  <span className="text-xs text-gray-400">{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {summary?.recentActivity?.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="section-title">Recent Activity</h2>
            <Link to="/records" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {summary.recentActivity.map(r => (
              <div key={r._id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0
                    ${r.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {r.type === 'income' ? '+' : '−'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.category}</p>
                    <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {r.type === 'income' ? '+' : '−'}{fmt(r.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
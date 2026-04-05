import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#059669', '#dc2626', '#2563eb']
const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-xs">
      <p className="font-medium text-gray-700 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-gray-400 capitalize">{p.name}:</span>
          <span className="text-gray-900 font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { can } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [cats, setCats] = useState({ income: {}, expense: {} })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, t, c] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/trends'),
          api.get('/analytics/categories'),
        ])
        setSummary(s.data)
        setTrends(t.data)
        setCats(c.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await api.get('/analytics/report', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.setAttribute('download', 'finance-report.pdf')
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch { alert('Failed to generate PDF.') }
    finally { setDownloading(false) }
  }

  const expensePie = Object.entries(cats.expense || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value).slice(0, 8)

  if (loading) return (
    <div className="space-y-5 fade-up">
      <div className="skeleton h-8 w-40 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center justify-between page-header mb-0">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Financial performance overview</p>
        </div>
        {can('admin') && (
          <button onClick={handleDownload} disabled={downloading} className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? 'Generating...' : 'Export PDF'}
          </button>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
          {[
            { label: 'Total Income', value: fmt(summary.totalIncome), accent: 'text-emerald-600' },
            { label: 'Total Expense', value: fmt(summary.totalExpense), accent: 'text-red-500' },
            { label: 'Net Balance', value: fmt(summary.balance), accent: summary.balance >= 0 ? 'text-gray-900' : 'text-red-500' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="stat-card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
              <p className={`text-2xl font-semibold font-mono ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6">
        <h2 className="section-title mb-1">Monthly Income vs Expenses</h2>
        <p className="text-xs text-gray-400 mb-5">Bar chart by month</p>
        {trends.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">No data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trends} barCategoryGap="32%" barGap={3}>
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-5 mt-3">
          {[['#10b981', 'Income'], ['#f87171', 'Expenses']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              <span className="text-xs text-gray-400">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-1">Expense Breakdown</h2>
        <p className="text-xs text-gray-400 mb-5">Spending by category</p>
        {expensePie.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">No expense data.</div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expensePie} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                  dataKey="value" paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}>
                  {expensePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 min-w-[180px]">
              {expensePie.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {trends.length > 0 && (
        <div className="table-container">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="section-title">Monthly Breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>{['Month', 'Income', 'Expenses', 'Net'].map(h => <th key={h} className="th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {[...trends].reverse().map((t, i) => {
                const net = t.income - t.expense
                return (
                  <tr key={i} className="tr">
                    <td className="td font-medium text-gray-900">{t.label}</td>
                    <td className="td font-mono text-emerald-600">{fmt(t.income)}</td>
                    <td className="td font-mono text-red-500">{fmt(t.expense)}</td>
                    <td className={`td font-mono font-medium ${net >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                      {net >= 0 ? '+' : '−'}{fmt(Math.abs(net))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
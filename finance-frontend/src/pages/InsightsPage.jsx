import { useEffect, useState } from 'react'
import api from '../api/api'

const icons = {
    positive: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    negative: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    neutral: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
}

const styles = {
    positive: { wrap: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-800', body: 'text-emerald-700' },
    negative: { wrap: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-500', title: 'text-red-800', body: 'text-red-700' },
    warning: { wrap: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100 text-amber-600', title: 'text-amber-800', body: 'text-amber-700' },
    neutral: { wrap: 'bg-gray-50 border-gray-100', icon: 'bg-gray-100 text-gray-500', title: 'text-gray-800', body: 'text-gray-600' },
}

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function InsightsPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/analytics/insights')
                setData(data)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load insights.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="space-y-6 fade-up">
            <div className="page-header">
                <h1 className="page-title">AI Insights</h1>
                <p className="page-sub">Automated analysis of your financial patterns</p>
            </div>

            {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

            {loading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
                        {[
                            { label: 'Income', value: fmt(data.income), color: 'text-emerald-600' },
                            { label: 'Expenses', value: fmt(data.expense), color: 'text-red-500' },
                            { label: 'Saving Rate', value: `${data.savingRate ?? 0}%`, color: data.savingRate >= 20 ? 'text-emerald-600' : data.savingRate >= 0 ? 'text-amber-600' : 'text-red-500' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="stat-card">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                                <p className={`text-2xl font-semibold font-mono ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 stagger">
                        {data.insights.map((ins, i) => {
                            const s = styles[ins.type] || styles.neutral
                            return (
                                <div key={i} className={`card p-5 border ${s.wrap}`}>
                                    <div className="flex gap-4">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
                                            {icons[ins.type] || icons.neutral}
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${s.title}`}>{ins.title}</p>
                                            <p className={`text-sm mt-1 leading-relaxed ${s.body}`}>{ins.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {data.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 && (
                        <div className="card p-6">
                            <h2 className="section-title mb-4">Spending Distribution</h2>
                            <div className="space-y-3">
                                {Object.entries(data.categoryBreakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([cat, amt]) => {
                                        const pct = data.expense > 0 ? (amt / data.expense) * 100 : 0
                                        return (
                                            <div key={cat}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm text-gray-700">{cat}</span>
                                                    <span className="text-xs font-mono text-gray-500">{fmt(amt)} <span className="text-gray-300 ml-1">{pct.toFixed(1)}%</span></span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(pct, 100)}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}

                    <div className="card p-5 bg-gray-50 border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">About these insights</p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    Insights are generated automatically by analysing your income, expense patterns, saving rate, monthly trends, and category concentration. They refresh every time you load this page.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}
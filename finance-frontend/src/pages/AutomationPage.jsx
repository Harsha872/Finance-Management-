import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AutomationPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-7 fade-up">
      <div className="page-header">
        <h1 className="page-title">Automations</h1>
        <p className="page-sub">Manage your financial automated workflows.</p>
      </div>
      <div className="card p-6">
        <h2 className="section-title">Coming Soon!</h2>
        <p className="text-sm text-gray-500 mt-2">
          This feature is currently under development. Soon you'll be able to create smart 
          automations like recurring expenses, automatic budget alerts, and more.
        </p>
      </div>
    </div>
  )
}

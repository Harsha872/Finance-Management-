import { useState, useRef, useEffect } from 'react'
import api from '../api/api'

const OPTIONS = [
  { id: '1', text: 'What is my total net balance right now?' },
  { id: '2', text: 'Which category do I spend the most on?' },
  { id: '3', text: 'How many records have I added?' },
  { id: '4', text: 'Can you summarize my finances briefly?' },
]

export default function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState([
    { type: 'bot', text: 'Hi! I am your Finance Assistant. How can I help you today?' }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [history, open])

  const ask = async (option) => {
    setHistory(h => [...h, { type: 'user', text: option.text }])
    setLoading(true)
    try {
      const { data } = await api.post('/analytics/assistant', { question: option.id })
      setHistory(h => [...h, { type: 'bot', text: data.answer }])
    } catch (err) {
      setHistory(h => [...h, { type: 'error', text: "Sorry, I couldn't process that request right now." }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-800 transition-all hover:scale-105 z-50">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[340px] bg-white border border-gray-100 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 fade-up" style={{ maxHeight: '500px' }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Finance Assistant</h3>
            <p className="text-xs text-gray-400">Always active</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px] bg-white">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.type === 'user' 
                ? 'bg-gray-900 text-white rounded-br-sm' 
                : msg.type === 'error'
                ? 'bg-red-50 text-red-600 rounded-bl-sm border border-red-100'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400 mb-2 font-medium px-1">Suggested questions:</p>
        <div className="flex flex-col gap-1.5">
          {OPTIONS.map(opt => (
            <button 
              key={opt.id}
              onClick={() => ask(opt)}
              disabled={loading}
              className="text-left bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50 border border-gray-100 rounded-xl px-3 py-2 text-xs transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import { api } from '../lib/api'

export default function Board_() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSession(id).then(d => { setContent(d.board || ''); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  return (
    <PageTransition className="min-h-[100dvh] px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium mb-3"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>Thinking Board</span>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Behind the Scenes</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/session/${id}`)}>← Back</Button>
        </div>
        {loading ? (
          <div className="p-[2px] rounded-[var(--radius-xl)]" style={{ background: 'var(--glass-border)' }}>
            <div className="h-64 rounded-[calc(var(--radius-xl)-2px)] bg-[var(--surface)] animate-pulse" />
          </div>
        ) : (
          <div className="p-[2px] rounded-[var(--radius-xl)]" style={{ background: 'var(--glass-border)' }}>
            <div className="rounded-[calc(var(--radius-xl)-2px)] p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap"
              style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
              {content || 'No board entries yet.'}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

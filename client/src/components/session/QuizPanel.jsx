import { useState } from 'react'
import { motion } from 'framer-motion'

function QuizQuestion({ q, index, answers, onAnswer, submitted }) {
  const [codeInput, setCodeInput] = useState(q.starterCode || '')

  if (q.type === 'code') {
    return (
      <div className="mb-4 border-[2px] border-[var(--bauhaus-black)] overflow-hidden">
        <div className="bg-[var(--bauhaus-black)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5">
          Q{index + 1}: {q.question}
        </div>
        <div className="p-2 bg-[var(--surface)]">
          <textarea
            value={submitted ? (q.solution || codeInput) : codeInput}
            onChange={e => setCodeInput(e.target.value)}
            disabled={submitted}
            rows={4}
            className="w-full bg-[var(--bg)] text-[var(--ink)] border-[2px] border-[var(--bauhaus-black)] p-2 text-xs font-mono focus:outline-none resize-none"
            placeholder="Write your code..."
          />
        </div>
        {submitted && (
          <div className="px-3 py-2 border-t-2 border-[var(--bauhaus-black)] bg-[var(--surface-alt)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bauhaus-red)] mb-1">Solution:</p>
            <pre className="text-xs font-mono whitespace-pre-wrap text-[var(--ink)]">{q.solution}</pre>
            {q.explanation && <p className="text-[10px] text-[var(--ink-muted)] mt-1">{q.explanation}</p>}
          </div>
        )}
      </div>
    )
  }

  const selected = answers[q.id]
  const isCorrect = selected === q.answer

  return (
    <div className={`mb-4 border-[2px] overflow-hidden ${submitted ? (isCorrect ? 'border-[var(--bauhaus-blue)]' : 'border-[var(--bauhaus-red)]') : 'border-[var(--bauhaus-black)]'}`}>
      <div className="bg-[var(--bauhaus-black)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5">
        Q{index + 1}: {q.question}
      </div>
      <div className="p-3 space-y-1.5">
        {q.options.map((opt, oi) => {
          let btnStyle = 'bg-[var(--surface)] text-[var(--ink)]'
          if (submitted) {
            if (oi === q.answer) btnStyle = 'bg-[var(--bauhaus-blue)] text-white'
            else if (oi === selected && !isCorrect) btnStyle = 'bg-[var(--bauhaus-red)] text-white'
          } else if (selected === oi) {
            btnStyle = 'bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)]'
          }
          return (
            <button
              key={oi}
              onClick={() => !submitted && onAnswer(q.id, oi)}
              disabled={submitted}
              className={`w-full text-left px-3 py-2 border-[2px] border-[var(--bauhaus-black)] text-xs font-medium cursor-pointer transition-all duration-200 ${submitted ? 'cursor-default' : 'hover:bg-[var(--bauhaus-yellow)] hover:border-[var(--bauhaus-yellow)]'} ${btnStyle}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {submitted && q.explanation && (
        <div className="px-3 py-2 border-t-2 border-[var(--bauhaus-black)] bg-[var(--surface-alt)]">
          <p className="text-[10px] text-[var(--ink-muted)]">{q.explanation}</p>
        </div>
      )}
    </div>
  )
}

export default function QuizPanel({ test, onClose, onMinimize, minimized }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  if (!test) return null

  const { title, testType, questions } = test

  const handleAnswer = (qId, optIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optIndex }))
  }

  const handleSubmit = () => {
    const scored = questions.filter(q => q.type !== 'code')
    const codeCount = questions.length - scored.length
    let correct = 0
    scored.forEach(q => {
      if (answers[q.id] === q.answer) correct++
    })
    setScore({ correct, total: scored.length, codeCount })
    setSubmitted(true)
  }

  function getScoreColor() {
    if (!score || score.total === 0) return 'var(--bauhaus-blue)'
    const pct = score.correct / score.total
    if (pct >= 0.8) return 'var(--bauhaus-blue)'
    if (pct >= 0.5) return 'var(--bauhaus-yellow)'
    return 'var(--bauhaus-red)'
  }

  if (minimized) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMinimize}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[var(--bauhaus-red)] text-white border-[3px] border-[var(--bauhaus-black)] cursor-pointer shadow-[4px_4px_0_0_var(--bauhaus-black)]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/>
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
      </motion.button>
    )
  }

  const answered = questions.filter(q => q.type === 'code' || answers[q.id] !== undefined).length
  const scoredCount = questions.filter(q => q.type !== 'code').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-6 right-6 z-50 w-[420px] max-h-[85vh] overflow-y-auto border-[3px] border-[var(--bauhaus-black)] shadow-[8px_8px_0_0_var(--bauhaus-black)] bg-[var(--bg)]"
    >
      <div className="sticky top-0 z-10 bg-[var(--bauhaus-black)] text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
          <span className="text-[9px] text-white/60 uppercase tracking-wider">({testType})</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMinimize}
            className="w-5 h-5 flex items-center justify-center bg-white/20 cursor-pointer"
            title="Minimize"
          >
            <svg width="8" height="2" viewBox="0 0 8 2" fill="none"><path d="M0 1h8" stroke="white" strokeWidth="1.5"/></svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-white/20 cursor-pointer"
            title="Close"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1l-6 6" stroke="white" strokeWidth="1.5"/></svg>
          </motion.button>
        </div>
      </div>

      <div className="p-4">
        {score && (
          <div className="mb-4 p-4 border-[2px] border-[var(--bauhaus-black)] text-center" style={{ backgroundColor: getScoreColor(), color: 'white' }}>
            <div className="text-3xl font-black">{score.correct}/{score.total}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1">
              {score.correct === score.total ? 'Perfect Score!' : score.correct / score.total >= 0.8 ? 'Great Job!' : score.correct / score.total >= 0.5 ? 'Keep Practicing' : 'Review Needed'}
            </div>
            {score.codeCount > 0 && <div className="text-[9px] opacity-70 mt-1">{score.codeCount} code question{score.codeCount > 1 ? 's' : ''} (review manually)</div>}
          </div>
        )}

        {questions.map((q, i) => (
          <QuizQuestion
            key={q.id}
            q={q}
            index={i}
            answers={answers}
            onAnswer={handleAnswer}
            submitted={submitted}
          />
        ))}

        <div className="flex gap-2 mt-4">
          {!submitted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={answered < questions.length}
              className="flex-1 py-2.5 bg-[var(--bauhaus-red)] text-white text-xs font-bold uppercase tracking-wider border-[3px] border-[var(--bauhaus-black)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Submit ({answered}/{questions.length}){scoredCount < questions.length ? ' (code auto-graded)' : ''}
            </motion.button>
          )}
          {submitted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAnswers({}); setSubmitted(false); setScore(null) }}
              className="flex-1 py-2.5 bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)] text-xs font-bold uppercase tracking-wider border-[3px] border-[var(--bauhaus-black)] cursor-pointer transition-all duration-200"
            >
              Retry
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
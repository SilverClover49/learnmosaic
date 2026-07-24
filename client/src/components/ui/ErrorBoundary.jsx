import { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-[var(--bauhaus-red)] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 8l16 16M24 8L8 24" stroke="var(--bauhaus-white)" strokeWidth="3" strokeLinecap="square"/>
              </svg>
            </div>
            <h1 className="type-h2 mb-3">SOMETHING BROKE</h1>
            <p className="text-[var(--ink-muted)] mb-8">
              The app hit an unexpected error. This is a bug — not your fault.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => this.setState({ hasError: false, error: null })}>
                TRY AGAIN
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/'}>
                GO HOME
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-[var(--ink-muted)] cursor-pointer mb-2">Error details</summary>
                <pre className="text-[10px] text-[var(--ink-muted)] bg-[var(--surface)] p-4 border-[2px] border-[var(--bauhaus-black)] overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

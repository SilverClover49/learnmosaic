export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs font-medium text-[var(--ink)] uppercase tracking-wider mb-2">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-3
          border-[2px] ${error ? 'border-red-500' : 'border-[var(--bauhaus-black)]'}
          bg-[var(--bauhaus-white)] text-[var(--ink)] placeholder-[var(--ink-dim)]
          focus:outline-none focus:border-[var(--bauhaus-red)]
          transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          font-[var(--font-body)] text-sm
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

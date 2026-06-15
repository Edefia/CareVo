import { Loader2, Activity } from "lucide-react"

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = "Loading...", fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-20 w-full animate-in fade-in"

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center h-20 w-20 mb-6">
        {/* Outer pulsating rings */}
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-lime-dark)] opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-2 rounded-full border-4 border-[var(--color-forest)] opacity-10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
        
        {/* Inner spinning element */}
        <div className="absolute inset-0 bg-[var(--color-forest)]/5 rounded-full flex items-center justify-center border border-[var(--color-forest)]/10">
          <Activity className="h-8 w-8 text-[var(--color-forest)] animate-pulse" />
        </div>
        
        {/* Spinning border */}
        <svg className="absolute inset-0 h-full w-full animate-spin text-[var(--color-lime-dark)]" viewBox="0 0 100 100">
          <circle 
            className="opacity-25" 
            cx="50" cy="50" r="48" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
          />
          <circle 
            className="opacity-75" 
            cx="50" cy="50" r="48" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray="75 225" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
      
      <h3 className="font-serif text-xl font-semibold text-[var(--color-forest)] mb-2 animate-pulse">
        {message}
      </h3>
      <div className="flex gap-1 items-center justify-center">
        <span className="h-1.5 w-1.5 bg-[var(--color-lime-dark)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="h-1.5 w-1.5 bg-[var(--color-lime-dark)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="h-1.5 w-1.5 bg-[var(--color-lime-dark)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  )
}

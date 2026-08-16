type LoadingSpinnerProps = {
  label?: string
}

export default function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-8" role="status">
      <span aria-hidden="true" className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      {label && <p className="text-sm text-white/70">{label}</p>}
    </div>
  )
}

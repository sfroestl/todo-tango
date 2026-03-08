export interface CompletionProgressProps {
  completedCount: number
  totalCount: number
}

export function CompletionProgress({
  completedCount,
  totalCount,
}: CompletionProgressProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const widthPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div
      className="mb-6"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="List completion"
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  )
}

const ROW_WIDTHS = [
  ['w-2/5', 'w-1/4', 'w-1/5', 'w-16'],
  ['w-1/3', 'w-1/3', 'w-1/4', 'w-16'],
  ['w-1/2', 'w-1/5', 'w-1/4', 'w-16'],
  ['w-2/5', 'w-1/3', 'w-1/5', 'w-16'],
  ['w-1/3', 'w-1/4', 'w-2/5', 'w-16'],
];

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => {
        const widths = ROW_WIDTHS[i % ROW_WIDTHS.length];
        return (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className={`skeleton h-3.5 ${widths[0]}`} />
            <div className={`skeleton h-3.5 ${widths[1]}`} />
            <div className={`skeleton h-3.5 ${widths[2]} hidden sm:block`} />
            <div className="flex gap-2 ml-auto">
              <div className="skeleton h-7 w-14 rounded-lg" />
              <div className="skeleton h-7 w-14 rounded-lg" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { Skeleton } from '@/components/ui/loading-skeleton'

export default function CoursesLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <Skeleton width="160px" height={32} rounded="md" />
          <div style={{ height: '8px' }} />
          <Skeleton width="320px" height={18} rounded="sm" />
          <div style={{ height: '24px' }} />
          <Skeleton width="100%" height={48} rounded="md" />
          <div style={{ height: '16px' }} />
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={140} height={40} rounded="md" />
            ))}
          </div>
        </div>
      </div>
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <Skeleton width="160px" height={18} rounded="sm" />
        <div style={{ height: '24px' }} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/loading-skeleton'

export default function UniversitiesLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <Skeleton width="180px" height={32} rounded="md" />
          <div style={{ height: '8px' }} />
          <Skeleton width="320px" height={18} rounded="sm" />
          <div style={{ height: '24px' }} />
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width={160} height={40} rounded="md" />
            ))}
          </div>
        </div>
      </div>
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  )
}

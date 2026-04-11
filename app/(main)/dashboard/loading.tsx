import { Skeleton } from '@/components/ui/loading-skeleton'

export default function DashboardLoading() {
  return (
    <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
      <div className="mb-8">
        <Skeleton width="260px" height={32} rounded="md" />
        <div style={{ height: '8px' }} />
        <Skeleton width="360px" height={18} rounded="sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pf-card">
            <Skeleton width="50%" height={14} rounded="sm" />
            <div style={{ height: '12px' }} />
            <Skeleton width="40%" height={28} rounded="md" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <div className="space-y-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    </div>
  )
}

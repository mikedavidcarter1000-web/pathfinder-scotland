export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-1.5 bg-gray-200" />
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-12 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-9 w-full bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

export function UniversityCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="h-9 w-full bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

export function GradeCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="w-16 h-8 bg-gray-100 rounded" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-5 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse mb-8">
      <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-72 bg-gray-100 rounded" />
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  columns?: 2 | 3 | 4
  type?: 'course' | 'university' | 'stat' | 'grade'
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  type = 'course',
}: SkeletonGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  const SkeletonComponent = {
    course: CourseCardSkeleton,
    university: UniversityCardSkeleton,
    stat: StatCardSkeleton,
    grade: GradeCardSkeleton,
  }[type]

  return (
    <div className={`grid ${columnClasses[columns]} gap-4`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}

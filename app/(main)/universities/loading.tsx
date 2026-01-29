export default function UniversitiesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-72 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* University Cards Skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gray-200 animate-pulse" />
            <div className="p-5">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

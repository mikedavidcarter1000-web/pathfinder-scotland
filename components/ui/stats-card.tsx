import { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  size = 'md',
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      trend: 'text-blue-600',
    },
    green: {
      icon: 'bg-green-100 text-green-600',
      trend: 'text-green-600',
    },
    purple: {
      icon: 'bg-purple-100 text-purple-600',
      trend: 'text-purple-600',
    },
    orange: {
      icon: 'bg-orange-100 text-orange-600',
      trend: 'text-orange-600',
    },
    red: {
      icon: 'bg-red-100 text-red-600',
      trend: 'text-red-600',
    },
    gray: {
      icon: 'bg-gray-100 text-gray-600',
      trend: 'text-gray-600',
    },
  }

  const sizeClasses = {
    sm: {
      padding: 'p-4',
      iconSize: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      valueText: 'text-xl',
      labelText: 'text-xs',
    },
    md: {
      padding: 'p-5',
      iconSize: 'w-10 h-10',
      iconInner: 'w-5 h-5',
      valueText: 'text-2xl',
      labelText: 'text-sm',
    },
    lg: {
      padding: 'p-6',
      iconSize: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      valueText: 'text-3xl',
      labelText: 'text-base',
    },
  }

  const colors = colorClasses[color]
  const sizes = sizeClasses[size]

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${sizes.padding}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${sizes.labelText} text-gray-500 font-medium`}>{label}</span>
        {icon && (
          <div className={`${sizes.iconSize} ${colors.icon} rounded-lg flex items-center justify-center`}>
            <span className={sizes.iconInner}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className={`${sizes.valueText} font-bold text-gray-900`}>{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <svg
              className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-sm font-medium">
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      {trend?.label && (
        <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
      )}
    </div>
  )
}

interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-4`}>
      {children}
    </div>
  )
}

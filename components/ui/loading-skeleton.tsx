'use client'

import { CSSProperties } from 'react'

type SkeletonVariant = 'card' | 'text' | 'avatar' | 'table' | 'rect'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  lines?: number
  rows?: number
  columns?: number
  className?: string
  style?: CSSProperties
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const radiusMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
}

const baseStyle: CSSProperties = {
  backgroundColor: 'var(--pf-grey-100)',
  position: 'relative',
  overflow: 'hidden',
}

// Single primitive bar — the shimmer comes from the global keyframe defined
// in globals.css (.pf-skeleton::after). Everything else composes this bar.
function Bar({
  width,
  height,
  rounded = 'md',
  className = '',
  style,
}: {
  width?: string | number
  height?: string | number
  rounded?: SkeletonProps['rounded']
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={`pf-skeleton ${className}`}
      style={{
        ...baseStyle,
        display: 'block',
        width: typeof width === 'number' ? `${width}px` : width ?? '100%',
        height: typeof height === 'number' ? `${height}px` : height ?? '16px',
        borderRadius: radiusMap[rounded ?? 'md'],
        ...style,
      }}
    />
  )
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 3,
  rows = 4,
  columns = 3,
  className = '',
  style,
  rounded,
}: SkeletonProps) {
  if (variant === 'text') {
    return (
      <span className={`block space-y-2 ${className}`} style={style} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <Bar
            key={i}
            width={i === lines - 1 ? '70%' : '100%'}
            height={14}
            rounded={rounded ?? 'sm'}
          />
        ))}
      </span>
    )
  }

  if (variant === 'avatar') {
    return (
      <Bar
        width={width ?? 48}
        height={height ?? 48}
        rounded="full"
        className={className}
        style={style}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`pf-card-flat ${className}`}
        style={{ padding: '24px', ...style }}
        aria-hidden="true"
      >
        <Bar width="60%" height={20} rounded={rounded ?? 'md'} />
        <div style={{ height: '12px' }} />
        <Bar width="40%" height={14} rounded={rounded ?? 'sm'} />
        <div style={{ height: '20px' }} />
        <Bar width="100%" height={14} rounded={rounded ?? 'sm'} />
        <div style={{ height: '8px' }} />
        <Bar width="85%" height={14} rounded={rounded ?? 'sm'} />
        <div style={{ height: '20px' }} />
        <Bar width="100%" height={36} rounded="md" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        className={`space-y-2 ${className}`}
        style={style}
        aria-hidden="true"
      >
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: columns }).map((_, c) => (
              <Bar key={c} width="100%" height={18} rounded="sm" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Bar
      width={width}
      height={height}
      rounded={rounded}
      className={className}
      style={style}
    />
  )
}

// Convenience aliases so pages can read fluently.
export const SkeletonText = (props: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="text" {...props} />
)
export const SkeletonAvatar = (props: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="avatar" {...props} />
)
export const SkeletonCard = (props: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="card" {...props} />
)
export const SkeletonTable = (props: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="table" {...props} />
)

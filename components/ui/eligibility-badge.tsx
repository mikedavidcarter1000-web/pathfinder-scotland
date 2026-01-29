interface EligibilityBadgeProps {
  status: 'eligible' | 'possible' | 'below' | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function EligibilityBadge({
  status,
  size = 'md',
  showLabel = true,
}: EligibilityBadgeProps) {
  if (!status) return null

  const config = {
    eligible: {
      label: 'Eligible',
      description: 'You meet the entry requirements',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    possible: {
      label: 'Possible',
      description: 'You\'re close to meeting requirements',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    below: {
      label: 'Below Requirements',
      description: 'Entry requirements not met',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  }

  const { label, bgColor, textColor, icon } = config[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${bgColor} ${textColor} ${sizeClasses[size]}`}
    >
      <span className={iconSizes[size]}>{icon}</span>
      {showLabel && label}
    </span>
  )
}

export function EligibilityIndicator({
  status,
  showDescription = false,
}: {
  status: 'eligible' | 'possible' | 'below' | null
  showDescription?: boolean
}) {
  if (!status) return null

  const config = {
    eligible: {
      label: 'Eligible',
      description: 'Based on your grades, you meet the entry requirements for this course.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    possible: {
      label: 'Possible',
      description: 'You\'re close to meeting the requirements. Consider widening access or improving grades.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    below: {
      label: 'Below Requirements',
      description: 'Your current grades don\'t meet the minimum requirements for this course.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  }

  const { label, description, color, bgColor, borderColor } = config[status]

  if (!showDescription) {
    return <EligibilityBadge status={status} />
  }

  return (
    <div className={`rounded-lg p-4 border ${bgColor} ${borderColor}`}>
      <div className="flex items-start gap-3">
        <EligibilityBadge status={status} />
        <div>
          <p className={`font-medium ${color}`}>{label}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}

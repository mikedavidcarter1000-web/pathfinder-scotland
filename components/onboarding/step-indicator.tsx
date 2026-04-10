'use client'

interface Step {
  id: number
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = onStepClick && step.id < currentStep

          const dotBg = isCompleted
            ? 'var(--pf-teal-500)'
            : isCurrent
            ? 'var(--pf-teal-700)'
            : 'var(--pf-grey-100)'
          const dotColor = isCompleted || isCurrent ? '#fff' : 'var(--pf-grey-600)'

          return (
            <li
              key={step.id}
              className={`relative ${index !== steps.length - 1 ? 'flex-1 pr-8 sm:pr-20' : ''}`}
            >
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className="relative flex items-center justify-center rounded-full transition-colors"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: dotBg,
                    cursor: isClickable ? 'pointer' : 'default',
                    border: isCurrent ? '3px solid var(--pf-teal-100)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: dotColor,
                      }}
                    >
                      {step.id}
                    </span>
                  )}
                </button>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div
                    className="hidden sm:block absolute top-5 left-10 w-full"
                    style={{ height: '2px' }}
                  >
                    <div
                      className="h-full transition-colors"
                      style={{
                        backgroundColor: isCompleted ? 'var(--pf-teal-500)' : 'var(--pf-grey-100)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2">
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: isCurrent
                      ? 'var(--pf-teal-700)'
                      : isCompleted
                      ? 'var(--pf-grey-900)'
                      : 'var(--pf-grey-600)',
                  }}
                >
                  {step.title}
                </span>
                {step.description && (
                  <p
                    className="hidden sm:block"
                    style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface MobileStepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

export function MobileStepIndicator({
  currentStep,
  totalSteps,
  stepTitle,
}: MobileStepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="sm:hidden">
      <div className="flex items-center justify-between mb-2">
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {stepTitle}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: '8px', backgroundColor: 'var(--pf-grey-100)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--pf-teal-500)',
          }}
        />
      </div>
    </div>
  )
}

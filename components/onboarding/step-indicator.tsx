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
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      : isCurrent
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${!isClickable ? 'cursor-default' : ''}`}
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
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </button>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5">
                    <div
                      className={`h-full transition-colors ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
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
        <span className="text-sm font-medium text-gray-900">{stepTitle}</span>
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

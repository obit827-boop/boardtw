import { Check } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep

        return (
          <div key={index} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-[#2563EB] text-white'
                    : isCurrent
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isFuture ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 sm:w-12 ${
                  index < currentStep ? 'bg-[#2563EB]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

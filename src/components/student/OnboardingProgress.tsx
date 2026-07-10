import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

export const OnboardingProgress = ({ currentStep, totalSteps, steps }: OnboardingProgressProps) => {
  return (
    <div className="w-full mb-12">
      {/* Animated Progress Bar */}
      <div className="relative mb-12">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-700 ease-out rounded-full shadow-lg"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute top-1/2 left-0 w-full flex justify-between -translate-y-1/2">
          {steps.map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div
                key={index}
                className={cn(
                  "relative flex items-center justify-center transition-all duration-300 transform",
                  isCurrent && "scale-110"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/50",
                    isCurrent && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/70 scale-125",
                    !isCompleted && !isCurrent && "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 font-bold" strokeWidth={3} />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Info - Enhanced */}
      <div className="text-center space-y-2 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm border border-primary/20">
        <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </p>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {steps[currentStep - 1].description}
        </p>
      </div>
    </div>
  );
};

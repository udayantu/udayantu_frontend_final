import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: 
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-md hover:shadow-lg hover:shadow-secondary/20 transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground transition-all",
        secondary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all",
        ghost: 
          "hover:bg-muted hover:text-foreground transition-colors",
        link: 
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        // New premium variants
        glow: 
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-secondary-glow hover:shadow-xl hover:shadow-secondary/30 transition-all",
        "glow-primary":
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary-glow hover:shadow-xl hover:shadow-primary/30 transition-all",
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all",
        "soft-secondary":
          "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 transition-all",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

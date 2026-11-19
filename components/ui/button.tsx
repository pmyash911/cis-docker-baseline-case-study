import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-label-md text-label-md disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "min-h-[48px] px-space-lg bg-primary-container text-on-primary rounded-[2px] hover:bg-secondary",
        link: "min-h-[48px] text-primary underline underline-offset-4 hover:text-on-surface-variant",
        outline:
          "min-h-[48px] border border-outline px-space-lg text-primary rounded-[2px] hover:border-primary hover:bg-surface-container-low",
      },
      size: {
        default: "",
        sm: "min-h-[40px] px-space-md",
      },
    },
    defaultVariants: {
      variant: "primary",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

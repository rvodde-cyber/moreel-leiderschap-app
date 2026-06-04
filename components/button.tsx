import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border text-sm font-medium transition duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-accent bg-accent px-5 py-3 text-white shadow-soft hover:bg-[#463da0]",
        secondary: "border-line bg-white/70 px-5 py-3 text-ink hover:border-accent/40",
        ghost: "border-transparent px-3 py-2 text-muted hover:text-ink",
        danger: "border-[#C45E3E] bg-[#C45E3E] px-4 py-2 text-white hover:bg-[#a94d32]"
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "",
        lg: "px-6 py-4 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { buttonVariants };

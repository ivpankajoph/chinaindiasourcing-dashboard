import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none cursor-pointer active:scale-[0.98] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm active:bg-primary",
        outline:
          "border-border/80 bg-background shadow-2xs hover:bg-muted/80 hover:text-foreground hover:border-border aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted/80 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive shadow-2xs hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default:
          "h-10 gap-2 px-4 py-2 text-sm font-semibold [&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 gap-2.5 rounded-xl px-5 py-2.5 text-base font-bold [&_svg:not([class*='size-'])]:size-5",
        xl: "h-12 gap-3 rounded-xl px-6 py-3 text-base font-bold [&_svg:not([class*='size-'])]:size-5.5",
        icon: "size-10 rounded-xl [&_svg:not([class*='size-'])]:size-5",
        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm":
          "size-9 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-11 rounded-xl [&_svg:not([class*='size-'])]:size-5.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: cn(buttonVariants({ variant, size, className }), child.props?.className),
      "data-slot": "button",
      onClick: (e: React.MouseEvent) => {
        child.props?.onClick?.(e);
        (props as any)?.onClick?.(e);
      },
    });
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }

import { type VariantProps, cva } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors w-fit whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        outline: 'text-foreground border-border',
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/15 text-warning-foreground border-warning/30',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
export type { BadgeProps }

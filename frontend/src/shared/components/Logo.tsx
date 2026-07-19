import { BRAND, type LogoVariant } from '@/shared/constants/brand'
import { cn } from '@/shared/utils/cn'

interface LogoProps {
  variant?: LogoVariant
  className?: string
}

export function Logo({ variant = 'horizontal', className }: LogoProps) {
  return <img src={BRAND.logos[variant]} alt="KOMI" className={cn('h-8 w-auto', className)} />
}

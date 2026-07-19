import { BRAND } from '@/shared/constants/brand'
import { cn } from '@/shared/utils/cn'

export function ComyIcon({ className }: { className?: string }) {
  return <img src={BRAND.logos.comy} alt="COMY Assistant" className={cn('size-4', className)} />
}

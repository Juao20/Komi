import { Logo } from '@/shared/components/Logo'

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Logo variant="icon" className="size-10 animate-pulse" />
    </div>
  )
}

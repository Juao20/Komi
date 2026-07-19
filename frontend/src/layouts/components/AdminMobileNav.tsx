import * as DialogPrimitive from '@radix-ui/react-dialog'

import { AdminSidebarNavContent } from '@/layouts/components/AdminSidebar'

export function AdminMobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar shadow-elevation-high outline-none lg:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <AdminSidebarNavContent onNavigate={() => onOpenChange(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

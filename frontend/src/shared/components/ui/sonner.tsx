import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-xl! border! border-border! bg-card! text-card-foreground! shadow-elevation-high!',
          description: 'text-muted-foreground!',
          actionButton: 'bg-primary! text-primary-foreground!',
          cancelButton: 'bg-secondary! text-secondary-foreground!',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

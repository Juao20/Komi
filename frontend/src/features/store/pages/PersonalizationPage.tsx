import { ImagePlus, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useMyStore, useUpdateStore, useUpdateStoreTheme } from '@/features/store/hooks'
import type { StoreTheme } from '@/features/store/types'
import { isCloudinaryConfigured, uploadToCloudinary } from '@/shared/services/cloudinary'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import { cn } from '@/shared/utils/cn'

const COLOR_PRESETS = ['#6C5CE7', '#111827', '#0EA5E9', '#F97316', '#DC2626', '#059669', '#DB2777']

const FONT_OPTIONS: { value: StoreTheme['font_family']; label: string }[] = [
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'sora', label: 'Sora' },
  { value: 'work_sans', label: 'Work Sans' },
]

function LogoUploadButton({
  label,
  currentUrl,
  folder,
  onUploaded,
}: {
  label: string
  currentUrl?: string
  folder?: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = async (file?: File) => {
    if (!file) return
    if (!isCloudinaryConfigured()) {
      toast.error("L'envoi d'images n'est pas encore configuré pour cet environnement.")
      return
    }
    setIsUploading(true)
    try {
      const url = await uploadToCloudinary(file, folder)
      onUploaded(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isUploading}
      className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {currentUrl ? (
        <img src={currentUrl} alt={label} className="size-full object-cover" />
      ) : isUploading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          <ImagePlus className="size-5" />
          <span className="text-[11px] font-medium">{label}</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </button>
  )
}

export function PersonalizationPage() {
  const { data: store, isPending } = useMyStore()
  const updateStore = useUpdateStore()
  const updateTheme = useUpdateStoreTheme()

  if (isPending || !store) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Personnalisation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajustez l'apparence de votre boutique publique.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Logo &amp; bannière</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-6">
              <div>
                <LogoUploadButton
                  label="Logo"
                  currentUrl={store.logo_url}
                  folder={`komi/stores/${store.slug}/branding`}
                  onUploaded={(url) => updateStore.mutate({ logo_url: url })}
                />
              </div>
              <div>
                <LogoUploadButton
                  label="Bannière"
                  currentUrl={store.banner_url}
                  folder={`komi/stores/${store.slug}/branding`}
                  onUploaded={(url) => updateStore.mutate({ banner_url: url })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Couleurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateStore.mutate({ primary_color: color })}
                      className={cn(
                        'size-8 rounded-full border-2 transition-transform hover:scale-110',
                        store.primary_color === color ? 'border-foreground' : 'border-transparent',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={store.primary_color}
                    onChange={(event) => updateStore.mutate({ primary_color: event.target.value })}
                    className="size-8 cursor-pointer rounded-full border border-border bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Police</Label>
                <Select value={store.theme.font_family} onValueChange={(value) => updateTheme.mutate({ font_family: value as StoreTheme['font_family'] })}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Afficher la bannière</p>
                  <p className="text-xs text-muted-foreground">Sur la page d'accueil de votre boutique</p>
                </div>
                <Switch
                  checked={store.theme.show_hero_banner}
                  onCheckedChange={(checked) => updateTheme.mutate({ show_hero_banner: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Afficher les réseaux sociaux</p>
                  <p className="text-xs text-muted-foreground">Liens WhatsApp, Instagram, Facebook, TikTok</p>
                </div>
                <Switch
                  checked={store.theme.show_social_links}
                  onCheckedChange={(checked) => updateTheme.mutate({ show_social_links: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6 overflow-hidden">
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-border">
                <div className="h-24 w-full bg-secondary bg-cover bg-center" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})` } : undefined} />
                <div className="flex flex-col items-center gap-2 px-4 pb-6 pt-0">
                  <div className="-mt-8 size-16 overflow-hidden rounded-full border-4 border-card bg-secondary">
                    {store.logo_url && <img src={store.logo_url} alt="" className="size-full object-cover" />}
                  </div>
                  <p className="text-sm font-semibold">{store.name}</p>
                  <p className="text-center text-xs text-muted-foreground">{store.description || 'Votre description apparaîtra ici.'}</p>
                  <span
                    className="mt-2 rounded-full px-4 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: store.primary_color }}
                  >
                    Voir les produits
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

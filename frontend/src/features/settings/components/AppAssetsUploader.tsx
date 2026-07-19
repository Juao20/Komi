import { Check, Copy, ImagePlus, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { isCloudinaryConfigured, uploadToCloudinary } from '@/shared/services/cloudinary'
import { cn } from '@/shared/utils/cn'

interface UploadedAsset {
  url: string
  name: string
}

export function AppAssetsUploader() {
  const [assets, setAssets] = useState<UploadedAsset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!isCloudinaryConfigured()) {
      toast.error("L'envoi d'images n'est pas encore configuré pour cet environnement.")
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => ({
          url: await uploadToCloudinary(file, 'komi/app-assets'),
          name: file.name,
        })),
      )
      setAssets((prev) => [...uploaded, ...prev])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 1500)
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary',
        )}
      >
        {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        <span className="text-sm font-medium">Déposer un logo ou une image (JPEG, PNG, WEBP)</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {assets.length > 0 && (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div key={asset.url} className="flex items-center gap-3 rounded-lg border border-border p-2">
              <img src={asset.url} alt={asset.name} className="size-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">{asset.url}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => copyUrl(asset.url)}>
                {copiedUrl === asset.url ? <Check className="text-success" /> : <Copy />}
                {copiedUrl === asset.url ? 'Copié' : 'Copier le lien'}
              </Button>
              <button
                type="button"
                onClick={() => setAssets((prev) => prev.filter((a) => a.url !== asset.url))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

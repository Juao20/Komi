import { ImagePlus, Loader2, Star, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { isCloudinaryConfigured, uploadToCloudinary } from '@/shared/services/cloudinary'
import { cn } from '@/shared/utils/cn'

export interface ProductImageDraft {
  image_url: string
  alt_text?: string
  is_primary: boolean
}

interface ImageUploaderProps {
  images: ProductImageDraft[]
  onChange: (images: ProductImageDraft[]) => void
  folder?: string
}

export function ImageUploader({ images, onChange, folder }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (!isCloudinaryConfigured()) {
      toast.error("L'envoi d'images n'est pas encore configuré pour cet environnement.")
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file, folder)))
      const newImages = uploaded.map((url, index) => ({
        image_url: url,
        is_primary: images.length === 0 && index === 0,
      }))
      onChange([...images, ...newImages])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const setPrimary = (index: number) => {
    onChange(images.map((image, i) => ({ ...image, is_primary: i === index })))
  }

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    if (next.length > 0 && !next.some((image) => image.is_primary)) next[0].is_primary = true
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.image_url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <img src={image.image_url} alt="" className="size-full object-cover" />
            {image.is_primary && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Principale
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground hover:bg-white"
                  title="Définir comme image principale"
                >
                  <Star className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="flex size-7 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white"
                title="Supprimer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary',
          )}
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-xs font-medium">Ajouter</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}

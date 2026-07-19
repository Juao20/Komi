const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isCloudinaryConfigured(): boolean {
  return Boolean(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
}

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formats acceptés : JPEG, PNG, WEBP.'
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `L'image doit faire moins de ${MAX_FILE_SIZE_MB}Mo.`
  }
  return null
}

export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const result = await uploadToCloudinaryDetailed(file, folder)
  return result.url
}

export async function uploadToCloudinaryDetailed(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "L'envoi d'images n'est pas encore configuré. Renseignez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET.",
    )
  }

  const validationError = validateImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  if (folder) formData.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Échec de l'envoi de l'image.")
  }

  const data = (await response.json()) as { secure_url: string; public_id: string; width: number; height: number }
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height }
}

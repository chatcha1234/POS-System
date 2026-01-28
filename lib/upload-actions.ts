'use server'

import cloudinary from '@/lib/cloudinary'

export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    return { error: 'No file provided' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
        },
        (error, result) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    return { url: (result as { secure_url: string }).secure_url }
  } catch {
    return { error: 'Upload failed' }
  }
}

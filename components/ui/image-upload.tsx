'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { uploadToCloudinary } from '@/lib/upload-actions'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove?: () => void
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadToCloudinary(formData)
      
      if (result.url) {
        onChange(result.url)
      } else {
        alert('อัปโหลดล้มเหลว: ' + (result.error || 'Unknown error'))
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setIsUploading(false)
      // Reset input so verify same file can be selected again if needed (though mainly for cleanup)
      if (fileInputRef.current) {
          fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
      onChange('')
      if (onRemove) onRemove()
  }

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!value ? (
        <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-col items-center justify-center gap-4 min-h-[200px]"
        >
            {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <span className="text-sm">กำลังอัปโหลด...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="p-4 bg-gray-100 rounded-full">
                        <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">คลิกเพื่อเลือกรูปภาพ</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
                </div>
            )}
        </button>
      ) : (
        <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={value} 
              alt="Uploaded Image" 
              fill
              className="object-contain" 
            />
            <div className="absolute top-2 right-2">
                <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const ImageUpload = ({ value, onChange, placeholder = "Upload an image", className = "", disabled = false }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-hybrid', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        setPreview(data.url)
        const uploadType = data.type === 'cloudinary' ? 'Cloudinary' : 
                          data.type === 'local' ? 'local storage' : 'data URL'
        
        toast({
          title: "Image uploaded successfully",
          description: `Image uploaded to ${uploadType} and is ready to use.`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onChange('')
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload button */}
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={isUploading || disabled}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </>
          )}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Image preview */}
      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-xs"
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleUploadClick}
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-xs h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          </div>
        </div>
      )}

      {/* URL input as fallback */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Or enter image URL:
        </label>
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setPreview(e.target.value)
          }}
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default ImageUpload

"use client"

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, File, Image, Music, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FileUploadProps {
  type: 'sermon' | 'gallery' | 'settings'
  onUploadComplete?: (file: any) => void
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  className?: string
}

interface UploadedFile {
  id: string
  originalName: string
  filename: string
  type: string
  size: number
  mimeType: string
  url: string
  uploadedAt: string
}

export function FileUpload({ 
  type, 
  onUploadComplete, 
  accept = "*/*", 
  maxSize = 4, 
  multiple = false,
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    
    if (type === 'gallery' && !file.type.startsWith('image/')) {
      return 'Only image files are allowed for gallery'
    }
    
    if (type === 'sermon' && !file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      return 'Only audio or video files are allowed for sermons'
    }
    
    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast({
        title: "Upload Error",
        description: validationError,
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        const uploadedFile = result.file
        
        setUploadedFiles(prev => [uploadedFile, ...prev])
        
        toast({
          title: "Upload Successful",
          description: `${file.name} uploaded successfully`
        })
        
        if (onUploadComplete) {
          onUploadComplete(uploadedFile)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files)
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "Upload Error",
        description: "Only one file allowed",
        variant: "destructive"
      })
      return
    }
    
    fileArray.forEach(uploadFile)
  }, [multiple, toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Upload {type === 'gallery' ? 'Images' : type === 'sermon' ? 'Audio/Video' : 'Files'}</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {maxSize}MB {type === 'gallery' ? '(Images only)' : type === 'sermon' ? '(Audio/Video only)' : ''}
              </p>
            </div>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </>
              )}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Recently Uploaded</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.mimeType)}
                    <div>
                      <p className="font-medium text-sm">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

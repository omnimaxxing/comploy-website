'use client'

import React, { useState, useRef } from 'react'
import { Input, Button } from '@heroui/react'
import { Icon } from '@iconify/react'

interface FileUploadInputProps {
  label: string
  name: string
  accept?: string
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
  helperText?: string
  error?: string
  icon?: string
  onChange: (file: File | null) => void
}

export function FileUploadInput({
  label,
  name,
  accept = 'image/*',
  required = false,
  disabled = false,
  description,
  className = '',
  helperText,
  error,
  icon = 'lucide:image',
  onChange
}: FileUploadInputProps) {
  const [fileName, setFileName] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    if (file) {
      setFileName(file.name)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
      
      onChange(file)
    } else {
      setFileName('')
      setPreview(null)
      onChange(null)
    }
  }

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileName('')
    setPreview(null)
    onChange(null)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-col">
        <label className="block fl-text-step--1 font-medium fl-mb-xs">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {description && (
          <p className="fl-text-step--2 text-foreground/60 fl-mb-xs">{description}</p>
        )}
        
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            required={required}
            disabled={disabled}
            className="hidden"
            onChange={handleFileChange}
          />
          
          <Button
            type="button"
            color="primary"
            variant="bordered"
            radius="none"
            onClick={handleButtonClick}
            isDisabled={disabled}
            startContent={<Icon icon={icon} className="text-purple-400" />}
            className="border-purple-400 hover:border-purple-500 text-purple-500"
          >
            Choose File
          </Button>
          
          <div className="flex-1 ml-3">
            {fileName ? (
              <div className="flex items-center">
                <span className="fl-text-step--1 truncate">{fileName}</span>
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-red-400"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="fl-text-step--1 text-foreground/50">No file chosen</span>
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-red-400 fl-text-step--1 mt-1">{error}</p>
        )}

        {preview && (
          <div className="mt-4 relative">
            <div className="border border-foreground/10 rounded-sm overflow-hidden p-1 max-w-[300px]">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
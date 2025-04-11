'use client'

import React, { useState, useRef } from 'react'
import { Input, Button } from '@heroui/react'
import { Icon } from '@iconify/react'

interface MultiFileUploadInputProps {
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
  onChange: (files: File[]) => void
  maxFiles?: number
}

export function MultiFileUploadInput({
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
  onChange,
  maxFiles = 10
}: MultiFileUploadInputProps) {
  const [fileNames, setFileNames] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length > 0) {
      // Limit number of files if needed
      const filesToAdd = selectedFiles.slice(0, maxFiles - files.length)
      if (filesToAdd.length === 0) return

      // Update file names
      const newFileNames = [...fileNames, ...filesToAdd.map(file => file.name)]
      setFileNames(newFileNames)
      
      // Create previews for images
      const newFilePromises = filesToAdd.map(file => {
        if (file.type.startsWith('image/')) {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.readAsDataURL(file)
          })
        }
        return Promise.resolve('')
      })
      
      Promise.all(newFilePromises).then(newPreviews => {
        const filteredPreviews = newPreviews.filter(preview => preview !== '')
        setPreviews([...previews, ...filteredPreviews])
      })
      
      // Update files state and call onChange
      const updatedFiles = [...files, ...filesToAdd]
      setFiles(updatedFiles)
      onChange(updatedFiles)
    }
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    
    const newFileNames = [...fileNames]
    newFileNames.splice(index, 1)
    
    const newPreviews = [...previews]
    if (index < newPreviews.length) {
      newPreviews.splice(index, 1)
    }
    
    setFiles(newFiles)
    setFileNames(newFileNames)
    setPreviews(newPreviews)
    onChange(newFiles)
  }

  const handleClearAll = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileNames([])
    setPreviews([])
    setFiles([])
    onChange([])
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
            required={required && files.length === 0}
            disabled={disabled || files.length >= maxFiles}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          
          <Button
            type="button"
            color="primary"
            variant="bordered"
            radius="none"
            onClick={handleButtonClick}
            isDisabled={disabled || files.length >= maxFiles}
            startContent={<Icon icon={icon} className="text-purple-400" />}
            className="border-purple-400 hover:border-purple-500 text-purple-500"
          >
            Choose Files
          </Button>
          
          <div className="flex-1 ml-3">
            {files.length > 0 ? (
              <div className="flex items-center">
                <span className="fl-text-step--1">
                  {files.length} {files.length === 1 ? 'file' : 'files'} selected
                </span>
                {files.length > 0 && (
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-red-400"
                    onClick={handleClearAll}
                    disabled={disabled}
                  >
                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <span className="fl-text-step--1 text-foreground/50">No files chosen</span>
            )}
          </div>
        </div>
        
        {files.length >= maxFiles && (
          <p className="text-amber-400 fl-text-step--1 mt-1">
            Maximum file limit ({maxFiles}) reached
          </p>
        )}
        
        {error && (
          <p className="text-red-400 fl-text-step--1 mt-1">{error}</p>
        )}

        {fileNames.length > 0 && (
          <div className="mt-2">
            <ul className="space-y-1">
              {fileNames.map((name, index) => (
                <li key={index} className="flex items-center">
                  <Icon icon="lucide:file" className="w-4 h-4 mr-2 text-purple-400" />
                  <span className="fl-text-step--1 truncate flex-1">{name}</span>
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-red-400"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                  >
                    <Icon icon="lucide:x" className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {previews.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative border border-foreground/10 rounded-sm overflow-hidden p-1">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-auto object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500/80"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                  >
                    <Icon icon="lucide:x" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
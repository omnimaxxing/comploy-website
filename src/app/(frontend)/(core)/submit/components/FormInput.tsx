'use client'

import React from 'react'
import { Input, Textarea } from '@heroui/react'
import { Icon } from '@iconify/react'

type InputTypes = 'text' | 'textarea' | 'url' | 'email'

interface FormInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: InputTypes
  icon?: string // Iconify icon name
  required?: boolean
  disabled?: boolean
  description?: string
  maxLength?: number
  rows?: number
  className?: string
  helperText?: string
  error?: string
}

export function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  required = false,
  disabled = false,
  description,
  maxLength,
  rows = 4,
  className = '',
  helperText,
  error
}: FormInputProps) {
  const isTextarea = type === 'textarea'
  
  const commonProps = {
    label,
    name,
    value,
    onChange,
    placeholder,
    required,
    isDisabled: disabled,
    radius: "none" as const,
    variant: "bordered" as const,
    labelPlacement: "outside" as const,
    description,
    maxLength,
    className,
    errorMessage: error,
    ...(icon && {
      startContent: (
        <Icon 
          icon={icon} 
          className="text-foreground/40 pointer-events-none flex-shrink-0" 
        />
      )
    })
  }
  
  if (isTextarea) {
    return (
      <Textarea
        {...commonProps}
        minRows={rows}
      />
    )
  }
  
  return (
    <Input
      {...commonProps}
      type={type}
    />
  )
} 
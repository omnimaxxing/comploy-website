// src/components/BackArrow.js
'use client'
import { Button } from '@/components/ui/Button'
import { IconArrowLeft } from '@tabler/icons-react'
import React from 'react'

const BackArrow = () => {
  const handleBackArrowClick = () => {
    window.history.back()
  }

  return (
    <Button asChild variant="ghost" size="icon">
      <IconArrowLeft
        onClick={handleBackArrowClick}
        className=" text-primary-950 col-start-12 cursor-pointer transition-all hover:scale-90"
        size={14}
      />
    </Button>
  )
}

export default BackArrow

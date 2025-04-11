// components/ui/GalleryBentoGrid.tsx
'use client'

import { ImageMedia } from '@/components/Media/ImageMedia'
import RichText from '@/components/RichText'
import type { Media } from '@/payload-types' // Use the correct Media type from your project
import { motion } from 'framer-motion'
import type React from 'react'
import { useState } from 'react'

// Define the GalleryItem type that matches your content.gallery structure
interface GalleryItem {
  id?: string | null
  image: number | Media
}

interface GalleryBentoGridProps {
  title: string
  images: GalleryItem[] // Use GalleryItem type for the images prop
}

const GalleryBentoGrid: React.FC<GalleryBentoGridProps> = ({ title, images }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null) // Track selected image index

  // Handle image click to expand to fullscreen
  const handleImageClick = (index: number) => {
    setSelectedImage(index)
  }

  // Close fullscreen mode
  const handleCloseFullscreen = () => {
    setSelectedImage(null)
  }

  return (
    <div className="relative col-span-12 grid grid-cols-12 gap-4">
      {/* First Image: Takes up 8 columns and 2 rows */}
      <div
        key={images[0].id || 0}
        className="relative overflow-hidden rounded-lg cursor-pointer col-span-12 md:col-span-8 md:row-span-2"
        onClick={() => handleImageClick(0)}
      >
        <ImageMedia
          resource={images[0].image}
          alt={`${title} - image 1`}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-white opacity-20 mix-blend-overlay rounded-lg" />
      </div>

      {/* Second Image: Takes up 4 columns and 1 row */}
      <div
        key={images[1]?.id || 1}
        className="relative overflow-hidden rounded-lg cursor-pointer md:col-span-4 col-span-12 md:row-span-1"
        onClick={() => handleImageClick(1)}
      >
        <ImageMedia
          resource={images[1].image}
          alt={`${title} - image 2`}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-white opacity-20 mix-blend-overlay col-span-12 rounded-lg" />
      </div>

      {/* Third Image: Takes up 4 columns and 1 row */}
      <div
        key={images[2]?.id || 2}
        className="relative overflow-hidden rounded-lg cursor-pointer col-span-12 md:col-span-4 md:row-span-1"
        onClick={() => handleImageClick(2)}
      >
        <ImageMedia
          resource={images[2].image}
          alt={`${title} - image 3`}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-white opacity-20 mix-blend-overlay rounded-lg" />
      </div>

      {/* Fullscreen Image View */}
      {selectedImage !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseFullscreen}
        >
          <div className="relative max-w-4xl mx-auto p-4">
            <ImageMedia
              resource={images[selectedImage].image}
              alt={`${title} - fullscreen image`}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default GalleryBentoGrid

import type { CollectionBeforeChangeHook } from 'payload'
import type { Plugin } from '@/payload-types'

export const setMainImage: CollectionBeforeChangeHook<Plugin> = async ({ 
  data,
  req,
}) => {
  try {
    // If there are images in the gallery, use the first one as the main image
    if (data.imagesGallery && Array.isArray(data.imagesGallery) && data.imagesGallery.length > 0) {
      const firstImage = data.imagesGallery[0]
      
      // Only set the main image if we have a valid image reference
      if (firstImage) {
        // Set the main image to the first gallery image
        data.mainImage = firstImage
      }
    }
    
    return data
  } catch (error) {
    console.error('Error in setMainImage hook:', error)
    return data // Return data unchanged if there's an error
  }
} 
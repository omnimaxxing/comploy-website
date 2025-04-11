import { APIError } from 'payload'
import type { CollectionBeforeChangeHook } from 'payload'

export const generateBlurDataURL: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    try {
      // Check if the file is an SVG
      if (req.file?.mimetype === 'image/svg+xml') {
        // For SVGs, we don't generate a blur data URL
        return data
      }

      // For other image types, generate the blur data URL
      const blurBuffer = req?.payloadUploadSizes?.blur
      if (blurBuffer && Buffer.isBuffer(blurBuffer)) {
        const base64String = blurBuffer.toString('base64')
        const mimeType = req.file?.mimetype || 'image/webp'
        const blurDataURL = `data:${mimeType};base64,${base64String}`
        return {
          ...data,
          blurDataURL,
        }
      }
      // If blur buffer is not available, return the data as is
      return data
    } catch (error) {
      console.error('Error generating blur data URL:', error)
      // Instead of throwing an error, we'll just return the original data
      return data
    }
  }
  return data
}

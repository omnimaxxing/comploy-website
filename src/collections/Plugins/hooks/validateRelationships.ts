import type { CollectionBeforeValidateHook } from 'payload'
import type { Plugin } from '@/payload-types'

/**
 * Validates relationship fields to ensure they have the correct format
 * before they're saved to the database
 */
export const validateRelationships: CollectionBeforeValidateHook<Plugin> = async ({ 
  data,
  operation,
  req,
}) => {
  // If no data is provided, return early
  if (!data) return data;

  // When saving versions in Postgres, there can be an issue with relationship formats
  // This hook ensures relationships are in the correct format
  if (data.category) {
    // If it's already a simple ID (string or number), that's valid
    if (typeof data.category === 'string' || typeof data.category === 'number') {
      // This format is valid, no change needed
    } 
    // If it's in the relationship object format, validate it
    else if (typeof data.category === 'object') {
      if ('relationTo' in data.category && 'value' in data.category) {
        const value = data.category.value
        // If the value is a valid ID type, it's ok
        if (typeof value === 'string' || typeof value === 'number') {
          // Valid format
        } else {
          // Invalid value type, remove to prevent errors
          console.warn('Invalid category value format detected, removing to prevent database error')
          delete data.category
        }
      } else {
        // Not in expected format, remove it
        console.warn('Category is not in expected format, removing to prevent database error')
        delete data.category
      }
    }
  }

  // Handle tags which is a hasMany relationship
  if (data.tags && Array.isArray(data.tags)) {
    // Filter out any invalid tag relationships
    data.tags = data.tags.filter(tag => {
      if (typeof tag === 'string' || typeof tag === 'number') {
        return true
      }
      if (typeof tag === 'object' && tag && 'relationTo' in tag && 'value' in tag) {
        const value = tag.value
        return typeof value === 'string' || typeof value === 'number'
      }
      console.warn('Invalid tag format detected, filtering it out to prevent database error')
      return false
    })
  }

  return data
} 
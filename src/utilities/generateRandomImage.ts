import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { faker } from '@faker-js/faker'

interface RandomImageOptions {
  width?: number
  height?: number
}

export async function generateRandomImage(options: RandomImageOptions = {}) {
  const {
    width = 1200,
    height = 800
  } = options

  const payload = await getPayload({ config: configPromise })

  try {
    // Use Picsum Photos for random images
    const seed = faker.number.int()
    const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`
    const alt = 'Random showcase image'

    // Create media document in Payload
    const media = await payload.create({
      collection: 'media',
      data: {
        url: imageUrl,
        alt,
        filename: `showcase-image-${faker.string.alphanumeric(8)}.jpg`
      }
    })

    return media.id
  } catch (error) {
    console.error('Error generating random image:', error)
    throw error
  }
} 
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { generateRandomShowcase } from '@/utilities/generateRandomShowcase'
import { generateRandomImage } from '@/utilities/generateRandomImage'
import type { Showcase } from '@/payload-types'

export async function GET() {
  return Response.json({
    error: 'Method not allowed',
    message: 'Please use POST request to seed the showcase gallery.',
    example: {
      method: 'POST',
      url: '/api/showcases/seed'
    }
  }, { status: 405 })
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Generate 50 random showcases
    const showcases: Showcase[] = []
    for (let i = 0; i < 50; i++) {
      try {
        // Generate random showcase data
        const showcaseData = generateRandomShowcase()

        // Generate random image
        const imageId = await generateRandomImage()

        // Create showcase in database
        const showcase = await payload.create({
          collection: 'showcases',
          data: {
            ...showcaseData,
            image: imageId,
            views: Math.floor(Math.random() * 1000) // Random view count
          }
        })

        showcases.push(showcase as Showcase)
      } catch (error) {
        console.error('Error creating showcase:', error)
        // Continue with the next iteration even if one fails
        continue
      }
    }

    return Response.json({
      success: true,
      message: `Successfully created ${showcases.length} showcases`,
      showcases: showcases.map(s => s.id)
    }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error seeding showcases:', message)
    return Response.json({ error: message }, { status: 500 })
  }
} 
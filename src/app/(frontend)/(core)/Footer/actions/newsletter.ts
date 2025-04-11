'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

let payload: any

async function initializePayload() {
  if (!payload) {
    payload = await getPayload({ config: configPromise })
  }
}

interface NewsletterState {
  error?: string
  success?: boolean
}

export async function subscribeToNewsletter(_prevState: NewsletterState | null, formData: FormData): Promise<NewsletterState> {
  try {
    await initializePayload()

    const email = formData.get('email-address')

    if (!email) {
      return {
        error: 'Please enter your email address',
      }
    }

    const emailStr = email.toString().toLowerCase()

    // Check if email already exists
    const existingSubscriber = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        email: {
          equals: emailStr,
        },
      },
    })

    if (existingSubscriber.docs.length > 0) {
      return {
        error: 'This email is already subscribed to our newsletter!',
      }
    }

    // Create newsletter subscriber using Payload CMS
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email: emailStr,
        source: 'footer',
        subscribed: true,
        preferences: {
          productUpdates: true,
          promotions: true,
          blogPosts: true,
        },
      },
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return {
      error: 'Failed to subscribe to newsletter',
    }
  }
} 
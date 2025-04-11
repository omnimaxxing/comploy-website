import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { faker } from '@faker-js/faker'
import slugify from 'slugify'
import { generateRandomImage } from '@/utilities/generateRandomImage'
import type { Resource } from '@/payload-types'

// Define a simplified RichText structure to match Payload's Lexical format
type RichTextContent = {
  root: {
    type: string;
    children: {
      type: string;
      children: {
        text: string;
        type: string;
        version: number;
      }[];
      direction: 'ltr' | 'rtl' | null;
      format: string;
      indent: number;
      version: number;
    }[];
    direction: 'ltr' | 'rtl' | null;
    format: string;
    indent: number;
    version: number;
  };
}

// Generate a random resource
interface RandomResource {
  title: string
  description: string
  resourceType: 'tutorial' | 'blog' | 'video' | 'tool'
  source: 'external' | 'internal'
  externalLink?: string
  sourcePlatform?: 'youtube' | 'medium' | 'github' | 'dev' | 'other'
  videoID?: string
  content?: RichTextContent
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  featured: boolean
  publishedDate: string
  slug: string
  status: 'pending' | 'published' | 'rejected'
}

// Lists of resource topics for more realistic data
const resourceTopics = [
  'Getting Started with Payload CMS',
  'Building a Blog with Payload',
  'E-commerce Solutions with Payload',
  'Authentication and Authorization',
  'Custom Field Types',
  'Webhooks and API Integration',
  'Building Plugins for Payload',
  'Performance Optimization',
  'Search Functionality',
  'Content Modeling Best Practices',
  'Deploying Payload Applications',
  'Payload with Next.js',
  'Database Migration Strategies',
  'i18n and Localization',
  'Headless CMS Architecture',
  'Content Versioning',
  'Media Management',
  'GraphQL vs REST in Payload',
  'User Management and Roles',
  'Payload Admin UI Customization'
]

// Generate YouTube video IDs (these are actual Payload CMS videos)
const youtubeVideoIds = [
  'a-rqz_1wMg0', // "Payload CMS Tutorial | Getting started with the Payload Headless CMS"
  'bQvp3Gq4rkA', // "Why I Use Payload CMS Instead of Strapi, Sanity, Contentful, and Others"
  'vkYRvV54-Sw', // "Lets build a blog with Payload CMS and Next.js App Router"
  'EW2aelCK7NQ', // "I wish I knew these with Payload CMS"
  'Y_CzlnZfqVQ', // "Headless CMS for Developers - Payload CMS"
  'dLfwOBL9AlU', // "Authentication with Payload CMS"
  'TfdDlxprP8g', // "Payload CMS: getting started"
  'cETPhr9HHxA', // "Build a WordPress alternative with Payload CMS, Next.js & Digital Ocean"
  'l0rYimf4W0M', // "How to build an e-commerce app"
  'n9oPE9wP3Tw'  // "Full Stack App with Authentication, File Upload and Payments"
]

// Function to generate a random resource
function generateRandomResource(): RandomResource {
  // Pick a random topic or generate one
  const topic = faker.helpers.arrayElement(resourceTopics)
  
  // Determine resource type
  const resourceType = faker.helpers.arrayElement(['tutorial', 'blog', 'video', 'tool']) as RandomResource['resourceType']
  
  // Generate title based on resource type
  let title: string
  switch (resourceType) {
    case 'tutorial':
      title = `How to ${topic}`
      break
    case 'blog':
      title = `${faker.number.int({ min: 5, max: 12 })} Ways to ${topic}`
      break
    case 'video':
      title = `${topic} - Video Tutorial`
      break
    case 'tool':
      title = `${faker.company.name()} - A Tool for ${topic}`
      break
  }
  
  // Determine if it's external or internal content
  const source = faker.helpers.arrayElement(['external', 'internal']) as RandomResource['source']
  
  // Generate description
  const description = faker.lorem.paragraph().substring(0, 160)
  
  // Generate external link and platform if external
  let externalLink: string | undefined
  let sourcePlatform: RandomResource['sourcePlatform'] | undefined
  let videoID: string | undefined
  
  if (source === 'external') {
    sourcePlatform = faker.helpers.arrayElement(['youtube', 'medium', 'github', 'dev', 'other'])
    
    switch (sourcePlatform) {
      case 'youtube':
        videoID = faker.helpers.arrayElement(youtubeVideoIds)
        externalLink = `https://www.youtube.com/watch?v=${videoID}`
        break
      case 'medium':
        externalLink = `https://medium.com/@${faker.internet.userName()}/${slugify(title, { lower: true })}-${faker.string.alphanumeric(6)}`
        break
      case 'github':
        externalLink = `https://github.com/${faker.internet.userName()}/${slugify(title, { lower: true })}`
        break
      case 'dev':
        externalLink = `https://dev.to/${faker.internet.userName()}/${slugify(title, { lower: true })}`
        break
      case 'other':
        externalLink = faker.internet.url()
        break
    }
  }
  
  // Generate content if internal
  const content = source === 'internal' 
    ? {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ text: faker.lorem.paragraph(), type: 'text', version: 1 }],
              direction: null,
              format: '',
              indent: 0,
              version: 1
            },
            {
              type: 'paragraph',
              children: [{ text: faker.lorem.paragraph(), type: 'text', version: 1 }],
              direction: null,
              format: '',
              indent: 0,
              version: 1
            },
            {
              type: 'paragraph',
              children: [{ text: faker.lorem.paragraph(), type: 'text', version: 1 }],
              direction: null,
              format: '',
              indent: 0,
              version: 1
            }
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1
        }
      }
    : undefined
  
  // Generate difficulty level
  const difficulty = faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']) as RandomResource['difficulty']
  
  // Generate published date (within last year)
  const publishedDate = faker.date.past({ years: 1 }).toISOString()
  
  // Generate slug
  const sanitizeSlug = (text: string): string => {
    // Create a clean slug that only contains alphanumeric characters, hyphens, and underscores
    const cleanSlug = slugify(text, {
      lower: true,     // Convert to lowercase
      strict: true,    // Strip special characters
      trim: true       // Trim leading/trailing spaces
    });
    
    // Further sanitize to ensure only valid characters
    return cleanSlug.replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
  };

  const slug = sanitizeSlug(title);
  
  // Always set as pending for the seed data to avoid admin access issues
  const status = 'published'
  
  return {
    title,
    description,
    resourceType,
    source,
    ...(externalLink && { externalLink }),
    ...(sourcePlatform && { sourcePlatform }),
    ...(videoID && { videoID }),
    ...(content && { content }),
    ...(difficulty && { difficulty }),
    featured: false, // Always set to false to avoid admin check issues
    publishedDate,
    slug,
    status,
  }
}

// API Routes
export async function GET() {
  return Response.json({
    error: 'Method not allowed',
    message: 'Please use POST request to seed the resources collection.',
    example: {
      method: 'POST',
      url: '/api/resources/seed'
    }
  }, { status: 405 })
}

export async function POST(req: Request) {
  try {
    // Initialize Payload with standard config
    const payload = await getPayload({ config: configPromise })
    
    // Check if we need to clean existing data first
    const params = new URL(req.url).searchParams
    const cleanExisting = params.get('clean') === 'true'
    
    if (cleanExisting) {
      try {
        // Delete existing resources - but don't error if it fails due to permissions
        const existingResources = await payload.find({
          collection: 'resources',
          limit: 1000,
        })
        
        for (const resource of existingResources.docs) {
          try {
            await payload.delete({
              collection: 'resources',
              id: resource.id
            })
          } catch (error) {
            console.warn(`Could not delete resource ${resource.id}:`, error)
            // Continue with the next item
          }
        }
      } catch (error) {
        console.warn('Could not clean existing resources:', error)
        // Continue with the seeding process
      }
    }
    
    // Keep track of the number of resources successfully created
    let successfullyCreated = 0
    
    // Generate a maximum of 50 random resources
    const resources: Resource[] = []
    const maxAttempts = 100 // Set a maximum number of attempts to avoid infinite loops
    let attempts = 0
    
    while (successfullyCreated < 50 && attempts < maxAttempts) {
      attempts++
      try {
        // Generate random resource data
        const resourceData = generateRandomResource()
        
        // Generate random image - using the same utility as the showcases
        const imageId = await generateRandomImage({
          width: 800,
          height: 600
        })
        
        // Create resource in database
        const resource = await payload.create({
          collection: 'resources',
          data: {
            ...resourceData,
            image: imageId,
          } as any // Use type assertion to bypass type checking
        })
        
        resources.push(resource as Resource)
        successfullyCreated++
      } catch (error) {
        console.error('Error creating resource:', error)
        // Continue with the next iteration even if one fails
      }
    }
    
    return Response.json({
      success: true,
      message: `Successfully created ${resources.length} resources out of ${attempts} attempts`,
      resources: resources.map(r => r.id)
    }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error seeding resources:', message)
    return Response.json({ error: message }, { status: 500 })
  }
} 
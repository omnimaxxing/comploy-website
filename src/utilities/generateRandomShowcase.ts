import { faker } from '@faker-js/faker'
import slugify from 'slugify'

interface RandomShowcase {
  name: string
  description: string
  websiteUrl: string
  githubUrl?: string
  featured: boolean
  slug: string
  _status: 'published'
}

const techStacks = [
  'Next.js', 'React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
  'GraphQL', 'Tailwind CSS', 'Material UI', 'AWS', 'Vercel', 'Firebase'
]

const projectTypes = [
  'E-commerce', 'Blog', 'Portfolio', 'Dashboard', 'Social Network',
  'Learning Platform', 'Booking System', 'Analytics Tool', 'CRM System'
]

export function generateRandomShowcase(): RandomShowcase {
  // Generate a creative project name
  const projectType = faker.helpers.arrayElement(projectTypes)
  const name = `${faker.company.name()} ${projectType}`

  // Generate a detailed description
  const techStack = faker.helpers.arrayElements(techStacks, { min: 2, max: 4 }).join(', ')
  const description = `A sophisticated ${projectType.toLowerCase()} built with Payload CMS and ${techStack}. ${faker.company.catchPhrase()}. Features include ${faker.helpers.arrayElements([
    'real-time updates',
    'responsive design',
    'advanced search',
    'user authentication',
    'analytics dashboard',
    'API integration',
    'payment processing',
    'content management'
  ], { min: 2, max: 3 }).join(', ')}.`

  // Generate URLs
  const websiteUrl = faker.internet.url()
  const hasGithub = faker.datatype.boolean(0.7) // 70% chance of having a GitHub link
  const githubUrl = hasGithub ? `https://github.com/${faker.internet.userName()}/${faker.helpers.slugify(name.toLowerCase())}` : undefined

  // Generate other fields
  const featured = faker.datatype.boolean(0.2) // 20% chance of being featured
  const slug = slugify(name, { lower: true, strict: true })

  return {
    name,
    description,
    websiteUrl,
    ...(githubUrl && { githubUrl }),
    featured,
    slug,
    _status: 'published'
  }
} 
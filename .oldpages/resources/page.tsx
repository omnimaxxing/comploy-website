import { notFound } from 'next/navigation'
import { generateGlobalMetadata } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { HomeGlobal } from '@/payload-types'
import { draftMode } from 'next/headers'
import { cn } from '@/utilities/cn'
import { Divider } from '@heroui/react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Meteors } from '@/components/ui/Meteors'
import { Stars } from '@/components/ui/Stars'
import Image from 'next/image'
import { noindex } from "@/seo/noindex"
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { ResourcesTab, ResourceCategory } from '@/components/resources/ResourcesTab'
import { cache } from 'react'
import { isSameDay } from 'date-fns'
import { Resource } from '@/payload-types'
import { ResourcesCategoryTabs } from '@/components/resources/ResourcesCategoryTabs'

// Static content categories data
const contentCategories: ResourceCategory[] = [
	{
		id: 'tutorials',
		title: 'Tutorials',
		description: 'Learn how to use Payload CMS with step-by-step tutorials.',
		icon: 'heroicons:book-open',
		color: 'emerald', // Green for tutorials
		gradientFrom: 'from-emerald-500/20',
		gradientTo: 'to-emerald-400/5',
		glowColor: 'emerald-500/10',
		borderColor: 'emerald-400/40',
		animationDelay: '0s',
	},
	{
		id: 'blog',
		title: 'Blog',
		description: 'Read the latest news and updates from the Payload CMS community.',
		icon: 'heroicons:document-text',
		color: 'purple', // Purple for blog
		gradientFrom: 'from-purple-500/20',
		gradientTo: 'to-purple-400/5',
		glowColor: 'purple-500/10',
		borderColor: 'purple-400/40',
		animationDelay: '2s',
	},
	{
		id: 'videos',
		title: 'Videos',
		description: 'Watch tutorials, demos, and presentations about Payload CMS.',
		icon: 'heroicons:play-circle',
		color: 'rose', // Red for videos
		gradientFrom: 'from-rose-500/20',
		gradientTo: 'to-rose-400/5',
		glowColor: 'rose-500/10',
		borderColor: 'rose-400/40',
		animationDelay: '4s',
	},
	{
		id: 'tools',
		title: 'Tools',
		description: 'Discover useful tools and utilities for Payload CMS development.',
		icon: 'heroicons:wrench-screwdriver',
		color: 'blue', // Blue for tools
		gradientFrom: 'from-blue-500/20',
		gradientTo: 'to-blue-400/5',
		glowColor: 'blue-500/10',
		borderColor: 'blue-400/40',
		animationDelay: '6s',
	}
];

// Cache resources fetch function
const getCachedResources = cache(async (type: string): Promise<Resource[]> => {
	const payload = await getPayload({ config: configPromise })

	try {
		const response = await payload.find({
			collection: 'resources' as any, // Use type assertion to bypass TypeScript check
			where: {
				resourceType: {
					equals: type
				},
				status: {
					equals: 'published'
				}
			},
			sort: '-publishedDate',
			limit: 6,
			depth: 1
		})

		// Transform the response to match our Resource interface
		return response.docs.map(doc => ({
			id: doc.id,
			title: doc.title || '',
			description: doc.description,
			resourceType: doc.resourceType,
			source: doc.source,
			externalLink: doc.externalLink,
			slug: doc.slug,
			publishedDate: doc.publishedDate,
			sourcePlatform: doc.sourcePlatform,
			image: doc.image,
			difficulty: doc.difficulty,
			status: doc.status,
			updatedAt: doc.updatedAt,
			createdAt: doc.createdAt
		})) as Resource[]
	} catch (error) {
		console.error(`Error fetching ${type} resources:`, error)
		return []
	}
})

// Badge to show NEW label for resources published in the last 7 days
const isNewResource = (publishedDate: string | null | undefined): boolean => {
	if (!publishedDate) return false;
	
	const today = new Date();
	const published = new Date(publishedDate);
	const diffTime = Math.abs(today.getTime() - published.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	
	return diffDays <= 7;
}

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

export const metadata = {
	title: "Payload Plugins - Resources & Knowledge Base",
	description: "Discover tutorials, articles, videos and tools for Payload CMS development.",
	robots: noindex,
};

export default async function ResourcesPage() {
	try {
		const { isEnabled: draft } = await draftMode();
		
		// Fetch resources for each category in parallel
		const tutorialsPromise = getCachedResources('tutorial');
		const blogPromise = getCachedResources('blog');
		const videosPromise = getCachedResources('video');
		const toolsPromise = getCachedResources('tool');
		
		const [tutorials, blog, videos, tools] = await Promise.all([
			tutorialsPromise,
			blogPromise,
			videosPromise,
			toolsPromise
		]);
		
		// Map resources to categories
		const resourcesByCategory = {
			tutorials,
			blog,
			videos,
			tools
		};
		
		// Calculate counts for category badges
		const counts = {
			tutorials: tutorials.length,
			blog: blog.length,
			videos: videos.length,
			tools: tools.length
		};

		return (
			<main className="relative overflow-hidden">
				<section className="relative fl-py-xl">
					<div className="u-container">
						<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold mb-2">Resources & Knowledge Base</h1>
								<p className="text-white/70 max-w-2xl">
									Discover tutorials, blog posts, videos, and tools to help you build better applications with Payload CMS.
								</p>
							</div>
							
							<Link 
								href="/resources/submit"
								className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-md hover:bg-primary transition-colors"
							>
								<Icon icon="heroicons:plus" className="mr-2 w-5 h-5" />
								Submit Resource
							</Link>
						</div>
						
						{/* Use client component for the accordion tabs */}
						<ResourcesCategoryTabs 
							contentCategories={contentCategories} 
							resourcesByCategory={resourcesByCategory} 
						/>
						
						{/* Browse all resources section */}
						<div className="mt-12 pt-8 border-t border-white/10">
							<h2 className="text-2xl font-bold mb-6">Browse All Resources</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{contentCategories.map((category) => (
									<Link
										key={category.id}
										href={`/resources/${category.id}`}
										className={cn(
											"p-4 rounded-lg border transition-all",
											`border-${category.color}-500/20 hover:border-${category.color}-500/40`,
											`bg-${category.color}-500/5 hover:bg-${category.color}-500/10`,
										)}
									>
										<div className="flex items-center gap-3">
											<div className={cn(
												"flex items-center justify-center w-10 h-10 rounded-full",
												`bg-${category.color}-500/20`
											)}>
												<Icon icon={category.icon} className={`text-${category.color}-400 w-5 h-5`} />
											</div>
											
											<div>
												<h3 className={`text-${category.color}-300 font-medium`}>{category.title}</h3>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-xs text-white/60">
														{counts[category.id as keyof typeof counts] || 0} resources
													</span>
													<Icon icon="heroicons:arrow-right" className={`text-${category.color}-400 w-4 h-4`} />
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</div>
				</section>
				
				{draft && <LivePreviewListener />}
			</main>
		);
	} catch (error) {
		console.error(error);
		return notFound();
	}
}

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import type { LegalDoc } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { Link } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Meteors } from '@/components/ui/Meteors'
import { Stars } from '@/components/ui/Stars'

interface LegalDocClientProps {
	post: LegalDoc
}

type Args = {
	params: Promise<{
		slug?: string
	}>
}

// Create a cosmic background component for consistency
const CosmicBackground = () => {
	return (
		<>
			{/* Extended cosmic background that fades throughout the page */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60 pointer-events-none"></div>

			{/* Stars that extend throughout the page with fading effect */}
			<div className="absolute inset-0 pointer-events-none">
				<Stars number={120} className="z-0 opacity-70" />
			</div>

			{/* Edge fading gradients - responsive with fluid scaling */}
			<div className="absolute inset-x-0 top-0 h-[5vh] sm:h-[8vh] md:h-[10vh] lg:h-[12vh] bg-gradient-to-b from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-x-0 bottom-0 h-[5vh] sm:h-[8vh] md:h-[10vh] lg:h-[12vh] bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-y-0 left-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-y-0 right-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-l from-black via-black/80 to-transparent z-20"></div>
		</>
	)
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
	const { slug = '' } = await paramsPromise
	const legalDoc = await queryDocBySlug({ slug })

	return generateMeta({ doc: legalDoc })
}

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise })

	const legalDocs = await payload.find({
		collection: 'legal-docs',
		draft: false,
		limit: 1000,
		overrideAccess: false,
		select: {
			slug: true,
		},
	})

	const params = legalDocs.docs.map(({ slug }) => {
		return { slug }
	})

	return params
}

// Page component
export default async function LegalDocsServer({ params: paramsPromise }: Args) {
	const { slug = '' } = await paramsPromise

	const url = `/legal/${slug}`
	const doc = await queryDocBySlug({ slug })
	const { isEnabled: draft } = await draftMode()
	if (!doc) return <PayloadRedirects url={url} />

	return (
		<main className="relative overflow-hidden min-h-screen">
			<CosmicBackground />
			<Meteors number={6} className="z-[30] opacity-70" />

			{/* Document Content Section */}
			<div className="u-container relative z-10 py-20">
				<div className="max-w-3xl mx-auto">
					{/* Content Card */}
					<div className="bg-background/20 backdrop-blur-sm rounded-xl overflow-hidden p-8">
						<article>
							<header className="mb-8 border-b border-white/10 pb-6">
								<h1 className="fl-text-step-2 mb-3">{doc.title}</h1>
								{doc.updatedAt && (
									<p className="text-white/60 text-sm">
										Last updated:{' '}
										{new Date(doc.updatedAt).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</p>
								)}
							</header>

							{/* Document Content */}
							<div className="prose prose-invert max-w-none prose-headings:border-b prose-headings:border-white/10 prose-headings:pb-2 prose-headings:mb-4 prose-p:text-white/80 prose-a:text-white prose-a:no-underline prose-a:border-b prose-a:border-white/30 hover:prose-a:border-white">
								<RichText content={doc.content} enableGutter={false} />
							</div>
						</article>
					</div>
				</div>
			</div>

			{draft && <LivePreviewListener />}
		</main>
	)
}

const queryDocBySlug = cache(async ({ slug }: { slug: string }) => {
	const { isEnabled: draft } = await draftMode()

	const payload = await getPayload({ config: configPromise })

	const result = await payload.find({
		collection: 'legal-docs',
		draft,
		limit: 1,
		overrideAccess: draft,
		depth: 4,
		pagination: false,
		where: {
			slug: {
				equals: slug,
			},
		},
	})

	return result.docs?.[0] || null
})

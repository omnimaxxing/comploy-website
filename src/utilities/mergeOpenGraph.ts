import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import type { Media } from '@/payload-types'

const SITE_NAME = 'Omnipixel'
const TITLE_SEPARATOR = ' | '

type OpenGraphImage = {
	url: URL | string
	width: number
	height: number
	alt: string
}

type BaseOpenGraph = {
	siteName: string
	locale: string
	images: OpenGraphImage[]
	twitter: {
		card: 'summary' | 'summary_large_image'
		site: string
		creator: string
	}
}

type WebsiteOpenGraph = BaseOpenGraph & {
	type: 'website'
	title: string
	description: string
}

type ArticleOpenGraph = BaseOpenGraph & {
	type: 'article'
	title: string
	description: string
	publishedTime: string
	modifiedTime: string
	section: string
	authors: string[]
}

type OpenGraphType = WebsiteOpenGraph | ArticleOpenGraph

const defaultOpenGraph: WebsiteOpenGraph = {
	type: 'website',
	siteName: SITE_NAME,
	title: 'Modern Software Development',
	description:
		'Omnipixel is a software development company specializing in modern web applications, mobile development, and digital transformation.',
	locale: 'en_US',
	images: [
		{
			url: `${getServerSideURL()}/omnipixelogdef.jpg`,
			width: 1250,
			height: 665,
			alt: 'Omnipixel - Software Development Company',
		},
	],
	twitter: {
		card: 'summary_large_image',
		site: '@omnipixel',
		creator: '@omnipixel',
	},
}

type FAQItem = {
	question: string
	answer: string
}

type HowToStep = {
	name: string
	text: string
	image?: Media
}

type StructuredDataType = {
	'@type':
		| 'Organization'
		| 'FAQPage'
		| 'HowTo'
		| 'Article'
		| 'BreadcrumbList'
		| 'Service'
		| 'AggregateOffer'
		| 'PriceSpecification'
		| 'WebPage'
		| 'SoftwareApplication'
		| 'Product'
		| 'Review'
		| 'ItemList'
		| 'WebSite'
		| 'SearchAction'
		| 'Question'
		| 'Answer'
		| 'HowToStep'
		| 'ImageObject'
		| 'Person'
		| 'ContactPoint'
		| 'PostalAddress'
		| 'Offer'
		| 'AggregateRating'
		| 'CreativeWork'
		| 'ListItem'
		| 'SpeakableSpecification'
	'@context': 'https://schema.org'
	[key: string]: any
}

interface SEOData {
	title?: string
	description?: string
	ogImage?: Media | string | number | null
	canonicalUrl?: string
	keywords?: string
	additionalMetaTags?: Array<{ name: string; content: string }>
	structuredData?: StructuredDataType | StructuredDataType[]
	faq?: FAQItem[]
	howTo?: {
		name: string
		description: string
		steps: HowToStep[]
	}
	speakable?: {
		cssSelector: string[]
	}
	breadcrumbs?: Array<{
		name: string
		item: string
	}>
	isAnswerPage?: boolean
}

function isMediaObject(obj: any): obj is Media {
	return obj && typeof obj === 'object' && 'url' in obj
}

function formatTitle(pageTitle?: string): string {
	if (!pageTitle) return `${SITE_NAME} ${TITLE_SEPARATOR} ${defaultOpenGraph.title}`
	if (pageTitle.includes(SITE_NAME)) return pageTitle
	return `${SITE_NAME} ${TITLE_SEPARATOR} ${pageTitle}`
}

export const mergeOpenGraph = (
	og: Metadata['openGraph'] | undefined,
	seoData: SEOData | undefined,
	type: 'website' | 'article' = 'website',
): OpenGraphType => {
	const baseOG: BaseOpenGraph = {
		siteName: defaultOpenGraph.siteName,
		locale: defaultOpenGraph.locale,
		images: defaultOpenGraph.images,
		twitter: defaultOpenGraph.twitter,
	}

	const pageTitle =
		seoData?.title || (typeof og?.title === 'string' ? og.title : defaultOpenGraph.title)
	const title = formatTitle(pageTitle)
	const description =
		seoData?.description ||
		(typeof og?.description === 'string' ? og.description : defaultOpenGraph.description)

	let images = defaultOpenGraph.images
	if (seoData?.ogImage && isMediaObject(seoData.ogImage)) {
		images = [
			{
				// @ts-expect-error
				url: seoData.ogImage.url,
				width: 1200,
				height: 630,
				alt: seoData.ogImage.alt || title,
			},
		]
	}

	if (type === 'article') {
		return {
			...baseOG,
			type: 'article',
			title,
			description,
			images,
			publishedTime: new Date().toISOString(),
			modifiedTime: new Date().toISOString(),
			section: 'Technology',
			authors: ['https://omnipixel.ai/about'],
		}
	}

	return {
		...baseOG,
		type: 'website',
		title,
		description,
		images,
	}
}

export const generateMetadata = (
	seoData?: SEOData,
	type: 'website' | 'article' = 'website',
): Metadata => {
	const openGraph = mergeOpenGraph(undefined, seoData, type)

	// Combine all structured data
	const structuredDataArray: StructuredDataType[] = []

	// Add main structured data if exists
	if (seoData?.structuredData) {
		if (Array.isArray(seoData.structuredData)) {
			structuredDataArray.push(...seoData.structuredData)
		} else {
			structuredDataArray.push(seoData.structuredData)
		}
	}

	// Add FAQ schema if exists
	if (seoData?.faq?.length) {
		structuredDataArray.push({
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: seoData.faq.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer,
				},
			})),
		})
	}

	// Add HowTo schema if exists
	if (seoData?.howTo) {
		structuredDataArray.push({
			'@context': 'https://schema.org',
			'@type': 'HowTo',
			name: seoData.howTo.name,
			description: seoData.howTo.description,
			step: seoData.howTo.steps.map((step) => ({
				'@type': 'HowToStep',
				name: step.name,
				text: step.text,
				...(step.image && { image: step.image.url }),
			})),
		})
	}

	// Add breadcrumbs if exists
	if (seoData?.breadcrumbs?.length) {
		structuredDataArray.push({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: seoData.breadcrumbs.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: item.item,
			})),
		})
	}

	return {
		metadataBase: new URL(getServerSideURL()),
		title: openGraph.title,
		description: seoData?.description || openGraph.description,
		openGraph,
		keywords: seoData?.keywords,
		...(seoData?.canonicalUrl && { canonical: seoData.canonicalUrl }),
		robots: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
			...(seoData?.isAnswerPage && { 'max-video-preview': 0 }),
		},
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
			yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
		},
		...(structuredDataArray.length > 0 && {
			other: {
				'script:ld+json': structuredDataArray.map((data) => JSON.stringify(data)),
			},
		}),
		...(seoData?.speakable && {
			other: {
				...seoData.additionalMetaTags?.reduce(
					(acc, tag) => ({
						...acc,
						[tag.name]: tag.content,
					}),
					{},
				),
				'script:ld+json': JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebPage',
					speakable: {
						'@type': 'SpeakableSpecification',
						cssSelector: seoData.speakable.cssSelector,
					},
				}),
			},
		}),
	}
}

export const generateGlobalMetadata = async (
	global: { seo?: SEOData | null },
	type: 'website' | 'article' = 'website',
): Promise<Metadata> => {
	if (!global?.seo) {
		return generateMetadata(undefined, type)
	}

	return generateMetadata(global.seo, type)
}

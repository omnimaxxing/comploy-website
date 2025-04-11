import config from '@payload-config'
import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

const getServicesSitemap = unstable_cache(
	async () => {
		const payload = await getPayload({ config })
		const SITE_URL =
			process.env.NEXT_PUBLIC_SERVER_URL ||
			process.env.VERCEL_PROJECT_PRODUCTION_URL ||
			'https://omnipixel.io'
		const results = await payload.find({
			collection: 'services',
			overrideAccess: false,
			draft: false,
			depth: 0,
			limit: 1000,
			pagination: false,
			where: {
				_status: {
					equals: 'published',
				},
			},
			select: {
				slug: true,
				updatedAt: true,
			},
		})
		const dateFallback = new Date().toISOString()
		const sitemap = results.docs
			? results.docs
					.filter((service) => Boolean(service?.slug))
					.map((service) => ({
						loc: `${SITE_URL}/services/${service?.slug}`,
						lastmod: service.updatedAt || dateFallback,
					}))
			: []
		return sitemap
	},
	['services-sitemap'],
	{
		tags: ['services-sitemap'],
	},
)
export async function GET() {
	const sitemap = await getServicesSitemap()
	return getServerSideSitemap(sitemap)
}

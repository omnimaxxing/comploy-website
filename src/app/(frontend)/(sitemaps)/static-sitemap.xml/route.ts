import config from '@payload-config'
import { getServerSideSitemap } from 'next-sitemap'
import type { ISitemapField } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

const getStaticSitemap = unstable_cache(
	async () => {
		const payload = await getPayload({ config })
		const SITE_URL =
			process.env.NEXT_PUBLIC_SERVER_URL ||
			process.env.VERCEL_PROJECT_PRODUCTION_URL ||
			'https://omnipixel.io'

		// Fetch globals for their updatedAt timestamps
		const [
			homeGlobal,
			aboutGlobal,
			contactGlobal,
			ourWorkGlobal,
			projectsGlobal,
			servicesGlobal,
			payloadExpertsGlobal,
			productsGlobal,
		] = await Promise.all([
			payload.findGlobal({ slug: 'home-global' }),
			payload.findGlobal({ slug: 'about-global' }),
			payload.findGlobal({ slug: 'contact-global' }),
			payload.findGlobal({ slug: 'our-work-global' }),
			payload.findGlobal({ slug: 'projects-global' }),
			payload.findGlobal({ slug: 'services-global' }),
			payload.findGlobal({ slug: 'payload-experts-global' }),
			payload.findGlobal({ slug: 'products-global' }),
		])

		const dateFallback = new Date().toISOString()

		// Define all static pages and collection list pages
		const staticPages: ISitemapField[] = [
			{
				loc: `${SITE_URL}/`,
				lastmod: homeGlobal?.updatedAt || dateFallback,
				priority: 1.0,
				changefreq: 'daily' as const,
			},
			{
				loc: `${SITE_URL}/about`,
				lastmod: aboutGlobal?.updatedAt || dateFallback,
				priority: 0.8,
				changefreq: 'weekly' as const,
			},
			{
				loc: `${SITE_URL}/contact`,
				lastmod: contactGlobal?.updatedAt || dateFallback,
				priority: 0.8,
				changefreq: 'weekly' as const,
			},
			{
				loc: `${SITE_URL}/our-work`,
				lastmod: ourWorkGlobal?.updatedAt || dateFallback,
				priority: 0.8,
				changefreq: 'weekly' as const,
			},
			{
				loc: `${SITE_URL}/projects`,
				lastmod: projectsGlobal?.updatedAt || dateFallback,
				priority: 0.9,
				changefreq: 'daily' as const,
			},
			{
				loc: `${SITE_URL}/services`,
				lastmod: servicesGlobal?.updatedAt || dateFallback,
				priority: 0.9,
				changefreq: 'weekly' as const,
			},
			{
				loc: `${SITE_URL}/payload-experts`,
				lastmod: payloadExpertsGlobal?.updatedAt || dateFallback,
				priority: 0.9,
				changefreq: 'weekly' as const,
			},
			{
				loc: `${SITE_URL}/products`,
				lastmod: productsGlobal?.updatedAt || dateFallback,
				priority: 0.9,
				changefreq: 'weekly' as const,
			},
		]

		return staticPages
	},
	['static-sitemap'],
	{
		tags: [
			'global_home-global',
			'global_about-global',
			'global_contact-global',
			'global_our-work-global',
			'global_projects-global',
			'global_services-global',
			'global_payload-experts-global',
			'global_products-global',
			'projects-sitemap',
			'services-sitemap',
			'products-sitemap',
		],
	},
)

export async function GET() {
	const sitemap = await getStaticSitemap()
	return getServerSideSitemap(sitemap)
}

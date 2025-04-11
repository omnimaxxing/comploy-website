const SITE_URL =
	process.env.NEXT_PUBLIC_SERVER_URL ||
	process.env.VERCEL_PROJECT_PRODUCTION_URL ||
	'https://omnipixel.io'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	// Exclude dynamic routes as they're handled by separate sitemaps
	exclude: [
		'/projects-sitemap.xml',
		'/services-sitemap.xml',
		'/products-sitemap.xml',
		'/static-sitemap.xml',
	],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin/*', '/private/*', '/api/*'],
			},
		],
		additionalSitemaps: [
			`${SITE_URL}/static-sitemap.xml`,
			`${SITE_URL}/projects-sitemap.xml`,
			`${SITE_URL}/services-sitemap.xml`,
			`${SITE_URL}/products-sitemap.xml`,
		],
	},
}

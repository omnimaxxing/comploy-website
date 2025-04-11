import { getCachedGlobal } from '@/utilities/getGlobals'
import { GlobalEstimator } from './GlobalEstimator'
import { generateGlobalMetadata } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import type { ProjectEstimator } from '@/payload-types'

// Define price ranges for SEO structured data
const defaultPriceRanges = {
	'Corporate Website': { min: 15000, max: 35000 },
	'E-commerce Platform': { min: 25000, max: 50000 },
	'Web Application': { min: 35000, max: 75000 },
	'Custom Software': { min: 50000, max: 150000 },
}

export const generateEstimatorMetadata = async (): Promise<Metadata> => {
	const estimator = (await getCachedGlobal('project-estimator', 4)()) as ProjectEstimator

	// Generate price ranges from actual data if available
	const priceRanges =
		estimator?.categories?.reduce(
			(acc, category) => {
				category.options?.forEach((option) => {
					acc[option.label] = {
						min: option.basePrice,
						max: option.basePrice * 1.5, // Assuming max is 50% more than base
					}
				})
				return acc
			},
			{} as Record<string, { min: number; max: number }>,
		) || defaultPriceRanges

	// Create structured data for each service type with detailed pricing
	const serviceOfferings = Object.entries(priceRanges).map(([name, { min, max }]) => ({
		'@type': 'Service',
		name,
		description: `Professional ${name.toLowerCase()} development services`,
		offers: {
			'@type': 'AggregateOffer',
			priceCurrency: 'USD',
			lowPrice: min,
			highPrice: max,
			offerCount: 1,
			priceSpecification: {
				'@type': 'PriceSpecification',
				price: min,
				minPrice: min,
				maxPrice: max,
				priceCurrency: 'USD',
			},
		},
	}))

	// Create FAQ items for calculator-related questions
	const calculatorFAQ = [
		{
			question: 'How accurate is the project cost calculator?',
			answer:
				'Our calculator provides estimated ranges based on typical project requirements and industry standards. Final costs may vary based on specific project needs and complexity.',
		},
		{
			question: 'What factors are included in the cost calculation?',
			answer:
				'The calculator considers factors such as project type, design complexity, technical requirements, and content management needs to provide a comprehensive estimate.',
		},
		{
			question: 'Can I get a more detailed cost breakdown?',
			answer:
				'Yes! After using the calculator, you can schedule a consultation to receive a detailed breakdown and discuss your specific project requirements.',
		},
	]

	// Create HowTo steps for using the calculator
	const calculatorSteps = {
		name: 'How to Use the Project Cost Calculator',
		description:
			'Follow these steps to get an instant estimate for your software development project',
		steps: [
			{
				name: 'Select Project Type',
				text: 'Choose the type of project you want to build (e.g., Website, E-commerce, Web Application)',
			},
			{
				name: 'Specify Requirements',
				text: 'Select additional features and requirements for your project',
			},
			{
				name: 'Review Estimate',
				text: 'Get an instant cost estimate based on your selections',
			},
		],
	}

	return generateGlobalMetadata(
		{
			seo: {
				title: 'Project Cost Calculator | Omnipixel Software Development',
				description:
					'Get instant estimates for your software development project. Calculate costs for web applications, e-commerce platforms, and custom software solutions.',
				keywords:
					'software development cost calculator, web development pricing, app development cost estimator, project cost calculator, software cost estimation tool',
				canonicalUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/services#estimator`,
				structuredData: [
					{
						'@context': 'https://schema.org',
						'@type': 'Service',
						name: 'Omnipixel Project Cost Calculator',
						description:
							'Interactive tool to estimate software development costs. Get instant price ranges for web applications, e-commerce platforms, and custom software.',
						provider: {
							'@type': 'Organization',
							name: 'Omnipixel',
							url: process.env.NEXT_PUBLIC_SERVER_URL,
						},
						offers: {
							'@type': 'AggregateOffer',
							priceCurrency: 'USD',
							lowPrice: Math.min(...Object.values(priceRanges).map((r) => r.min)),
							highPrice: Math.max(...Object.values(priceRanges).map((r) => r.max)),
							offerCount: Object.keys(priceRanges).length,
							offers: serviceOfferings,
						},
					},
				],
				faq: calculatorFAQ,
				howTo: calculatorSteps,
				speakable: {
					cssSelector: ['#calculator-title', '#calculator-description'],
				},
				additionalMetaTags: [
					{
						name: 'og:price:currency',
						content: 'USD',
					},
					{
						name: 'og:price:amount',
						content: `${Math.min(...Object.values(priceRanges).map((r) => r.min))}-${Math.max(
							...Object.values(priceRanges).map((r) => r.max),
						)}`,
					},
					{
						name: 'og:type',
						content: 'website',
					},
					{
						name: 'twitter:label1',
						content: 'Estimate Range',
					},
					{
						name: 'twitter:data1',
						content: `$${Math.min(
							...Object.values(priceRanges).map((r) => r.min),
						).toLocaleString()} - $${Math.max(
							...Object.values(priceRanges).map((r) => r.max),
						).toLocaleString()}`,
					},
				],
			},
		},
		'website',
	)
}

export default async function EstimatorWrapper() {
	// Fetch estimator data
	const estimator = (await getCachedGlobal('project-estimator', 4)()) as ProjectEstimator

	return <GlobalEstimator data={estimator} />
}

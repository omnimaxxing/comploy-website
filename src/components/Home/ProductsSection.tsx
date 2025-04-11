'use client'

import { useEffect, useRef, RefObject } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@heroui/react'
import { cn } from '@heroui/react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import type { HomeGlobal, Product } from '@/payload-types'

// Register GSAP plugins
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

// Helper color object since it was referenced in the code
const colors = {
	blue: {
		500: '#3b82f6',
	},
}

// Define the product type from the Home global
type HomeProduct = {
	title: string
	timeline: string
	description: string
	gradient: string
	logoSvg?: {
		url: string
	}
	product?: {
		id: string
		title: string
		dateAvailable?: string
		shortDescription?: string
		logo?: {
			url: string
		}
		highlights?: Array<{
			highlight: string
			description?: string
		}>
	}
	features?: Array<{
		title: string
		description: string
	}>
}

// Update the component props type
type ProductsSectionProps = {
	page: HomeGlobal
}

export function ProductsSection({ page }: ProductsSectionProps) {
	// Get section data from page
	const data = page?.productsSection
	const title = data?.title || 'Pioneering innovation, one product at a time.'
	const products = data?.products || ([] as HomeProduct[])

	// Default SVG paths for products if not provided
	const defaultSvgLogos = [
		'/assets/logos/product-logo-1.svg',
		'/assets/logos/product-logo-2.svg',
		'/assets/logos/product-logo-3.svg',
		'/assets/logos/product-logo-4.svg',
	]

	// Function to get logo for a product
	const getProductLogo = (product: HomeProduct, index: number) => {
		// If product has a custom logo in the Home global, use that
		if (product.logoSvg && typeof product.logoSvg === 'object' && product.logoSvg.url) {
			return product.logoSvg.url
		}

		// If product is linked from Products collection and has a logo, use that
		if (
			product.product &&
			product.product.logo &&
			typeof product.product.logo === 'object' &&
			'url' in product.product.logo
		) {
			return product.product.logo.url
		}

		// Otherwise use default logo based on index
		return defaultSvgLogos[index % defaultSvgLogos.length]
	}

	return (
		<section className="py-32 relative bg-muted/30">
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
			<div className="u-container">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-24">
						<h2 className="fl-text-step-2 text-muted-foreground font-medium mb-4">{title}</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{products.map((product, index) => (
							<div key={index} className="relative">
								{/* Card with large logo */}
								<div className="group relative rounded-3xl overflow-hidden backdrop-blur-sm border border-foreground/10 bg-gradient-to-br from-primary/10 to-primary/20">
									<div className="p-8">
										{/* Logo and title section */}
										<div className="flex flex-col items-center text-center mb-8">
											<div className="relative w-40 h-40 bg-white rounded-2xl  mb-6">
												<Image
													src={getProductLogo(product, index)}
													alt={`${product.product?.title || product.title} logo`}
													fill
													className="object-contain p-5"
												/>
											</div>
											<div>
												<h3 className="fl-text-step-3 font-medium text-foreground mb-2">
													{product.product?.title || product.title}
												</h3>
												<span className="px-3 py-1 rounded-full bg-primary/10 text-sm text-primary">
													{product.product?.dateAvailable || product.timeline}
												</span>
											</div>
										</div>

										<p className="text-muted-foreground mb-8 text-lg">
											{product.product?.shortDescription || product.description}
										</p>

										<div className="space-y-6">
											{product.product?.highlights
												? // Render highlights from linked product
												  product.product.highlights.map((highlight, fIndex) => (
														<div key={fIndex} className="flex flex-col gap-1">
															<h4 className="font-medium text-foreground">{highlight.highlight}</h4>
															<p className="text-sm text-muted-foreground">
																{highlight.description}
															</p>
														</div>
												  ))
												: // Render features from home product
												  product.features?.map((feature, fIndex) => (
														<div key={fIndex} className="flex flex-col gap-1">
															<h4 className="font-medium text-foreground">{feature.title}</h4>
															<p className="text-sm text-muted-foreground">{feature.description}</p>
														</div>
												  ))}
										</div>

										<div className="mt-8">
											<Button
												variant="bordered"
												disabled
												radius="md"
												className="group border-foreground/20 hover:border-foreground/40 opacity-50 cursor-not-allowed"
											>
												Coming Soon
												<Icon
													icon="heroicons:arrow-right"
													className="ml-2 w-5 h-5 transition-transform"
												/>
											</Button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

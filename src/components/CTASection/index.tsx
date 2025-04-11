import { CtaGlobal } from '@/payload-types'
import { draftMode, headers } from 'next/headers'
import { getCachedGlobal } from '../../utilities/getGlobals'
import { Button, Link } from '@heroui/react'
import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import SpinningQuestion from '../ui/spinning-question'

export default async function CTASection() {
	const data = (await getCachedGlobal('cta-global', 4)()) as CtaGlobal
	const headersList = await headers()
	const pathname = (await headersList).get('x-pathname') || '/'

	// Check if current path is in excluded routes
	const isExcluded = data?.excludedRoutes?.some(({ route }) => pathname === route)

	// Don't render if the current path is excluded
	if (isExcluded) return null

	return (
		<section className="fl-py-xl relative bg-muted/30">
			<div className="u-container">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="fl-text-step-4 md:fl-text-step-5 font-medium text-foreground mb-6">
						Time to Turn Your <span className="italic">What If</span> into Something Extraordinary
						<SpinningQuestion className="ml-1" color="var(--primary)" />
					</h2>
					<p className="fl-text-step-1 text-foreground/80 mb-12 max-w-2xl mx-auto">
						We'll take your <span className="italic">What If</span> and craft a world-class answer.
						With next-gen tech and bold thinking, we deliver powerful results on your timeline—and
						your budget.
					</p>

					<Button
						variant="solid"
						size="lg"
						className="group bg-foreground text-background"
						endContent={
							<Icon
								icon="heroicons:arrow-right"
								className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
							/>
						}
					>
						<Link href={data?.buttonLink || '/contact'}>{data?.buttonText || "Let's Chat"}</Link>
					</Button>
				</div>
			</div>
		</section>
	)
}

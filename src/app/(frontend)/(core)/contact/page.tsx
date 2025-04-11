import { notFound } from 'next/navigation'
import { ContactGlobal } from '@/payload-types'
import { draftMode } from 'next/headers'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { generateGlobalMetadata } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { ContactForm } from './contact-form'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Button, cn, Divider } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Link } from '@heroui/react'
import { Stars } from '@/components/ui/Stars'
import { Meteors } from '@/components/ui/Meteors'
import FAQ, { FAQItem } from './faq'

export const generateMetadata = async (): Promise<Metadata> => {
	const page = (await getCachedGlobal('contact-global', 4)()) as ContactGlobal
	return generateGlobalMetadata(
		{
			seo: {
				title: page?.seo?.title || 'Contact Us | Payload Plugins',
				description: page?.seo?.description || "Get in touch with us. We'd love to hear from you.",
				keywords: page?.seo?.keywords || undefined,
				ogImage: page?.seo?.ogImage || undefined,
				canonicalUrl: page?.seo?.canonicalUrl || undefined,
			},
		},
		'website',
	)
}

// Create a cosmic background component for consistency
const CosmicBackground = () => {
	return (
		<>
			{/* Extended cosmic background that fades throughout the page */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.7)_80%)] sm:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60 pointer-events-none"></div>

			{/* Stars that extend throughout the page with fading effect */}
			<div className="absolute inset-0 pointer-events-none">
				<Stars number={120} className="z-0 opacity-70" />
			</div>

			{/* Edge fading gradients */}
			<div className="absolute inset-x-0 top-0 h-16 md:h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-x-0 bottom-0 h-16 md:h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
			<div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-20"></div>
		</>
	)
}

export default async function ContactPage() {
	try {
		const { isEnabled: draft } = await draftMode()
		const page = (await getCachedGlobal('contact-global', 4)()) as ContactGlobal

		// Convert CMS FAQ data to the component format, adding fallbacks
		const faqItems: FAQItem[] = page?.faqSection?.faqs
			? page.faqSection.faqs.map((faq) => ({
					question: faq.question || '',
					answer: faq.answer || '',
			  }))
			: []

		return (
			<main className="relative overflow-hidden min-h-screen">
				<CosmicBackground />
				<Meteors number={8} className="z-[30] opacity-70" />

				{/* Hero Section */}
				<section className="relative pt-20 pb-8">
					<div className="u-container relative z-10">
						<div className="text-center max-w-3xl mx-auto">
							<h1 className="fl-mb-s">{page?.content?.title || 'Contact Us'}</h1>
							<p className="fl-mb-l">
								{page?.content?.subtitle ||
									"We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible."}
							</p>
						</div>
					</div>
				</section>

				{/* Contact Form Section */}
				<section className="relative pb-12">
					<div className="u-container relative z-10">
						<div className="max-w-2xl mx-auto relative">
							<div className="bg-background/20 backdrop-blur-sm rounded-xl overflow-hidden p-6">
								<h2 className="fl-text-step-0 relative inline-block mb-6">
									{page?.content?.formTitle || 'Send us a message'}
									<span className="absolute -bottom-1.5 left-0 h-[2px] w-16 bg-gradient-to-r from-violet-500/70 to-transparent"></span>
								</h2>

								<ContactForm />
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section - conditionally shown based on CMS settings */}
				{!page?.faqSection?.enabled === false && (
					<section className="relative py-24">
						<div className="u-container relative z-10">
							<div className="max-w-3xl mx-auto fl-mb-xl relative">
								{/* Add subtle ambient radial gradient */}
								<div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.03)_0%,transparent_70%)]"></div>

								<div className="w-full">
									<FAQ
										title={page?.faqSection?.title || 'Frequently Asked Questions'}
										subtitle={
											page?.faqSection?.subtitle ||
											'Quick answers to common questions about our plugin platform'
										}
										items={faqItems}
									/>
								</div>
							</div>

							{/* CTA Section - conditionally shown based on CMS settings */}
							{!page?.ctaSection?.enabled === false && (
								<div className="max-w-3xl mx-auto relative rounded-xl overflow-hidden fl-mt-xl">
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-violet-950/20 to-rose-950/20 backdrop-blur-[1px]"></div>
									<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.15)_0%,transparent_50%)]"></div>
									<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15)_0%,transparent_50%)]"></div>

									<div className="relative z-10 p-8 text-center">
										<h2 className="fl-text-step-1 text-white/90 mb-3">
											{page?.ctaSection?.title || 'Ready to share your plugin?'}
										</h2>
										<p className="text-white/70 max-w-lg mx-auto mb-6">
											{page?.ctaSection?.description ||
												'Contribute to the Payload CMS ecosystem by sharing your plugins with the community.'}
										</p>
										<Button
											href={page?.ctaSection?.buttonLink || '/plugins/submit'}
											as={Link}
											variant="solid"
											endContent={<Icon icon="heroicons:arrow-right" className="ml-2 h-4 w-4" />}
											className="inline-flex h-12 items-center justify-center rounded-none bg-gradient-to-r from-white to-white/95 text-black px-6 py-3 font-medium shadow-md transition-all hover:shadow-lg hover:from-white hover:to-white/90 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										>
											{page?.ctaSection?.buttonText || 'Submit Your Plugin'}
										</Button>
									</div>
								</div>
							)}
						</div>

						{/* Bottom meteors effect */}
						<div className="pointer-events-none absolute inset-0">
							<Meteors number={10} />
						</div>
					</section>
				)}

				{draft && <LivePreviewListener />}
			</main>
		)
	} catch (error) {
		console.error('Error in ContactPage:', error)
		notFound()
	}
}

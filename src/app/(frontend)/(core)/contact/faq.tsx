'use client'

import { Accordion, AccordionItem, cn } from '@heroui/react'
import { Icon } from '@iconify/react'

// Define FAQ type for type safety
export type FAQItem = {
	question: string
	answer: string
}

type FAQProps = {
	title?: string
	subtitle?: string
	items?: FAQItem[]
}

// Default FAQ data as fallback
const defaultFAQs: FAQItem[] = [
	{
		question: 'How do I submit my plugin?',
		answer:
			'You can submit your plugin by clicking the "Submit Your Plugin" button on the plugins page and following the submission guidelines. Make sure your plugin is well-documented and follows our quality standards.',
	},
	{
		question: 'What information should I include in my plugin submission?',
		answer:
			'Your submission should include a clear name, detailed description, GitHub repository link, installation instructions, and usage examples. Screenshots or demo links are also helpful for users to understand your plugin.',
	},
	{
		question: 'How long does the plugin approval process take?',
		answer:
			'The approval process typically takes 2-5 business days. We review each submission to ensure it meets our quality standards, security requirements, and provides value to the Payload CMS community.',
	},
	{
		question: 'Can I update my plugin after submission?',
		answer:
			'Yes, you can update your plugin anytime. We encourage maintaining your plugins with bug fixes, new features, and compatibility updates for newer Payload versions.',
	},
	{
		question: 'Are there any plugin submission guidelines?',
		answer:
			'Yes, we have guidelines for plugin submissions that cover quality, security, documentation, and maintenance expectations. Check our documentation page for detailed requirements.',
	},
	{
		question: 'Do you offer technical support for plugins?',
		answer:
			'Plugin authors are responsible for providing support for their own plugins. However, we offer a community forum where you can ask questions and get help from other developers.',
	},
]

export default function FAQ({ title, subtitle, items = defaultFAQs }: FAQProps) {
	const faqs = items.length > 0 ? items : defaultFAQs

	return (
		<div className="w-full">
			{title && subtitle && (
				<div className="mb-12 text-center">
					<h2 className="fl-text-step-1 relative inline-block">
						{title}
						<span className="absolute -bottom-1.5 left-0 right-0 h-[2px] w-24 mx-auto bg-gradient-to-r from-transparent via-rose-500/70 to-transparent"></span>
					</h2>
					<p className="text-muted-foreground text-sm mt-3">{subtitle}</p>
				</div>
			)}

			<Accordion
				variant="bordered"
				className="bg-background/20 backdrop-blur-sm border-foreground/10 rounded-none overflow-hidden"
				motionProps={{
					variants: {
						enter: {
							y: 0,
							opacity: 1,
							height: 'auto',
							transition: {
								height: {
									type: 'spring',
									stiffness: 500,
									damping: 30,
									duration: 0.4,
								},
								opacity: {
									easings: 'ease',
									duration: 0.3,
								},
							},
						},
						exit: {
							y: -10,
							opacity: 0,
							height: 0,
							transition: {
								height: {
									easings: 'ease',
									duration: 0.25,
								},
								opacity: {
									easings: 'ease',
									duration: 0.3,
								},
							},
						},
					},
				}}
			>
				{faqs.map((faq, index) => (
					<AccordionItem
						key={index}
						aria-label={faq.question}
						title={<div className="font-medium text-foreground py-2">{faq.question}</div>}
						indicator={({ isOpen }) => (
							<Icon
								icon={isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'}
								className={cn(
									'text-foreground/60 w-5 h-5 transition-transform duration-300',
									isOpen && 'transform rotate-180',
								)}
							/>
						)}
						classNames={{
							heading: 'px-4 py-0',
							title: 'text-lg',
							trigger: 'px-0 py-3 data-[hover=true]:bg-foreground/0 rounded-none h-auto',
							indicator: 'text-foreground/60',
							content: 'px-4 pb-5 pt-0',
						}}
					>
						<p className="text-foreground/80 text-sm leading-relaxed">{faq.answer}</p>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	)
}

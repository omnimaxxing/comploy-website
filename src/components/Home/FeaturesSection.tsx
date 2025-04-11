'use client'

import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'

type Feature = {
	icon: string
	title: string
	subtitle: string
	modalContent: string
}

type FeaturesSectionProps = {
	title: string
	features: Feature[]
}

const defaultFeatures: Feature[] = [
	{
		icon: 'solar:medal-ribbons-star-bold-duotone',
		title: 'USAP Approved Professional Quality',
		subtitle: 'Premium paddles at competitive prices, designed for champions',
		modalContent:
			'Our paddles meet and exceed USAP standards, crafted with premium materials and innovative technology. Experience professional-grade quality without the premium price tag. Every TigerShark paddle undergoes rigorous testing to ensure consistent performance at the highest level.',
	},
	{
		icon: 'solar:palette-bold-duotone',
		title: 'Your Paddle, Your Canvas',
		subtitle: 'Express yourself with unlimited customization options',
		modalContent:
			'Transform your paddle into a personal masterpiece with our AI-powered customization studio. From colors to patterns, make your paddle as unique as your playing style. Stand out on the court with a design that tells your story.',
	},
	{
		icon: 'solar:chart-bold-duotone',
		title: 'Built for Performance',
		subtitle: 'Engineered for power, control, and consistency',
		modalContent:
			'Every aspect of our paddles is meticulously engineered for optimal performance. The perfect balance of power and control, combined with our innovative core technology, gives you the edge you need to dominate the court. Experience the perfect blend of technology and craftsmanship.',
	},
]

// Hook for handling clicks outside the component
const useOutsideClick = (ref: React.RefObject<HTMLDivElement | null>, callback: Function) => {
	useEffect(() => {
		const listener = (event: any) => {
			if (!ref.current || ref.current.contains(event.target)) {
				return
			}
			callback(event)
		}

		document.addEventListener('mousedown', listener)
		document.addEventListener('touchstart', listener)

		return () => {
			document.removeEventListener('mousedown', listener)
			document.removeEventListener('touchstart', listener)
		}
	}, [ref, callback])
}

function FeatureCard({ feature }: { feature: Feature }) {
	const [active, setActive] = useState<Feature | null>(null)
	const id = useId()
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!ref.current) return
		const element = ref.current

		const handleClickOutside = (event: MouseEvent) => {
			if (element && !element.contains(event.target as Node)) {
				setActive(null)
			}
		}

		if (active) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [active])

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setActive(null)
			}
		}

		if (active) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [active])

	return (
		<>
			<AnimatePresence>
				{active && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-50"
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{active ? (
					<div className="fixed inset-0 grid place-items-center z-[60]">
						<motion.button
							key={`button-${feature.title}-${id}`}
							layout
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{
								opacity: 0,
								transition: { duration: 0.15 },
							}}
							className="absolute top-4 right-4 z-50 flex items-center justify-center  backdrop-blur-sm rounded-full h-10 w-10 shadow-lg"
							onClick={() => setActive(null)}
						>
							<Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6 text-gray-700" />
						</motion.button>

						<motion.div
							layoutId={`card-${feature.title}-${id}`}
							ref={ref}
							className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
						>
							<div className="p-8">
								<div className="flex items-start gap-6">
									<motion.div
										layoutId={`icon-${feature.title}-${id}`}
										className="relative flex-none"
									>
										<div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl blur-lg opacity-20" />
										<div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-xl border border-primary-500/20">
											<Icon
												icon={feature.icon}
												className="w-10 h-10 text-primary-600 dark:text-primary-400"
											/>
										</div>
									</motion.div>

									<div className="flex-1">
										<motion.h3
											layoutId={`title-${feature.title}-${id}`}
											className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
										>
											{feature.title}
										</motion.h3>
										<motion.p
											layoutId={`subtitle-${feature.title}-${id}`}
											className="text-gray-600 dark:text-gray-400 mb-6"
										>
											{feature.subtitle}
										</motion.p>
									</div>
								</div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed"
								>
									{feature.modalContent}
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="mt-8 flex justify-end"
								>
									<Button
										color="primary"
										variant="light"
										size="lg"
										onPress={() => setActive(null)}
										className="font-medium"
									>
										Close
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</div>
				) : (
					<motion.div
						layoutId={`card-${feature.title}-${id}`}
						onClick={() => setActive(feature)}
						className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 card-transition card-hover touch-card"
					>
						<div className="relative p-8">
							<div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/20" />
							<div className="relative">
								<div className="flex items-center justify-between mb-6">
									<motion.div
										layoutId={`icon-${feature.title}-${id}`}
										className="relative"
										whileHover={{ scale: 1.05 }}
										transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									>
										<div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
										<div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-xl border border-primary-500/20 relative">
											<Icon
												icon={feature.icon}
												className="w-8 h-8 text-primary-600 dark:text-primary-400"
											/>
										</div>
									</motion.div>
									<motion.div
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Icon
											icon="solar:arrow-right-up-linear"
											className="w-5 h-5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										/>
									</motion.div>
								</div>

								<motion.h3
									layoutId={`title-${feature.title}-${id}`}
									className="text-xl font-semibold tracking-tight mb-3 text-gray-900 dark:text-gray-100"
								>
									{feature.title}
								</motion.h3>
								<motion.p
									layoutId={`subtitle-${feature.title}-${id}`}
									className="text-gray-600 dark:text-gray-400 leading-relaxed"
								>
									{feature.subtitle}
								</motion.p>

								{/* Stats or Highlights */}
								<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
									<div className="grid grid-cols-2 gap-4">
										{feature.title.includes('Professional') && (
											<>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														100%
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">USAP Approved</p>
												</div>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														5★
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">Player Rating</p>
												</div>
											</>
										)}
										{feature.title.includes('Canvas') && (
											<>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														∞
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">Design Options</p>
												</div>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														AI
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">Powered Studio</p>
												</div>
											</>
										)}
										{feature.title.includes('Performance') && (
											<>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														Pro
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">Grade Core</p>
												</div>
												<div>
													<p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
														2x
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">Power Control</p>
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}

export function FeaturesSection({ title, features = defaultFeatures }: FeaturesSectionProps) {
	return (
		<section className="w-full py-16">
			<div className="max-w-2xl mb-12">
				<h2 className="text-3xl font-bold tracking-tight mb-4">
					{title || 'Why Choose TigerShark'}
				</h2>
				<p className="text-gray-600 dark:text-gray-400 text-lg">
					Experience the perfect blend of professional quality, customization, and performance.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature, index) => (
					<FeatureCard key={index} feature={feature} />
				))}
			</div>
		</section>
	)
}

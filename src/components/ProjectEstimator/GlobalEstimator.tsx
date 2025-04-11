'use client'

import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ProjectEstimatorModal } from './ProjectEstimatorModal'
import type { ProjectEstimator } from '@/payload-types'
import { cn } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'

// Define pages where the estimator makes most sense
const ESTIMATOR_FRIENDLY_PAGES = ['/', '/services', '/services', '/our-work', '/contact']

export function GlobalEstimator({ data }: { data: ProjectEstimator | null }) {
	const [isOpen, setIsOpen] = useState(false)
	const [showButton, setShowButton] = useState(true)
	const pathname = usePathname()
	const isHomePage = pathname === '/'

	useEffect(() => {
		if (!isHomePage) return

		const handleScroll = () => {
			// Get the viewport height
			const viewportHeight = window.innerHeight
			// Show button when scrolled past 90% of viewport height
			setShowButton(window.scrollY > viewportHeight * 0.9)
		}

		// Initial check
		handleScroll()

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [isHomePage])

	const handleOpen = () => {
		setIsOpen(true)
	}

	const handleClose = () => {
		setIsOpen(false)
	}

	return (
		<>
			{/* Smart Estimator Button */}
			<AnimatePresence>
				{(!isHomePage || showButton) && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className="fixed bottom-8 right-8 z-[89]" // z-index below FloatingTab
					>
						<button
							onClick={handleOpen}
							className="w-16 h-16 rounded-full bg-foreground text-background shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-float"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<Icon icon="heroicons:calculator" className="w-7 h-7 relative z-10" />
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Project Estimator Modal */}
			<ProjectEstimatorModal
				isOpen={isOpen}
				onClose={handleClose}
				data={data}
				defaultSettings={
					data?.defaultSettings || {
						workingDaysPerWeek: 5,
						hoursPerDay: 8,
						bufferPercentage: 20,
					}
				}
			/>
		</>
	)
}

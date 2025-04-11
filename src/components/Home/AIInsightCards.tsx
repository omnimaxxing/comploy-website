'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'
import gsap from 'gsap'

type AIInsightCardsProps = {
	className?: string
}

export const AIInsightCards = ({ className }: AIInsightCardsProps) => {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const cardsContainerRef = useRef<HTMLDivElement>(null)
	const cardRefs = useRef<Array<HTMLDivElement | null>>([])

	// Cache the analyzed data
	const analyzedDataRef = useRef<{
		[key: string]: any
	}>({})

	// Store initialization status
	const isInitializedRef = useRef(false)

	// Memoize the analyzeUserWithGroq function
	const analyzeUserWithGroq = useCallback(
		async (userData: {
			time: string
			device: string
			preferences: string[]
		}) => {
			// Create a cache key from the input data
			const cacheKey = JSON.stringify(userData)

			// Return cached data if available
			if (analyzedDataRef.current[cacheKey]) {
				return analyzedDataRef.current[cacheKey]
			}

			try {
				const response = await fetch('/api/analyze-user', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ userData }),
				})

				if (!response.ok) {
					throw new Error('Failed to get AI insights')
				}

				const data = await response.json()
				// Cache the result
				analyzedDataRef.current[cacheKey] = data
				return data
			} catch (error) {
				console.error('Error getting AI insights:', error)
				return null
			}
		},
		[],
	)

	// Memoize time calculations
	const getTimeInfo = useCallback(() => {
		const hour = new Date().getHours()
		if (hour >= 5 && hour < 7) {
			return {
				period: 'dawn',
				gradient: 'from-indigo-500/20 via-pink-500/20 to-orange-500/20',
				emoji: '🌅',
				pattern: 'radial-gradient(circle at top, var(--primary)/5%, transparent 50%)',
			}
		} else if (hour >= 7 && hour < 12) {
			return {
				period: 'morning',
				gradient: 'from-blue-500/20 via-cyan-500/20 to-yellow-500/20',
				emoji: '☀️',
				pattern: 'linear-gradient(to bottom right, var(--primary)/10%, transparent 60%)',
			}
		} else if (hour >= 12 && hour < 15) {
			return {
				period: 'midday',
				gradient: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
				emoji: '🌞',
				pattern: 'radial-gradient(circle at center, var(--primary)/15%, transparent 70%)',
			}
		} else if (hour >= 15 && hour < 18) {
			return {
				period: 'afternoon',
				gradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
				emoji: '🌤',
				pattern: 'linear-gradient(to bottom left, var(--primary)/10%, transparent 60%)',
			}
		} else if (hour >= 18 && hour < 21) {
			return {
				period: 'evening',
				gradient: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
				emoji: '🌅',
				pattern: 'radial-gradient(circle at bottom, var(--primary)/10%, transparent 60%)',
			}
		} else {
			return {
				period: 'night',
				gradient: 'from-indigo-500/20 via-purple-500/20 to-blue-500/20',
				emoji: '🌙',
				pattern: 'radial-gradient(circle at top, var(--primary)/5%, transparent 40%)',
			}
		}
	}, [])

	// Memoize device detection
	const getDeviceInfo = useCallback(() => {
		const browserInfo = navigator.userAgent
		const isMobile = /iPhone|iPad|iPod|Android/i.test(browserInfo)
		const isSafari = /^((?!chrome|android).)*safari/i.test(browserInfo)
		const isChrome = /chrome/i.test(browserInfo)
		const isFirefox = /firefox/i.test(browserInfo)
		const isTablet = /iPad|Android(?!.*Mobile)/i.test(browserInfo)
		const isMac = /Macintosh/i.test(browserInfo)
		const isWindows = /Windows/i.test(browserInfo)
		const isLinux = /Linux/i.test(browserInfo)

		const width = window.innerWidth
		const screenSize = width < 640 ? 'compact' : width < 1024 ? 'medium' : 'expansive'

		const connection = (navigator as any).connection
		const connectionSpeed = connection
			? connection.effectiveType === '4g'
				? 'high-speed'
				: connection.effectiveType === '3g'
				  ? 'moderate'
				  : 'conservative'
			: 'standard'

		const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop'
		const os = isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : ''
		const browser = isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Browser'

		const personalities = {
			power: `${os} Power User`,
			creative: `Creative ${browser} Explorer`,
			efficient: `Efficiency-Focused ${deviceType} Pro`,
			flexible: `Multi-Platform Adapter`,
		}

		const personality =
			screenSize === 'expansive' && connectionSpeed === 'high-speed'
				? personalities.power
				: isMac && (isChrome || isSafari)
				  ? personalities.creative
				  : isWindows && isChrome
					  ? personalities.efficient
					  : personalities.flexible

		return {
			type: deviceType,
			details: `${os} · ${browser} · ${screenSize} display`,
			icon: isChrome ? '⚡️' : isSafari ? '🌟' : isFirefox ? '🦊' : '🌐',
			personality,
		}
	}, [])

	// Add mouse move handler for the cards section
	useEffect(() => {
		const container = cardsContainerRef.current
		if (!container) return

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			setMousePosition({ x, y })
		}

		container.addEventListener('mousemove', handleMouseMove)
		return () => container.removeEventListener('mousemove', handleMouseMove)
	}, [])

	const getCardTransform = (index: number, totalCards: number): { [key: string]: any } => {
		if (!cardsContainerRef.current || !cardRefs.current[index])
			return {
				x: 0,
				y: 0,
				rotate: 0,
			}

		const containerRect = cardsContainerRef.current.getBoundingClientRect()
		const cardRect = cardRefs.current[index]?.getBoundingClientRect()

		if (!cardRect)
			return {
				x: 0,
				y: 0,
				rotate: 0,
			}

		const cardCenterX = cardRect.left - containerRect.left + cardRect.width / 2
		const cardCenterY = cardRect.top - containerRect.top + cardRect.height / 2

		const dx = mousePosition.x - cardCenterX
		const dy = mousePosition.y - cardCenterY
		const distance = Math.sqrt(dx * dx + dy * dy)

		const angle = Date.now() / 2000 + (index * (Math.PI * 2)) / totalCards // Slowed down animation
		const waveOffset = Math.sin(angle) * 3 // Reduced movement amplitude

		const maxDistance = Math.sqrt(
			containerRect.width * containerRect.width + containerRect.height * containerRect.height,
		)
		const distanceScale = Math.max(0, 1 - distance / maxDistance)

		return {
			x: waveOffset * distanceScale,
			y: waveOffset * distanceScale,
			rotate: waveOffset * distanceScale * 0.3, // Reduced rotation
			transition: {
				type: 'spring',
				stiffness: 200,
				damping: 25,
				mass: 0.5,
			},
		}
	}

	const DemoContent = ({ action }: { action: string }) => {
		const [loading, setLoading] = useState(true)
		const [data, setData] = useState<string>('')
		const [timeDetails, setTimeDetails] = useState<{
			period: string
			gradient: string
			emoji: string
			pattern: string
		}>()
		const [deviceProfile, setDeviceProfile] = useState<{
			type: string
			details: string
			icon: string
			personality: string
		}>()
		const [aiProfile, setAiProfile] = useState<{
			persona: string
			traits: string[]
			insight: string
			superpower: string
		}>()

		// Use useEffect only once to initialize data
		useEffect(() => {
			const initializeData = async () => {
				// Skip if already initialized
				if (isInitializedRef.current) return
				isInitializedRef.current = true

				setLoading(true)
				// Get initial data that might be needed across cases
				const timeInfo = getTimeInfo()
				const deviceInfo = getDeviceInfo()

				switch (action) {
					case 'getTimeZoneGreeting':
						setTimeDetails(timeInfo)
						setData(`Good ${timeInfo.period} ${timeInfo.emoji}`)
						break

					case 'getDeviceExperience':
						setDeviceProfile(deviceInfo)
						setData(deviceInfo.personality)
						break

					case 'getInteractionStyle': {
						const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
						const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches
						const prefersColors = window.matchMedia('(prefers-color-scheme: dark)').matches

						const userTraits: string[] = []
						if (prefersDark) userTraits.push('Night Owl')
						else userTraits.push('Early Bird')
						if (prefersReduced) userTraits.push('Minimalist')
						if (prefersContrast) userTraits.push('Detail-Oriented')
						if (prefersColors) userTraits.push('Color Enthusiast')

						if (timeInfo.period === 'night' || timeInfo.period === 'evening') {
							userTraits.push('Evening Focus')
						} else {
							userTraits.push('Day Optimizer')
						}

						if (deviceInfo.type === 'Mobile') {
							userTraits.push('On-the-Go')
						} else {
							userTraits.push('Desk-Bound')
						}

						const aiInsights = await analyzeUserWithGroq({
							time: timeInfo.period,
							device: deviceInfo.details,
							preferences: userTraits,
						})

						const userProfile = {
							persona: userTraits[0],
							traits: userTraits,
							insight:
								aiInsights?.insight || `${timeInfo.period} warrior with a ${deviceInfo.type} twist`,
							superpower: aiInsights?.superpower || 'Time-bending tech whisperer',
						}

						setAiProfile(userProfile)
						setData(`${userProfile.persona} · ${userProfile.insight}`)
						break
					}
				}
				setLoading(false)
			}

			initializeData()
		}, [action, getTimeInfo, getDeviceInfo, analyzeUserWithGroq])

		if (loading) {
			return (
				<div className="animate-pulse flex flex-col items-center">
					<div className="h-8 w-24 bg-primary/10 rounded-full" />
					<div className="mt-2 text-sm text-primary/60">Personalizing...</div>
				</div>
			)
		}

		const renderTimeContent = () => {
			if (!timeDetails) return null
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative w-full"
				>
					<div
						className={cn(
							'absolute inset-0 rounded-xl opacity-20 transition-opacity duration-500',
							`bg-gradient-to-r ${timeDetails.gradient}`,
						)}
						style={{ backgroundImage: timeDetails.pattern }}
					/>
					<div className="relative p-4 text-center">
						<div className="text-2xl font-medium text-primary mb-2">{data}</div>
						<div className="text-sm text-primary/60">
							{timeDetails.period.charAt(0).toUpperCase() + timeDetails.period.slice(1)} Explorer
						</div>
					</div>
				</motion.div>
			)
		}

		const renderDeviceContent = () => {
			if (!deviceProfile) return null
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative w-full"
				>
					<div className="p-4 text-center">
						<div className="text-2xl font-medium text-primary mb-2">
							{deviceProfile.icon} {deviceProfile.personality}
						</div>
						<div className="text-sm text-primary/60">{deviceProfile.details}</div>
					</div>
				</motion.div>
			)
		}

		const renderAiContent = () => {
			if (!aiProfile) return null
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative w-full"
				>
					<div className="p-4 text-center">
						<div className="text-2xl font-medium text-primary mb-4">{aiProfile.persona}</div>

						{/* Traits */}
						<div className="flex flex-wrap justify-center gap-2 mb-6">
							{aiProfile.traits.slice(0, 3).map((trait, index) => (
								<span
									key={index}
									className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary/80"
								>
									{trait}
								</span>
							))}
						</div>

						{/* AI Insight */}
						<div className="p-3 rounded-lg bg-primary/5 mb-4">
							<div className="text-sm font-medium text-primary/80">{aiProfile.insight}</div>
						</div>

						{/* Superpower */}
						<div className="flex items-center justify-center gap-2 text-sm text-primary/80">
							<Icon icon="heroicons:sparkles" className="w-4 h-4 text-primary/60" />
							<span>{aiProfile.superpower}</span>
						</div>
					</div>
				</motion.div>
			)
		}

		return (
			<div className="w-full">
				{action === 'getTimeZoneGreeting' && renderTimeContent()}
				{action === 'getDeviceExperience' && renderDeviceContent()}
				{action === 'getInteractionStyle' && renderAiContent()}
			</div>
		)
	}

	// Add SVG curve connections between cards
	const CardConnections = () => {
		if (!cardRefs.current[0] || !cardRefs.current[1] || !cardRefs.current[2]) return null

		const getCardCenter = (index: number) => {
			const containerRect = cardsContainerRef.current?.getBoundingClientRect()
			const cardRect = cardRefs.current[index]?.getBoundingClientRect()

			if (!containerRect || !cardRect) return { x: 0, y: 0 }

			return {
				x: cardRect.left - containerRect.left + cardRect.width / 2,
				y: cardRect.top - containerRect.top + cardRect.height / 2,
			}
		}

		const centers = [0, 1, 2].map(getCardCenter)

		// Calculate control points for curves using mouse position
		const getControlPoint = (start: (typeof centers)[0], end: (typeof centers)[0]) => {
			const midX = (start.x + end.x) / 2
			const midY = (start.y + end.y) / 2

			// Add some mouse influence to the control points
			const mouseInfluence = 0.2
			const offsetX = (mousePosition.x - midX) * mouseInfluence
			const offsetY = (mousePosition.y - midY) * mouseInfluence

			return {
				x: midX + offsetX,
				y: midY + offsetY,
			}
		}

		const control1 = getControlPoint(centers[0], centers[1])
		const control2 = getControlPoint(centers[1], centers[2])

		return (
			<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
				<path
					d={`M ${centers[0].x},${centers[0].y} Q ${control1.x},${control1.y} ${centers[1].x},${centers[1].y}`}
					className="stroke-primary/10"
					fill="none"
					strokeWidth="2"
				/>
				<path
					d={`M ${centers[1].x},${centers[1].y} Q ${control2.x},${control2.y} ${centers[2].x},${centers[2].y}`}
					className="stroke-primary/10"
					fill="none"
					strokeWidth="2"
				/>
			</svg>
		)
	}

	const features = [
		{
			title: 'Time-Aware',
			description: 'Adapts to your local time for a personalized experience.',
			demo: {
				action: 'getTimeZoneGreeting',
				description: 'See how the interface changes based on your time of day.',
			},
		},
		{
			title: 'Device-Aware',
			description: 'Optimizes for your device and platform preferences.',
			demo: {
				action: 'getDeviceExperience',
				description: 'Experience tailored interactions for your setup.',
			},
		},
		{
			title: 'You-Aware',
			description: 'Learns from your interaction patterns and preferences.',
			demo: {
				action: 'getInteractionStyle',
				description: 'Discover your unique digital personality.',
			},
		},
	]

	return (
		<div className={cn('relative', className)}>
			<div ref={cardsContainerRef} className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
				<CardConnections />
				{features.map((feature, index) => (
					<motion.div
						key={index}
						ref={(el) => {
							cardRefs.current[index] = el
						}}
						style={getCardTransform(index, features.length)}
						className="group relative card-transition card-hover touch-card"
					>
						<div className="relative h-full overflow-hidden rounded-3xl border border-primary/5 bg-gradient-to-b from-primary/5 to-transparent p-6 backdrop-blur-3xl">
							<div className="mb-4">
								<h3 className="text-lg font-medium text-foreground">{feature.title}</h3>
								<p className="text-sm text-foreground/60">{feature.description}</p>
							</div>
							<div className="relative">
								<DemoContent action={feature.demo.action} />
							</div>
							{/* Hover Effect Gradient */}
							<motion.div
								className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 rounded-3xl pointer-events-none"
								initial={{ opacity: 0 }}
								whileHover={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							/>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}

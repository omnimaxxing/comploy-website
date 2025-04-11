'use client'

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useInView } from 'react-intersection-observer'
import gsap from 'gsap'
import type { HomeGlobal } from '@/payload-types'

const cn = (...inputs: any[]) => {
	return twMerge(clsx(inputs))
}

type DemoContentProps = {
	action: string
}

const DemoContent = ({ action }: DemoContentProps) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [timeDetails, setTimeDetails] = useState<{
		period: string
		gradient: string
		emoji: string
		pattern: string
		message?: string
		wittyMessage?: string
	}>({
		period: '',
		gradient: '',
		emoji: '',
		pattern: '',
	})
	const [deviceProfile, setDeviceProfile] = useState<{
		type: string
		details: string
		icon: string
		personality: string
		message?: string
	}>()
	const [aiProfile, setAiProfile] = useState<{
		persona: string
		traits: string[]
		insight: string
		superpower: string
	}>()
	const [locationData, setLocationData] = useState<{
		city?: string
		region?: string
		country?: string
		timezone?: string
	}>()

	// Fetch location data once when component mounts
	useEffect(() => {
		const getLocationData = async () => {
			try {
				// Check local storage first
				const cachedData = localStorage.getItem('locationData')
				const cachedTimestamp = localStorage.getItem('locationDataTimestamp')

				// If we have cached data and it's less than 24 hours old, use it
				if (cachedData && cachedTimestamp) {
					const timestamp = parseInt(cachedTimestamp)
					if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
						setLocationData(JSON.parse(cachedData))
						return
					}
				}

				const response = await fetch('/api/location')
				if (!response.ok) {
					// Use cached data as fallback if available
					if (cachedData) {
						setLocationData(JSON.parse(cachedData))
						return
					}
					throw new Error('Failed to fetch location data')
				}

				const data = await response.json()
				if (data.error) throw new Error(data.error)

				const locationInfo = {
					city: data.city,
					region: data.region,
					country: data.country_name,
					timezone: data.timezone,
				}

				// Cache the new data
				localStorage.setItem('locationData', JSON.stringify(locationInfo))
				localStorage.setItem('locationDataTimestamp', Date.now().toString())

				setLocationData(locationInfo)
			} catch (error) {
				console.error('Error fetching location:', error)
				// Set default location data without showing error to user
				const defaultLocation = {
					region: 'Your Area',
					city: 'Local',
					country: 'Region',
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				}
				setLocationData(defaultLocation)
			}
		}
		getLocationData()
	}, [])

	// Use useEffect only once to initialize data
	useEffect(() => {
		const initializeData = async () => {
			if (!locationData) return // Wait for location data

			setLoading(true)
			setError(null)

			try {
				const timeInfo = getTimeInfo()
				const deviceInfo = getDeviceInfo()

				switch (action) {
					case 'getTimeZoneGreeting': {
						setTimeDetails({
							...timeInfo,
							message: locationData.region || 'Your Area',
						})
						break
					}

					case 'getDeviceExperience': {
						const setupMessage =
							deviceInfo.type === 'Desktop'
								? 'Full-screen experience'
								: deviceInfo.type === 'Tablet'
								  ? 'Touch-optimized interface'
								  : 'Mobile-first design'

						setDeviceProfile({
							...deviceInfo,
							message: setupMessage,
						})
						break
					}

					case 'getInteractionStyle': {
						if (!deviceInfo.type) break

						// Use system performance metrics instead of AI content
						setAiProfile({
							persona: 'System',
							traits: [],
							insight: 'Real-time Performance Metrics',
							superpower: '',
						})
						break
					}
				}
			} catch (err) {
				console.error('Error initializing data:', err)
				// Don't show error to user, use fallback content
				switch (action) {
					case 'getTimeZoneGreeting': {
						const timeInfo = getTimeInfo()
						setTimeDetails({
							...timeInfo,
							message: 'Your Area',
						})
						break
					}
					case 'getDeviceExperience': {
						const deviceInfo = getDeviceInfo()
						setDeviceProfile({
							...deviceInfo,
							message: 'Optimized experience',
						})
						break
					}
					case 'getInteractionStyle': {
						setAiProfile({
							persona: 'System',
							traits: [],
							insight: 'Real-time Performance Metrics',
							superpower: '',
						})
						break
					}
				}
			} finally {
				setLoading(false)
			}
		}

		initializeData()
	}, [action, locationData])

	// Memoize time calculations
	const getTimeInfo = useCallback(() => {
		const hour = new Date().getHours()
		if (hour >= 5 && hour < 7) {
			return {
				period: 'dawn',
				gradient: 'from-indigo-500/20 via-pink-500/20 to-orange-500/20',
				emoji: '🌅',
				pattern: 'radial-gradient(circle at top, var(--primary)/5%, transparent 50%)',
				message: '',
			}
		} else if (hour >= 7 && hour < 12) {
			return {
				period: 'morning',
				gradient: 'from-blue-500/20 via-cyan-500/20 to-yellow-500/20',
				emoji: '☀️',
				pattern: 'linear-gradient(to bottom right, var(--primary)/10%, transparent 60%)',
				message: '',
			}
		} else if (hour >= 12 && hour < 15) {
			return {
				period: 'midday',
				gradient: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
				emoji: '🌞',
				pattern: 'radial-gradient(circle at center, var(--primary)/15%, transparent 70%)',
				message: '',
			}
		} else if (hour >= 15 && hour < 18) {
			return {
				period: 'afternoon',
				gradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
				emoji: '🌤',
				pattern: 'linear-gradient(to bottom left, var(--primary)/10%, transparent 60%)',
				message: '',
			}
		} else if (hour >= 18 && hour < 21) {
			return {
				period: 'evening',
				gradient: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
				emoji: '🌅',
				pattern: 'radial-gradient(circle at bottom, var(--primary)/10%, transparent 60%)',
				message: '',
			}
		} else {
			return {
				period: 'night',
				gradient: 'from-indigo-500/20 via-purple-500/20 to-blue-500/20',
				emoji: '🌙',
				pattern: 'radial-gradient(circle at top, var(--primary)/5%, transparent 40%)',
				message: '',
			}
		}
	}, [])

	// Device detection function
	const getDeviceInfo = () => {
		// Check if we're in a browser environment
		if (typeof window === 'undefined' || typeof navigator === 'undefined') {
			return {
				type: 'Unknown',
				details: 'System',
				icon: '💻',
				personality: 'User',
				message: '',
			}
		}

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
		const icon = deviceType === 'Desktop' ? '💻' : deviceType === 'Tablet' ? '📱' : '📱'

		return {
			type: deviceType,
			details: `${os} · ${browser} · ${screenSize} display`,
			icon,
			personality: `${deviceType} User`,
			message: '',
		}
	}

	if (loading) {
		return (
			<div className="animate-pulse flex flex-col items-center p-4">
				<div className="h-8 w-24 bg-primary/10 rounded-full" />
				<div className="mt-2 text-sm text-primary/60">Personalizing...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex flex-col items-center p-4 text-red-500">
				<Icon icon="heroicons:exclamation-circle" className="w-6 h-6 mb-2" />
				<div className="text-sm">{error}</div>
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
				<div className="relative p-4 text-center space-y-3">
					<div className="text-xl font-medium text-primary">
						Good {timeDetails.period} {timeDetails.emoji}
					</div>
					<div className="text-sm text-primary/80">Location: {timeDetails.message}</div>
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
						{deviceProfile.icon} {deviceProfile.details}
					</div>
					<div className="text-sm text-primary/60">{deviceProfile.message}</div>
				</div>
			</motion.div>
		)
	}

	const renderAiContent = () => {
		if (!aiProfile) {
			return null
		}
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative w-full"
			>
				<div
					className={cn(
						'absolute inset-0 rounded-xl opacity-20 transition-opacity duration-500',
						'bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-purple-500/20',
					)}
					style={{
						backgroundImage:
							'radial-gradient(circle at center, var(--primary)/10%, transparent 70%)',
					}}
				/>
				<div className="relative p-4 text-center space-y-3">
					<div className="grid grid-cols-2 gap-4">
						<div className="text-center">
							<div className="text-2xl font-medium text-primary">99.9%</div>
							<div className="text-sm text-primary/60">Uptime</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-medium text-primary">&lt;100ms</div>
							<div className="text-sm text-primary/60">Response</div>
						</div>
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

interface InteractionData {
	clicks: number
	scrollDepth: number
	timeSpent: number
	mouseDistance: number
	interactionPoints: number
}

// Define the features type
interface Feature {
	icon: string
	title: string
	description: string
	detailedDescription: string
	gradient: string
	pulseColor: string
	demo: {
		type: 'interactions' | 'score' | 'personalization'
		data: InteractionsData | ScoreData | PersonalizationData
	}
}

interface InteractionsData {
	clicks: number
	scrollDepth: number
	timeSpent: number
	interactionPoints: number
}

interface ScoreData {
	score: number
	sessionQuality: {
		label: string
		color: string
	}
	deviceInfo: {
		type: string
	}
	userIntent: string
}

interface PersonalizationData {
	businessValue: string
	conversionRate: number
	clientSatisfaction: number
	roi: string
}

// Update the component props type
type InnovationSectionProps = {
	page: HomeGlobal
}

// Update the features array to use data from props if available
const getDefaultFeatures = (): Feature[] => [
	{
		icon: 'heroicons:cursor-arrow-rays',
		title: 'Intelligent Interaction Tracking',
		description: 'Advanced analytics that capture meaningful user engagement patterns.',
		detailedDescription:
			'Our system tracks user interactions in real-time, providing deep insights into user behavior and preferences. This enables personalized experiences and informed decision-making.',
		gradient: 'from-blue-500/20 to-cyan-500/20',
		pulseColor: 'bg-cyan-500',
		demo: {
			type: 'interactions',
			data: {
				clicks: 24,
				scrollDepth: 85,
				timeSpent: 45,
				interactionPoints: 120,
			},
		},
	},
	{
		icon: 'heroicons:chart-bar',
		title: 'Engagement Scoring',
		description: 'Real-time measurement of user engagement quality and patterns.',
		detailedDescription:
			'Our engagement scoring system evaluates multiple factors to determine the quality of user interactions, helping identify areas for improvement and optimization.',
		gradient: 'from-violet-500/20 to-fuchsia-500/20',
		pulseColor: 'bg-fuchsia-500',
		demo: {
			type: 'score',
			data: {
				score: 85,
				sessionQuality: { label: 'High Value', color: 'text-blue-500' },
				deviceInfo: { type: 'Desktop' },
				userIntent: 'Decision Maker',
			},
		},
	},
	{
		icon: 'heroicons:user-circle',
		title: 'Business Impact Analysis',
		description: 'Transform user engagement data into actionable business insights.',
		detailedDescription:
			'We analyze user behavior patterns to help you make data-driven decisions. By understanding how visitors interact with your digital assets, we can optimize conversion paths and enhance user satisfaction, directly impacting your bottom line.',
		gradient: 'from-blue-400/20 via-teal-400/20 to-blue-600/20',
		pulseColor: 'bg-teal-500',
		demo: {
			type: 'personalization',
			data: {
				businessValue: 'High Value',
				conversionRate: 32,
				clientSatisfaction: 98,
				roi: '4.2x',
			},
		},
	},
]

export function InnovationSection({ page }: InnovationSectionProps) {
	const cardsRef = useRef<HTMLDivElement>(null)
	const cardRefs = useRef<(HTMLDivElement | null)[]>([])
	const [hasRevealedCards, setHasRevealedCards] = useState<boolean[]>([false, false, false])
	const mousePosition = useRef({ x: 0, y: 0 })
	const isHovering = useRef(false)
	const activeCardIndex = useRef<number | null>(null)
	const [interactionData, setInteractionData] = useState<InteractionData>({
		clicks: 0,
		scrollDepth: 0,
		timeSpent: 0,
		mouseDistance: 0,
		interactionPoints: 0,
	})
	const [startTime] = useState(Date.now())
	const lastMousePosition = useRef({ x: 0, y: 0 })
	const maxScrollDepthRef = useRef(0)
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.2,
	})
	const [deviceDetails, setDeviceDetails] = useState({
		type: 'Unknown',
		details: 'System',
		icon: '💻',
		personality: 'User',
		message: '',
	})
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedFeature, setSelectedFeature] = useState<number | null>(null)
	const isMobile = useRef<boolean>(false)

	// Get section content from page data or use defaults
	const data = page?.innovationSection
	const sectionTitle = data?.title || 'Our Approach'
	const sectionSubtitle = data?.subtitle || 'More than just software—we build the future.'
	const learnMoreText = data?.learnMoreText || 'Learn More'

	// Initialize features with data from props or defaults
	const defaultFeatures = getDefaultFeatures()
	const [liveFeatures, setLiveFeatures] = useState<Feature[]>(() => {
		if (data?.cards && data.cards.length > 0) {
			// Map the data cards to Feature objects
			return data.cards.map((card, index) => {
				const defaultFeature = defaultFeatures[index] || defaultFeatures[0]
				return {
					...defaultFeature,
					icon: card.icon || defaultFeature.icon,
					title: card.title || defaultFeature.title,
					description: card.description || defaultFeature.description,
					detailedDescription: card.detailedDescription || defaultFeature.detailedDescription,
					gradient: card.gradient || defaultFeature.gradient,
				}
			})
		}
		return [...defaultFeatures]
	})

	// Live feature data that will be updated based on user interactions
	const [shimmerState, setShimmerState] = useState({
		isActive: false,
		sourceIndex: null as number | null,
		intensity: 0,
	})

	// Check for mobile/tablet devices
	useEffect(() => {
		const checkMobile = () => {
			const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
			const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches
			isMobile.current = isMobileDevice || isSmallScreen
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Move device detection to useEffect
	useEffect(() => {
		const detectDevice = () => {
			const browserInfo = navigator.userAgent
			const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(browserInfo)
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

			const deviceType = isTablet ? 'Tablet' : isMobileDevice ? 'Mobile' : 'Desktop'
			const os = isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : ''
			const browser = isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Browser'
			const icon = deviceType === 'Desktop' ? '💻' : deviceType === 'Tablet' ? '📱' : '📱'

			setDeviceDetails({
				type: deviceType,
				details: `${os} · ${browser} · ${screenSize} display`,
				icon,
				personality: `${deviceType} User`,
				message: '',
			})

			// Update the device type in the second card
			setLiveFeatures((prev) => {
				const updated = [...prev]
				if (updated[1] && updated[1].demo.type === 'score') {
					const scoreData = updated[1].demo.data as ScoreData
					scoreData.deviceInfo.type = deviceType
					updated[1].demo.data = scoreData
				}
				return updated
			})

			// Update isMobile ref
			isMobile.current = deviceType === 'Mobile' || deviceType === 'Tablet' || width < 1024
		}

		detectDevice()

		// Also listen for resize events to update mobile detection
		window.addEventListener('resize', detectDevice)
		return () => window.removeEventListener('resize', detectDevice)
	}, [])

	// Track user interactions
	useEffect(() => {
		let animationFrame: number | null = null
		let totalDistance = 0
		let isComponentMounted = true
		let lastUpdateTime = Date.now()
		const updateInterval = 100 // Update more frequently (was 500ms)
		let clickCount = 0 // Track clicks locally

		const updateInteractions = () => {
			if (!isComponentMounted) return

			const currentTime = Date.now()
			const timeSpent = Math.floor((currentTime - startTime) / 1000)
			const currentScrollDepth = Math.floor(
				(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
			)

			// Update max scroll depth if current is higher
			maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, currentScrollDepth)

			// Calculate engagement score
			const engagementScore = Math.floor(
				clickCount * 15 + // Increased click weight
					maxScrollDepthRef.current * 0.8 + // Increased scroll weight
					timeSpent * 0.5 + // Increased time weight
					totalDistance * 0.02, // Increased mouse movement weight
			)

			// Update interaction data on every frame for smoother updates
			setInteractionData({
				clicks: clickCount,
				timeSpent,
				scrollDepth: maxScrollDepthRef.current,
				mouseDistance: Math.floor(totalDistance),
				interactionPoints: engagementScore,
			})

			// Update live features data periodically
			if (currentTime - lastUpdateTime > updateInterval) {
				lastUpdateTime = currentTime

				setLiveFeatures((prev) => {
					// Create deep copies to ensure React detects changes
					const updated = JSON.parse(JSON.stringify(prev))

					// Update first card with real interaction data
					if (updated[0] && updated[0].demo.type === 'interactions') {
						updated[0].demo.data.clicks = clickCount
						updated[0].demo.data.scrollDepth = maxScrollDepthRef.current
						updated[0].demo.data.timeSpent = timeSpent
						updated[0].demo.data.interactionPoints = engagementScore
					}

					// Update second card with engagement score
					if (updated[1] && updated[1].demo.type === 'score') {
						const sessionQuality = calculateSessionQuality({
							clicks: clickCount,
							scrollDepth: maxScrollDepthRef.current,
							timeSpent,
							mouseDistance: Math.floor(totalDistance),
							interactionPoints: engagementScore,
						})

						updated[1].demo.data.score = sessionQuality.score
						updated[1].demo.data.sessionQuality = {
							label: sessionQuality.label,
							color: sessionQuality.color,
						}

						const userIntent = determineUserIntent({
							clicks: clickCount,
							scrollDepth: maxScrollDepthRef.current,
							timeSpent,
							mouseDistance: Math.floor(totalDistance),
							interactionPoints: engagementScore,
						})

						updated[1].demo.data.userIntent = userIntent
					}

					// Update third card with business impact data
					if (updated[2] && updated[2].demo.type === 'personalization') {
						// Calculate conversion rate based on engagement - make it fill faster
						const conversionRate = Math.min(Math.floor(engagementScore / 2.5), 100)
						// Calculate client satisfaction based on time spent and scroll depth
						const satisfaction = Math.min(
							Math.floor((timeSpent * 0.8 + maxScrollDepthRef.current * 0.8) * 1.2),
							100,
						)
						// Calculate ROI based on engagement score - make it more impactful
						const roiValue = (engagementScore / 20).toFixed(1)

						updated[2].demo.data.conversionRate = conversionRate
						updated[2].demo.data.clientSatisfaction = satisfaction
						updated[2].demo.data.roi = `${roiValue}x`

						// Determine business value tier based on engagement - more meaningful labels
						if (engagementScore > 120) {
							updated[2].demo.data.businessValue = 'High Value'
						} else if (engagementScore > 80) {
							updated[2].demo.data.businessValue = 'Medium Value'
						} else if (engagementScore > 40) {
							updated[2].demo.data.businessValue = 'Growing Value'
						} else {
							updated[2].demo.data.businessValue = 'New Visitor'
						}
					}

					return updated
				})
			}

			animationFrame = requestAnimationFrame(updateInteractions)
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (!isComponentMounted) return

			const dx = e.clientX - lastMousePosition.current.x
			const dy = e.clientY - lastMousePosition.current.y
			totalDistance += Math.sqrt(dx * dx + dy * dy)
			lastMousePosition.current = { x: e.clientX, y: e.clientY }

			// Update mouse position for card animations
			if (cardsRef.current) {
				const rect = cardsRef.current.getBoundingClientRect()
				mousePosition.current = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				}
			}
		}

		const handleClick = () => {
			if (!isComponentMounted) return
			clickCount++ // Increment local click counter directly
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('click', handleClick)
		animationFrame = requestAnimationFrame(updateInteractions)

		return () => {
			isComponentMounted = false
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('click', handleClick)
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame)
			}
		}
	}, [startTime])

	// Progressive card reveal
	useEffect(() => {
		if (!inView) return

		const revealNextCard = (index: number) => {
			setTimeout(() => {
				setHasRevealedCards((prev) => {
					const next = [...prev]
					next[index] = true
					return next
				})
			}, index * 1000)
		}
		;[0, 1, 2].forEach(revealNextCard)
	}, [inView])

	// Refined magnetic force calculation
	const calculateMagneticForce = (sourceIndex: number, targetIndex: number, distance: number) => {
		const maxForce = 15 // Increased for more noticeable effect
		const falloff = 0.7 // Adjusted for smoother falloff
		const direction = targetIndex > sourceIndex ? 1 : -1
		return direction * maxForce * Math.exp(-distance * falloff)
	}

	// Enhanced card interaction system
	useEffect(() => {
		if (!cardsRef.current || isMobile.current) return

		const ctx = gsap.context(() => {
			const cards = cardRefs.current
			let rafId: number
			let previousMouseX = 0
			let mouseVelocity = 0
			const velocityDamping = 0.92 // Smooths out velocity changes

			// Add effect intensity control
			let effectIntensity = 0
			const maxEffectIntensity = 1
			let hasInteracted = false
			let initialInteractionTime = 0
			const rampUpDuration = 1000 // 1 second ramp-up time

			// Initialize cards with subtle default positions
			cards.forEach((card, index) => {
				if (!card) return
				gsap.set(card, {
					rotationY: (index - 1) * 3, // Reduced initial rotation
					transformOrigin: 'center center -100px',
					transformPerspective: 1200,
				})
			})

			const updateCards = () => {
				if (!isHovering.current) return

				const mouseX = mousePosition.current.x
				const mouseY = mousePosition.current.y

				// Update effect intensity based on time since first interaction
				if (hasInteracted) {
					const timeSinceInteraction = Date.now() - initialInteractionTime
					effectIntensity = Math.min(maxEffectIntensity, timeSinceInteraction / rampUpDuration)
				}

				mouseVelocity = (mouseX - previousMouseX) * 0.08 * velocityDamping * effectIntensity
				previousMouseX = mouseX

				cards.forEach((card, index) => {
					if (!card) return

					const rect = card.getBoundingClientRect()
					const cardCenterX = rect.left + rect.width / 2
					const cardCenterY = rect.top + rect.height / 2

					const deltaX = mouseX - cardCenterX
					const deltaY = mouseY - cardCenterY
					const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

					let magneticForce = 0
					if (activeCardIndex.current !== null && activeCardIndex.current !== index) {
						const activeCard = cards[activeCardIndex.current]
						if (activeCard) {
							const activeRect = activeCard.getBoundingClientRect()
							const cardDistance = Math.abs(rect.left - activeRect.left) / rect.width
							magneticForce =
								calculateMagneticForce(activeCardIndex.current, index, cardDistance) *
								effectIntensity
						}
					}

					gsap.to(card, {
						x:
							magneticForce +
							(index === activeCardIndex.current ? deltaX * 0.08 * effectIntensity : 0),
						y: index === activeCardIndex.current ? deltaY * 0.08 * effectIntensity : 0,
						rotationY:
							(index - 1) * 3 + mouseVelocity * (index === activeCardIndex.current ? 0.4 : 0.15),
						rotationX: index === activeCardIndex.current ? -deltaY * 0.015 * effectIntensity : 0,
						scale:
							index === activeCardIndex.current
								? 1 + 0.015 * effectIntensity
								: 1 + Math.abs(magneticForce) * 0.0008,
						duration: 0.8,
						ease: 'power2.out',
					})
				})

				rafId = requestAnimationFrame(updateCards)
			}

			const handleMouseMove = (e: MouseEvent) => {
				mousePosition.current = { x: e.clientX, y: e.clientY }

				// Track first interaction
				if (!hasInteracted) {
					hasInteracted = true
					initialInteractionTime = Date.now()
				}
			}

			const handleMouseEnter = (index: number) => {
				isHovering.current = true
				activeCardIndex.current = index

				// Activate coordinated shimmer effect with higher intensity
				setShimmerState({
					isActive: true,
					sourceIndex: index,
					intensity: 1.2 * effectIntensity, // Scale intensity with effect ramp-up
				})

				// Add a subtle pulse to the hovered card
				const card = cardRefs.current[index]
				if (card) {
					// Enhance the gradient color of the hovered card
					const gradientEl = card.querySelector('.bg-gradient-to-br')
					if (gradientEl) {
						gsap.to(gradientEl, {
							opacity: 0.15 * effectIntensity, // Scale with effect intensity
							duration: 0.4,
							ease: 'power2.out',
						})
					}

					// Create a subtle pulse animation
					gsap.to(card, {
						boxShadow: `0 ${25 * effectIntensity}px ${
							60 * effectIntensity
						}px -5px rgba(var(--primary-rgb), ${0.35 * effectIntensity})`,
						duration: 0.4,
						ease: 'power2.out',
					})

					// Also pulse the shimmer element
					const shimmerEl = card.querySelector('.shimmer-effect')
					if (shimmerEl) {
						gsap.to(shimmerEl, {
							opacity: 0.95 * effectIntensity, // Scale with effect intensity
							duration: 0.3,
							ease: 'power2.out',
							yoyo: true,
							repeat: 1,
						})
					}
				}

				updateCards()
			}

			const handleMouseLeave = () => {
				isHovering.current = false
				activeCardIndex.current = null

				// Fade out shimmer effect
				setShimmerState((prev) => ({
					...prev,
					isActive: false,
					intensity: 0,
				}))

				cards.forEach((card, index) => {
					if (!card) return
					gsap.to(card, {
						x: 0,
						y: 0,
						rotationY: (index - 1) * 3,
						rotationX: 0,
						scale: 1,
						duration: 1,
						ease: 'elastic.out(1, 0.4)',
					})
				})
			}

			document.addEventListener('mousemove', handleMouseMove)
			cards.forEach((card, index) => {
				if (!card) return
				card.addEventListener('mouseenter', () => handleMouseEnter(index))
				card.addEventListener('mouseleave', handleMouseLeave)
			})

			// Add shadow animation
			cards.forEach((card, index) => {
				if (!card) return

				const shadowEl = card.querySelector('div[class*="-z-10"]')

				gsap.to(shadowEl, {
					boxShadow: '0 10px 50px -5px rgba(var(--primary-rgb), 0.2)',
					duration: 0.4,
					paused: true,
					ease: 'power2.out',
				})

				card.addEventListener('mouseenter', () => {
					gsap.to(shadowEl, {
						boxShadow: '0 20px 60px -5px rgba(var(--primary-rgb), 0.25)',
						duration: 0.4,
						ease: 'power2.out',
					})
				})

				card.addEventListener('mouseleave', () => {
					gsap.to(shadowEl, {
						boxShadow: '0 0 30px -10px rgba(var(--primary-rgb), 0.1)',
						duration: 0.6,
						ease: 'power2.out',
					})
				})
			})

			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				cancelAnimationFrame(rafId)
				cards.forEach((card, index) => {
					if (!card) return
					card.removeEventListener('mouseenter', () => handleMouseEnter(index))
					card.removeEventListener('mouseleave', handleMouseLeave)
				})
			}
		})

		return () => ctx.revert()
	}, [])

	// Update the shimmer effect animation in the useEffect
	useEffect(() => {
		if (!cardsRef.current || isMobile.current) return

		const cards = cardRefs.current

		if (shimmerState.isActive && shimmerState.sourceIndex !== null) {
			cards.forEach((card, index) => {
				if (!card) return

				const distanceFromSource = Math.abs(index - shimmerState.sourceIndex!)
				const delay = distanceFromSource * 0.1 // Reduced delay for faster propagation

				const shimmerEl = card.querySelector('.shimmer-effect')
				if (!shimmerEl) return

				// Simplified shimmer animation
				gsap.to(shimmerEl, {
					opacity: 0.7,
					duration: 0.3,
					delay: delay,
					ease: 'power2.out',
					onComplete: () => {
						gsap.to(shimmerEl, {
							opacity: 0,
							duration: 0.5,
							ease: 'power2.in',
						})
					},
				})

				// Animate background position
				gsap.fromTo(
					shimmerEl,
					{ backgroundPosition: '-100% 0' },
					{
						backgroundPosition: '200% 0',
						duration: 1,
						delay: delay,
						ease: 'power2.inOut',
						overwrite: true,
					},
				)

				// Subtle scale animation
				if (index !== shimmerState.sourceIndex) {
					gsap.to(card, {
						scale: 1.005,
						duration: 0.3,
						delay: delay,
						ease: 'power2.out',
						yoyo: true,
						repeat: 1,
					})
				}
			})
		} else {
			// Reset all shimmer elements
			cards.forEach((card) => {
				if (!card) return
				const shimmerEl = card.querySelector('.shimmer-effect')
				if (!shimmerEl) return

				gsap.to(shimmerEl, {
					opacity: 0,
					duration: 0.3,
					ease: 'power2.out',
				})
			})
		}
	}, [shimmerState, isMobile])

	// Add a separate effect for mobile devices to ensure they have a good experience
	useEffect(() => {
		if (!cardsRef.current || !isMobile.current) return

		// For mobile devices, apply simpler hover effects without 3D transforms
		const ctx = gsap.context(() => {
			const cards = cardRefs.current

			// Reset any 3D transforms that might have been applied
			cards.forEach((card) => {
				if (!card) return
				gsap.set(card, {
					rotationY: 0,
					rotationX: 0,
					transformOrigin: 'center center',
					transformPerspective: 'none',
					x: 0,
					y: 0,
					scale: 1,
				})
			})

			// Add touch-friendly hover effects
			cards.forEach((card, index) => {
				if (!card) return

				card.addEventListener('touchstart', () => {
					gsap.to(card, {
						scale: 1.03,
						duration: 0.3,
						ease: 'power2.out',
						boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
					})
				})

				card.addEventListener('touchend', () => {
					gsap.to(card, {
						scale: 1,
						duration: 0.5,
						ease: 'elastic.out(1, 0.5)',
						boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
					})
				})
			})
		})

		return () => ctx.revert()
	}, [])

	// Handle modal open/close
	const openModal = (index: number) => {
		setSelectedFeature(index)
		setIsModalOpen(true)
	}

	// Create deviceInfo for InteractiveDemo
	const deviceInfo = useMemo(
		() => ({
			type: deviceDetails.type,
		}),
		[deviceDetails.type],
	)

	return (
		<>
			<section ref={ref} className="py-32 w-full relative overflow-hidden">
				<div className="absolute inset-0 opacity-[0.02]" />
				<div className="u-container">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-24">
							<h2 className="approach-title fl-text-step-2 text-black font-medium mb-4">
								{sectionTitle}
							</h2>
							<p className="fl-text-step-4 md:fl-text-step-5 font-medium text-black max-w-4xl mx-auto mb-8">
								{sectionSubtitle}
								<br />
							</p>
						</div>

						<div
							ref={cardsRef}
							className="relative grid grid-cols-1 md:grid-cols-3 gap-12 perspective-1200"
							style={{ perspective: '1200px' }}
						>
							{liveFeatures.map((feature, index) => (
								<div
									key={index}
									ref={(el) => {
										if (cardRefs.current) cardRefs.current[index] = el
									}}
									className="approach-card relative group cursor-pointer will-change-transform"
									style={{ transformStyle: 'preserve-3d' }}
									onClick={() => openModal(index)}
								>
									<div
										className="relative space-y-6 p-8 bg-background/40 backdrop-blur-[2px] rounded-3xl border border-primary/5 h-full flex flex-col overflow-hidden"
										ref={(el) => {
											if (cardRefs.current) cardRefs.current[index] = el
										}}
									>
										{/* Base layer with subtle shadow */}
										<div
											className="absolute inset-0 -z-10 rounded-3xl transition-all duration-300"
											style={{
												boxShadow: '0 0 30px -10px rgba(var(--primary-rgb), 0.1)',
												transform: 'translateZ(-1px)',
											}}
										/>

										{/* Subtle background gradient */}
										<div
											className={`absolute inset-0 rounded-3xl opacity-[0.03] bg-gradient-to-br ${feature.gradient}`}
										/>

										{/* Shimmer effect - Simplified and more subtle */}
										<div
											className="absolute inset-0 rounded-3xl overflow-hidden shimmer-effect"
											style={{
												background: `linear-gradient(
													90deg,
													transparent 0%,
													rgba(var(--primary-rgb), 0.07) 50%,
													transparent 100%
												)`,
												backgroundSize: '200% 100%',
												opacity: 0,
												transition: 'opacity 0.3s ease-in-out',
											}}
										/>

										{/* Glass effect overlay */}
										<div
											className="absolute inset-0 rounded-3xl"
											style={{
												background:
													'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
												borderTop: '1px solid rgba(255,255,255,0.12)',
												borderLeft: '1px solid rgba(255,255,255,0.08)',
											}}
										/>

										{/* Card Content */}
										<div className="card-content relative z-10">
											{/* Top Section with Icon */}
											<div className="approach-icon relative w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
												<motion.div
													animate={{
														scale: [1, 1.2, 1],
													}}
													transition={{
														duration: 2,
														repeat: Infinity,
														ease: 'easeInOut',
													}}
												>
													<Icon icon={feature.icon} className="w-6 h-6 text-primary" />
												</motion.div>
											</div>

											{/* Title and Description */}
											<div className="relative">
												<h3 className="fl-text-step-1 font-medium text-foreground mb-3">
													{feature.title}
												</h3>
												<p className="text-foreground/80 mb-4">{feature.description}</p>

												{/* Info Button - Now shown as "Learn More" text link 
												<button
													className="text-xs text-primary hover:text-primary/80 transition-colors mt-2 flex items-center gap-1"
													aria-label="More information"
												>
													{learnMoreText}
													<Icon icon="heroicons:arrow-right" className="w-4 h-4" />
												</button>
												*/}
											</div>

											{/* Interactive Demo Section */}
											<div className="relative mt-auto pt-6 border-t border-primary/10">
												<InteractiveDemo feature={feature} deviceInfo={deviceInfo} />
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Feature Detail Modal */}
			{isModalOpen && selectedFeature !== null && (
				<FeatureDetailModal
					feature={liveFeatures[selectedFeature]}
					onClose={() => {
						setIsModalOpen(false)
						setSelectedFeature(null)
					}}
				/>
			)}
		</>
	)
}

function InteractiveDemo({
	feature,
	deviceInfo,
}: {
	feature: Feature
	deviceInfo: { type: string }
}) {
	const interactionLabel = deviceInfo.type === 'Desktop' ? 'Clicks' : 'Taps'

	// Use a ref to store the current feature data for comparison
	const featureRef = useRef(feature)

	// Store previous values to prevent unnecessary updates
	const prevValuesRef = useRef({
		score: 0,
		conversionRate: 0,
		clientSatisfaction: 0,
	})

	// Force re-render when data changes significantly
	const [updateCounter, setUpdateCounter] = useState(0)

	// Update component when feature data changes significantly
	useEffect(() => {
		const timer = setInterval(() => {
			// Check if data has changed by comparing with stored ref
			const currentData = feature.demo.data

			// Only update if there's a significant change in values
			if (feature.demo.type === 'score') {
				const scoreData = currentData as ScoreData
				const prevScore = prevValuesRef.current.score

				// Only update if score changed by at least 5 points
				if (Math.abs(scoreData.score - prevScore) >= 5) {
					prevValuesRef.current.score = scoreData.score
					featureRef.current = feature
					setUpdateCounter((prev) => prev + 1)
				}
			} else if (feature.demo.type === 'personalization') {
				const personalizationData = currentData as PersonalizationData
				const prevConversionRate = prevValuesRef.current.conversionRate
				const prevSatisfaction = prevValuesRef.current.clientSatisfaction

				// Only update if conversion rate or satisfaction changed by at least 5 points
				if (
					Math.abs(personalizationData.conversionRate - prevConversionRate) >= 5 ||
					Math.abs(personalizationData.clientSatisfaction - prevSatisfaction) >= 5
				) {
					prevValuesRef.current.conversionRate = personalizationData.conversionRate
					prevValuesRef.current.clientSatisfaction = personalizationData.clientSatisfaction
					featureRef.current = feature
					setUpdateCounter((prev) => prev + 1)
				}
			} else {
				// For other types, just update the ref without triggering re-render
				featureRef.current = feature
			}
		}, 500) // Check less frequently to reduce updates

		return () => clearInterval(timer)
	}, [feature])

	switch (feature.demo.type) {
		case 'interactions': {
			const data = feature.demo.data as InteractionsData
			return (
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<div className="text-2xl font-medium text-primary">{data.clicks}</div>
							<div className="text-sm text-primary/60">{interactionLabel}</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-medium text-primary">{data.scrollDepth}%</div>
							<div className="text-sm text-primary/60">Page Explored</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-medium text-primary">{data.timeSpent}s</div>
							<div className="text-sm text-primary/60">Time Spent</div>
						</div>
					</div>
				</div>
			)
		}

		case 'score': {
			const data = feature.demo.data as ScoreData
			return (
				<div className="space-y-4">
					<div className="space-y-1.5">
						<div className="relative h-1 bg-primary/10 rounded-full overflow-hidden">
							<motion.div
								className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-cyan-500"
								initial={{ width: '0%' }}
								animate={{ width: `${Math.min(data.score, 100)}%` }}
								transition={{
									duration: 1.5,
									ease: 'easeOut',
								}}
								// Only use updateCounter for key, not the actual score value
								key={`score-${updateCounter}`}
							/>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-[11px] text-primary/60">Client Potential</span>
							<span className={cn('text-[11px] font-medium', data.sessionQuality.color)}>
								{data.sessionQuality.label}
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="p-2.5 rounded-xl bg-primary/5">
							<div className="text-base font-medium text-primary">{data.deviceInfo.type}</div>
							<div className="text-[11px] text-primary/60">Platform</div>
						</div>
						<div className="p-2.5 rounded-xl bg-primary/5">
							<div className="text-base font-medium text-primary">{data.userIntent}</div>
							<div className="text-[11px] text-primary/60">User Role</div>
						</div>
					</div>
				</div>
			)
		}

		case 'personalization': {
			const data = feature.demo.data as PersonalizationData
			return (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="p-2.5 rounded-xl bg-primary/5">
							<div className="text-base font-medium text-primary">{data.businessValue}</div>
							<div className="text-[11px] text-primary/60">Visitor Value</div>
						</div>
						<div className="p-2.5 rounded-xl bg-primary/5">
							<div className="text-base font-medium text-primary">{data.roi}</div>
							<div className="text-[11px] text-primary/60">Engagement ROI</div>
						</div>
					</div>
					<div className="space-y-1.5">
						<div className="flex justify-between items-center">
							<span className="text-[11px] text-primary/60">Conversion Potential</span>
							<span className="text-[11px] font-medium text-blue-500">{data.conversionRate}%</span>
						</div>
						<div className="relative h-1 bg-primary/10 rounded-full overflow-hidden">
							<motion.div
								className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-blue-500"
								initial={{ width: '0%' }}
								animate={{ width: `${Math.min(data.conversionRate, 100)}%` }}
								transition={{
									duration: 1.5,
									ease: 'easeOut',
								}}
								// Only use updateCounter for key, not the actual conversion rate
								key={`conversion-${updateCounter}`}
							/>
						</div>
					</div>
					<div className="space-y-1.5">
						<div className="flex justify-between items-center">
							<span className="text-[11px] text-primary/60">Visitor Satisfaction</span>
							<span className="text-[11px] font-medium text-teal-500">
								{data.clientSatisfaction}%
							</span>
						</div>
						<div className="relative h-1 bg-primary/10 rounded-full overflow-hidden">
							<motion.div
								className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-teal-500"
								initial={{ width: '0%' }}
								animate={{ width: `${Math.min(data.clientSatisfaction, 100)}%` }}
								transition={{
									duration: 1.5,
									ease: 'easeOut',
								}}
								// Only use updateCounter for key, not the actual satisfaction value
								key={`satisfaction-${updateCounter}`}
							/>
						</div>
					</div>
				</div>
			)
		}

		default:
			return null
	}
}

// Calculate engagement trend based on interaction patterns
const calculateEngagementTrend = (data: InteractionData) => {
	const baseScore = data.interactionPoints
	const timeWeight = Math.min(data.timeSpent / 30, 1)
	const scrollWeight = data.scrollDepth / 100
	const clickWeight = Math.min(data.clicks / 5, 1)
	const score = baseScore * timeWeight * scrollWeight * clickWeight

	return {
		trend: score.toFixed(1),
		direction: score > 50 ? 'Rapidly Growing' : score > 30 ? 'Steadily Rising' : 'Building Up',
		color: score > 50 ? 'text-blue-500' : score > 30 ? 'text-violet-500' : 'text-primary',
	}
}

// Calculate session quality score
const calculateSessionQuality = (data: InteractionData) => {
	const interactionDensity = data.clicks / Math.max(data.timeSpent, 1)
	const scrollProgress = data.scrollDepth / 100
	// Increase the base score calculation to make progress bar fill faster
	const score = Math.min(interactionDensity * 80 + scrollProgress * 80, 100)

	return {
		score: Math.floor(score),
		label: score > 70 ? 'High Engagement' : score > 40 ? 'Active Engagement' : 'Initial Interest',
		color: score > 70 ? 'text-blue-500' : score > 40 ? 'text-violet-500' : 'text-primary',
	}
}

// Determine user intent based on behavior - more meaningful labels
const determineUserIntent = (data: InteractionData) => {
	if (data.scrollDepth > 80 && data.timeSpent > 30) return 'Decision Maker'
	if (data.clicks > 10) return 'Active Researcher'
	if (data.scrollDepth > 60) return 'Information Seeker'
	if (data.timeSpent > 20) return 'Engaged Visitor'
	return 'New Explorer'
}

// Check if user is returning
const checkIfReturningUser = () => {
	try {
		const visits = parseInt(localStorage.getItem('visitCount') || '0')
		localStorage.setItem('visitCount', (visits + 1).toString())
		return visits > 0
	} catch {
		return false
	}
}

// Determine user profile based on interaction patterns
const determineUserProfile = (data: InteractionData) => {
	if (data.interactionPoints > 100) return 'Power User'
	if (data.scrollDepth > 70) return 'Content Explorer'
	if (data.clicks > 8) return 'Interactive User'
	return 'New Explorer'
}

// Determine content preference based on interaction patterns
const determineContentPreference = (data: InteractionData) => {
	const hasHighScroll = data.scrollDepth > 60
	const hasHighClicks = data.clicks > 5
	const hasLongSession = data.timeSpent > 45

	if (hasHighScroll && hasLongSession) return 'Detailed Content'
	if (hasHighClicks && !hasLongSession) return 'Interactive Features'
	if (hasHighScroll && !hasLongSession) return 'Quick Overview'
	return 'Exploring Options'
}

// Feature Detail Modal Component
function FeatureDetailModal({
	feature,
	onClose,
}: {
	feature: Feature
	onClose: () => void
}) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [onClose])

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div
				className="relative bg-background rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
				>
					<Icon icon="heroicons:x-mark" className="w-6 h-6 text-primary" />
				</button>

				<div className="flex items-center gap-4 mb-6">
					<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
						<Icon icon={feature.icon} className="w-6 h-6 text-primary" />
					</div>
					<h2 className="fl-text-step-2 font-medium">{feature.title}</h2>
				</div>

				<p className="text-foreground/80 mb-6">{feature.description}</p>
				<p className="text-foreground/70">{feature.detailedDescription}</p>
			</div>
		</div>
	)
}

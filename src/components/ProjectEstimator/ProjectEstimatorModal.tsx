'use client'

import { Button } from '@/components/ui/Button'
import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { ProjectEstimator } from '@/payload-types'
import {
	Modal,
	ModalContent,
	ModalHeader,
	ScrollShadow,
	ModalBody,
	ModalFooter,
} from '@heroui/react'
import { createBid } from '@/actions/bid'
import { toast } from 'sonner'

type ProjectPhase = {
	name: string
	percentage: number
	description?: string
}

type ProjectOption = {
	id: string
	label: string
	description: string
	basePrice: number
	icon: string
	timeEstimate?: {
		min: number
		max: number
		level: 'simple' | 'moderate' | 'complex'
		team: number
	}
	phases?: ProjectPhase[]
}

type ProjectScope = {
	category: string
	options: ProjectOption[]
}

// Convert CMS data to our internal format
const convertCMSDataToProjectScopes = (data: ProjectEstimator | null): ProjectScope[] => {
	if (!data?.categories?.length) return defaultProjectScopes

	return data.categories.map((category) => ({
		category: category.name,
		options: (category.options || []).map((option) => ({
			id: option.id || String(Math.random()),
			label: option.label,
			description: option.description,
			basePrice: option.basePrice,
			icon: option.icon,
			timeEstimate: option.timeEstimate
				? {
						min: option.timeEstimate.min,
						max: option.timeEstimate.max,
						level: option.timeEstimate.level,
						team: option.timeEstimate.team,
				  }
				: undefined,
			phases: option.phases?.filter((phase): phase is ProjectPhase => {
				return phase.name != null && phase.percentage != null
			}),
		})),
	}))
}

// Default categories if CMS data is not available
const defaultProjectScopes: ProjectScope[] = [
	{
		category: 'Project Type',
		options: [
			{
				id: 'corporate',
				label: 'Corporate Website',
				description: 'Professional website with multiple pages and content management',
				basePrice: 15000,
				icon: 'heroicons:building-office',
			},
			{
				id: 'ecommerce',
				label: 'E-commerce Platform',
				description: 'Full-featured online store with product management and payments',
				basePrice: 25000,
				icon: 'heroicons:shopping-cart',
			},
			{
				id: 'web-app',
				label: 'Web Application',
				description: 'Custom web application with user authentication and features',
				basePrice: 35000,
				icon: 'heroicons:computer-desktop',
			},
		],
	},
	{
		category: 'Design Complexity',
		options: [
			{
				id: 'standard',
				label: 'Standard Design',
				description: 'Clean, professional design using established patterns',
				basePrice: 5000,
				icon: 'heroicons:square-2-stack',
			},
			{
				id: 'custom',
				label: 'Custom Design',
				description: 'Unique, branded design with custom components',
				basePrice: 10000,
				icon: 'heroicons:paint-brush',
			},
			{
				id: 'premium',
				label: 'Premium Design',
				description: 'High-end design with animations and unique interactions',
				basePrice: 15000,
				icon: 'heroicons:sparkles',
			},
		],
	},
	{
		category: 'Content Management',
		options: [
			{
				id: 'basic-cms',
				label: 'Basic CMS',
				description: 'Simple content updates and basic media management',
				basePrice: 3000,
				icon: 'heroicons:document-text',
			},
			{
				id: 'advanced-cms',
				label: 'Advanced CMS',
				description: 'Complex content types and workflow management',
				basePrice: 8000,
				icon: 'heroicons:document-plus',
			},
			{
				id: 'headless-cms',
				label: 'Headless CMS',
				description: 'API-first content management with multiple channels',
				basePrice: 12000,
				icon: 'heroicons:circle-stack',
			},
		],
	},
]

export interface ProjectEstimatorModalProps {
	isOpen: boolean
	onClose: () => void
	data: ProjectEstimator | null
	defaultSettings: {
		workingDaysPerWeek: number
		hoursPerDay: number
		bufferPercentage: number
	}
}

export function ProjectEstimatorModal({
	isOpen,
	onClose,
	data,
	defaultSettings,
}: ProjectEstimatorModalProps) {
	const router = useRouter()
	const [selectedOptions, setSelectedOptions] = useState<Record<string, ProjectOption>>({})
	const [totalEstimate, setTotalEstimate] = useState<number>(0)
	const [totalTimeEstimate, setTotalTimeEstimate] = useState<{ min: number; max: number }>({
		min: 0,
		max: 0,
	})
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [email, setEmail] = useState('')
	const [showPrices, setShowPrices] = useState(false)
	const [showingEmailForm, setShowingEmailForm] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [bidId, setBidId] = useState<string | null>(null)
	const [projectScopes, setProjectScopes] = useState<ProjectScope[]>(() =>
		convertCMSDataToProjectScopes(data),
	)

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email || !email.includes('@')) {
			setError('Please enter a valid email address')
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			// Calculate start and end dates
			const { startDate, endDate } = calculateProjectDuration(totalTimeEstimate.max)

			// Prepare selected options for storage
			const formattedOptions = Object.entries(selectedOptions).map(([category, option]) => ({
				category,
				selection: option.label,
				price: option.basePrice,
			}))

			// Create the bid
			const result = await createBid({
				email,
				totalEstimate,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				selectedOptions: formattedOptions,
			})

			if (result.success && result.bidSlug) {
				// Show success message and reveal prices
				toast.success('Your estimate has been saved!')
				setShowPrices(true)
				setShowingEmailForm(false)
				setBidId(result.bidSlug)
			} else {
				setError(result.error || 'Failed to save your estimate. Please try again.')
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.')
			console.error('Error submitting bid:', err)
		} finally {
			setIsSubmitting(false)
		}
	}

	const calculateTimeEstimate = (newSelected: Record<string, ProjectOption>) => {
		const estimates = Object.values(newSelected)
			.filter((option) => option.timeEstimate)
			.map((option) => option.timeEstimate!)

		if (estimates.length === 0) return { min: 0, max: 0 }

		return {
			min: estimates.reduce((sum, est) => sum + est.min, 0),
			max: estimates.reduce((sum, est) => sum + est.max, 0),
		}
	}

	const handleOptionSelect = (category: string, option: ProjectOption) => {
		setSelectedOptions((prev) => {
			const newSelected = {
				...prev,
				[category]: option,
			}

			const newTotal = Object.values(newSelected).reduce((sum, opt) => sum + opt.basePrice, 0)
			setTotalEstimate(newTotal)

			const newTimeEstimate = calculateTimeEstimate(newSelected)
			setTotalTimeEstimate(newTimeEstimate)

			return newSelected
		})
	}

	const handleNext = () => {
		setCurrentStep((prev) => Math.min(prev + 1, 3))
	}

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	const handleClose = () => {
		onClose()
		// Reset state when modal closes
		setTimeout(() => {
			setCurrentStep(1)
			setSelectedOptions({})
			setTotalEstimate(0)
		}, 300)
	}

	if (!isOpen) {
		return null
	}

	// Add this function to render the timeline
	const renderTimeline = () => {
		const selectedOptionsWithPhases = Object.values(selectedOptions).filter(
			(option) => option.phases?.length,
		)
		if (selectedOptionsWithPhases.length === 0) return null

		return (
			<div className="space-y-6 mt-8">
				<h4 className="text-lg font-medium text-foreground">Project Timeline</h4>
				<div className="space-y-4">
					{selectedOptionsWithPhases.map((option, optionIndex) => (
						<div key={option.id} className="space-y-3">
							<div className="text-sm font-medium text-foreground">{option.label}</div>
							<div className="relative flex h-8 rounded-lg overflow-hidden bg-foreground/5">
								{option.phases?.map((phase, phaseIndex) => (
									<div
										key={phase.name}
										className={cn(
											'h-full transition-colors',
											phaseIndex % 2 === 0 ? 'bg-primary/20' : 'bg-primary/30',
										)}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	// Add date calculation utilities
	const calculateProjectDuration = (totalHours: number) => {
		const { workingDaysPerWeek, hoursPerDay, bufferPercentage } = defaultSettings
		const hoursWithBuffer = totalHours * (1 + bufferPercentage / 100)
		const totalDays = Math.ceil(hoursWithBuffer / hoursPerDay)
		const totalWeeks = Math.ceil(totalDays / workingDaysPerWeek)

		// Calculate the start date (next Monday, or Friday if today is Sunday)
		const today = new Date()
		const startDate = new Date(today)
		const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

		if (currentDay === 0) {
			// If Sunday
			startDate.setDate(today.getDate() + 5) // Next Friday
		} else {
			const daysUntilNextMonday = ((8 - currentDay) % 7) + 1
			startDate.setDate(today.getDate() + daysUntilNextMonday)
		}

		// Calculate end date based on total weeks from the start date
		const endDate = new Date(startDate)
		endDate.setDate(startDate.getDate() + totalWeeks * 7)

		// Format dates to show month name and day
		const formatDate = (date: Date) => {
			return date.toLocaleDateString('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})
		}

		return {
			totalDays,
			totalWeeks,
			startDate,
			endDate,
			estimatedHours: Math.ceil(hoursWithBuffer),
			formattedStartDate: formatDate(startDate),
			formattedEndDate: formatDate(endDate),
		}
	}

	// Add this to your existing step 3 rendering logic
	const projectTimeline = calculateProjectDuration(totalTimeEstimate.min)

	// Add function to generate estimate URL
	const generateEstimateURL = () => {
		if (!bidId) return '/contact'
		return `/contact?bid=${bidId}`
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="2xl"
			scrollBehavior="inside"
			backdrop="blur"
			classNames={{
				backdrop: 'z-[91]', // Above FloatingTab to blur it
				base: 'z-[92]', // Above backdrop
				wrapper: 'z-[92]', // Ensure wrapper is also above backdrop
				body: 'z-[93]', // Use body instead of content
			}}
			motionProps={{
				variants: {
					enter: {
						opacity: 1,
						y: 0,
						scale: 1,
						transition: {
							duration: 0.3,
							ease: [0.16, 1, 0.3, 1],
						},
					},
					exit: {
						opacity: 0,
						y: 20,
						scale: 0.95,
						transition: {
							duration: 0.2,
							ease: [0.36, 0, 0.66, -0.56],
						},
					},
				},
			}}
		>
			<ModalContent>
				{/* Progress Bar */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-foreground/5 overflow-hidden rounded-t-3xl">
					<div
						className="h-full bg-primary transition-all duration-300 ease-out"
						style={{ width: `${(currentStep / 3) * 100}%` }}
					/>
				</div>

				{currentStep === 1 && (
					<>
						<ModalHeader className="flex flex-col items-center text-center pt-6">
							<div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-primary/10">
								<Icon icon="heroicons:calculator" className="w-4 h-4 text-primary" />
								<span className="text-sm font-medium text-primary">Project Estimator</span>
							</div>
							<h2 className="fl-text-step-3 sm:fl-text-step-4 font-medium text-foreground mb-3">
								Get an Instant Project Estimate
							</h2>
							<p className="text-sm text-muted-foreground max-w-2xl">
								Select your project requirements to get a ballpark estimate. Final pricing may vary
								based on specific needs and complexity.
							</p>
						</ModalHeader>
						<ModalBody className="px-6 py-6">
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{[
									{
										icon: 'heroicons:clock',
										title: 'Quick & Easy',
										description: 'Get an instant estimate in just a few clicks',
									},
									{
										icon: 'heroicons:calculator',
										title: 'Transparent Pricing',
										description: 'Clear breakdown of costs for each feature',
									},
									{
										icon: 'heroicons:chat-bubble-left-right',
										title: 'Expert Consultation',
										description: 'Follow up with a detailed discussion if needed',
									},
								].map((feature, index) => (
									<div
										key={index}
										className="p-4 rounded-xl bg-foreground/5 hover:bg-foreground/7 transition-colors"
									>
										<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
											<Icon icon={feature.icon} className="w-4 h-4 text-primary" />
										</div>
										<h3 className="text-base font-medium text-foreground mb-1">{feature.title}</h3>
										<p className="text-xs text-muted-foreground">{feature.description}</p>
									</div>
								))}
							</div>
						</ModalBody>
					</>
				)}

				{currentStep === 2 && (
					<>
						<ModalHeader className="flex flex-col items-center text-center pt-6">
							<h2 className="fl-text-step-3 font-medium text-foreground mb-2">
								Select Your Requirements
							</h2>
							<p className="text-sm text-muted-foreground">
								Choose options from each category to build your estimate
							</p>
						</ModalHeader>
						<ModalBody className="px-2 py-4">
							<ScrollShadow hideScrollBar className="max-h-[65vh]">
								<div className="space-y-8 px-4">
									{projectScopes.map((scope) => (
										<div key={scope.category} className="relative">
											<h3 className="text-lg font-medium text-foreground mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
												{scope.category}
											</h3>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-[2px]">
												{scope.options.map((option) => (
													<button
														key={option.id}
														onClick={() => handleOptionSelect(scope.category, option)}
														className={cn(
															'relative p-4 rounded-xl text-left transition-all duration-300 w-full h-full flex group',
															selectedOptions[scope.category]?.id === option.id
																? 'bg-foreground/10 ring-2 ring-primary shadow-lg'
																: 'bg-foreground/5 hover:bg-foreground/7 hover:shadow-md',
														)}
													>
														<div className="flex flex-col w-full">
															<div className="mb-3">
																<h4 className="font-medium text-foreground text-sm leading-tight mb-1">
																	{option.label}
																</h4>
																{showPrices && (
																	<span className="text-sm font-medium text-primary">
																		${option.basePrice.toLocaleString()}
																	</span>
																)}
															</div>
															<p className="text-sm text-muted-foreground">{option.description}</p>
															{showPrices && option.timeEstimate && (
																<div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
																	<span>
																		Estimated: {option.timeEstimate.min}-{option.timeEstimate.max}{' '}
																		days
																	</span>
																</div>
															)}
														</div>
													</button>
												))}
											</div>
										</div>
									))}
								</div>
							</ScrollShadow>
						</ModalBody>
					</>
				)}

				{currentStep === 3 && (
					<>
						<ModalHeader className="flex flex-col items-center text-center pt-8">
							<h2 className="fl-text-step-3 font-medium text-foreground mb-2">
								Your Project Estimate
							</h2>
							<p className="text-sm text-muted-foreground">
								Here's a breakdown of your selected options and estimated timeline
							</p>
						</ModalHeader>
						<ModalBody className="px-8 py-8">
							<div className="space-y-8">
								{/* Selected Options Summary */}
								<div className="space-y-4">
									{Object.entries(selectedOptions).map(([category, option]) => (
										<div
											key={category}
											className="p-6 rounded-xl bg-foreground/5 flex items-start gap-4"
										>
											<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
												<Icon icon={option.icon} className="w-6 h-6 text-primary" />
											</div>
											<div className="flex-1">
												<div className="text-sm text-muted-foreground mb-2">{category}</div>
												<div className="text-lg font-medium text-foreground mb-2">
													{option.label}
												</div>
												{option.timeEstimate && (
													<div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
														<Icon icon="heroicons:clock" className="w-4 h-4" />
														<span className="font-medium">Estimated Time:</span>{' '}
														{option.timeEstimate.min === option.timeEstimate.max
															? `${option.timeEstimate.min} days`
															: `${option.timeEstimate.min}-${option.timeEstimate.max} days`}
														{option.timeEstimate.team > 1 && (
															<>
																<span className="mx-2">·</span>
																<Icon icon="heroicons:users" className="w-4 h-4" />
																<span>Team of {option.timeEstimate.team}</span>
															</>
														)}
													</div>
												)}
											</div>
										</div>
									))}
								</div>

								{/* Total Estimate */}
								<div className="p-8 rounded-2xl bg-foreground/5 border border-primary/20">
									<div className="space-y-6">
										<div>
											<div className="flex items-start justify-between mb-4">
												<div>
													<h3 className="text-xl font-medium text-foreground">Total Investment</h3>
													<p className="text-sm text-muted-foreground mt-2">
														{showPrices
															? 'Starting price based on selected options'
															: 'Enter your email below to view your total investment amount'}
													</p>
												</div>
												{showPrices && (
													<div className="text-3xl font-medium text-foreground">
														${totalEstimate.toLocaleString()}
													</div>
												)}
											</div>
											{!showPrices && (
												<div className="mt-6">
													{showingEmailForm ? (
														<form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
															<div>
																<label
																	htmlFor="email"
																	className="block text-sm font-medium text-foreground"
																>
																	Enter your email to view the estimate
																</label>
																<div className="mt-1">
																	<input
																		type="email"
																		name="email"
																		id="email"
																		value={email}
																		onChange={(e) => setEmail(e.target.value)}
																		className={cn(
																			'block w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm',
																			error ? 'border-red-500' : 'border-foreground/10',
																		)}
																		placeholder="you@example.com"
																		disabled={isSubmitting}
																	/>
																</div>
																{error && <p className="mt-2 text-sm text-red-500">{error}</p>}
															</div>
															<div className="flex justify-end space-x-3">
																<Button
																	type="button"
																	variant="outline"
																	onClick={() => {
																		setShowingEmailForm(false)
																		setError(null)
																	}}
																	disabled={isSubmitting}
																>
																	Cancel
																</Button>
																<Button
																	type="submit"
																	disabled={isSubmitting || !email}
																	className="relative"
																>
																	{isSubmitting ? (
																		<>
																			<Icon
																				icon="heroicons:arrow-path"
																				className="w-5 h-5 animate-spin mr-2"
																			/>
																			Saving...
																		</>
																	) : (
																		'View Estimate'
																	)}
																</Button>
															</div>
														</form>
													) : (
														<Button onClick={() => setShowingEmailForm(true)}>
															View Total Investment
														</Button>
													)}
												</div>
											)}
										</div>
										{totalTimeEstimate.min > 0 && (
											<div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-foreground/10">
												<div>
													<h3 className="text-xl font-medium text-foreground">
														Estimated Timeline
													</h3>
													<p className="text-sm text-muted-foreground mt-2">
														Expected project duration
													</p>
												</div>
												<div className="mt-4 sm:mt-0 text-right">
													<div className="text-3xl font-medium text-foreground">
														{totalTimeEstimate.min === totalTimeEstimate.max
															? `${totalTimeEstimate.min} days`
															: `${totalTimeEstimate.min}-${totalTimeEstimate.max} days`}
													</div>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Timeline Visualization */}
								<div className="space-y-6">
									<h4 className="text-xl font-medium text-foreground">Project Timeline</h4>
									<div className="space-y-6">
										{Object.values(selectedOptions).map((option) => {
											if (!option.phases?.length) return null
											const totalWidth = option.phases.reduce(
												(sum, phase) => sum + phase.percentage,
												0,
											)

											return (
												<div key={option.id} className="space-y-3">
													<div className="flex items-center justify-between">
														<div className="text-base font-medium text-foreground">
															{option.label}
														</div>
														{option.timeEstimate && (
															<div className="text-sm text-muted-foreground">
																{option.timeEstimate.min === option.timeEstimate.max
																	? `${option.timeEstimate.min} days`
																	: `${option.timeEstimate.min}-${option.timeEstimate.max} days`}
															</div>
														)}
													</div>
													<div className="relative flex h-12 rounded-xl overflow-hidden bg-foreground/5">
														{option.phases.map((phase, phaseIndex) => {
															const width = (phase.percentage / totalWidth) * 100
															return (
																<div
																	key={phase.name}
																	className="group relative flex items-center justify-center"
																	style={{ width: `${width}%` }}
																>
																	<div
																		className={cn(
																			'absolute inset-0 transition-colors',
																			phaseIndex % 2 === 0 ? 'bg-primary/20' : 'bg-primary/30',
																		)}
																	/>
																	<div className="relative z-10 px-3 py-2">
																		<div className="text-xs font-medium text-foreground truncate">
																			{phase.name}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{phase.percentage}%
																		</div>
																	</div>
																	{phase.description && (
																		<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-foreground text-background text-xs opacity-0 group-hover:opacity-100 transition-opacity">
																			{phase.description}
																		</div>
																	)}
																</div>
															)
														})}
													</div>
												</div>
											)
										})}
									</div>
								</div>

								{/* Update the date display section */}
								<div className="mt-6 space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Estimated Start Date</span>
										<span className="font-medium">{projectTimeline.formattedStartDate}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Estimated Completion</span>
										<span className="font-medium">{projectTimeline.formattedEndDate}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Total Working Days</span>
										<span className="font-medium">{projectTimeline.totalDays} days</span>
									</div>
								</div>

								{/* Next Steps */}
								<div className="text-center space-y-4 pt-8 mt-8 border-t border-foreground/10">
									<p className="text-sm text-muted-foreground">
										Ready to move forward? Schedule a consultation to discuss your project in
										detail.
									</p>
									<Button
										size="large"
										variant="primary"
										onClick={() => {
											router.push(generateEstimateURL())
											onClose()
										}}
										className="group fl-mt-m relative overflow-hidden bg-foreground text-background hover:bg-foreground/90"
									>
										<span className="relative z-10 flex items-center">
											Schedule Consultation
											<Icon
												icon="heroicons:calendar"
												className="ml-2 w-5 h-5 transition-transform group-hover:scale-110"
											/>
										</span>
										<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</Button>
								</div>
							</div>
						</ModalBody>
					</>
				)}

				<ModalFooter className="flex justify-between px-6 py-4">
					{currentStep > 1 && !showingEmailForm ? (
						<Button
							variant="ghost"
							onClick={handleBack}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
						>
							<Icon icon="heroicons:arrow-left" className="w-5 h-5" />
							Back
						</Button>
					) : (
						<div></div>
					)}
					{currentStep < 3 && !showingEmailForm && (
						<Button
							variant="primary"
							onClick={handleNext}
							className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90"
							disabled={
								currentStep === 2 && Object.keys(selectedOptions).length < projectScopes.length
							}
						>
							<span className="relative z-10 flex items-center">
								{currentStep === 1 ? 'Get Started' : 'Continue to Estimate'}
								<Icon
									icon="heroicons:arrow-right"
									className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
								/>
							</span>
							<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

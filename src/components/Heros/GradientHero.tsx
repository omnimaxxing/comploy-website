import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'

type HeroData = {
	tagIcon: string
	tagText: string
	title: string
	gradientWord: string
	subtitle?: string | null
	gradientFromColor: string
	gradientToColor: string
}

interface GradientHeroProps {
	hero?: HeroData
	tagIcon?: string
	tagText?: string
	title?: string
	gradientWord?: string
	subtitle?: string
	gradientFromColor?: string
	gradientToColor?: string
}

export const GradientHero = ({
	hero,
	tagIcon = 'heroicons:sparkles',
	tagText = '',
	title = '',
	gradientWord = '',
	subtitle = '',
	gradientFromColor = 'blue-500',
	gradientToColor = 'cyan-500',
}: GradientHeroProps) => {
	// If hero object exists, use its values, otherwise fall back to individual props
	const finalTagIcon = hero?.tagIcon || tagIcon
	const finalTagText = hero?.tagText || tagText
	const finalTitle = hero?.title || title
	const finalGradientWord = hero?.gradientWord || gradientWord
	const finalSubtitle = hero?.subtitle || subtitle

	// Clean up color values to ensure they don't already have the 'from-' or 'to-' prefix
	let fromColor = hero?.gradientFromColor || gradientFromColor
	let toColor = hero?.gradientToColor || gradientToColor

	// Remove 'from-' prefix if it exists
	if (fromColor.startsWith('from-')) {
		fromColor = fromColor.substring(5)
	}

	// Remove 'to-' prefix if it exists
	if (toColor.startsWith('to-')) {
		toColor = toColor.substring(3)
	}

	// Debug logging
	console.log('GradientHero - Gradient Word:', finalGradientWord)
	console.log('GradientHero - From Color:', fromColor)
	console.log('GradientHero - To Color:', toColor)

	// Get fallback colors based on the color name
	const getFallbackColor = (colorName: string) => {
		// Extract the color family and shade
		const [family, shade] = colorName.split('-')

		// Common fallback colors for different families
		const fallbacks: Record<string, string> = {
			orange: '#f97316', // orange-500
			amber: '#f59e0b', // amber-500
			blue: '#3b82f6', // blue-500
			cyan: '#06b6d4', // cyan-500
			purple: '#a855f7', // purple-500
			red: '#ef4444', // red-500
			green: '#22c55e', // green-500
			rose: '#f43f5e', // rose-500
			lime: '#84cc16', // lime-500
			pink: '#ec4899', // pink-500
			indigo: '#6366f1', // indigo-500
			violet: '#8b5cf6', // violet-500
			yellow: '#eab308', // yellow-500
			teal: '#14b8a6', // teal-500
		}

		return fallbacks[family] || '#3b82f6' // Default to blue if not found
	}

	const fromFallback = getFallbackColor(fromColor)
	const toFallback = getFallbackColor(toColor)

	// Determine if we should use common Tailwind colors or fallback to inline styles
	// This list contains common color families that are likely included in the Tailwind config
	const commonColorFamilies = [
		'slate',
		'gray',
		'zinc',
		'neutral',
		'stone',
		'red',
		'orange',
		'amber',
		'yellow',
		'lime',
		'green',
		'emerald',
		'teal',
		'cyan',
		'sky',
		'blue',
		'indigo',
		'violet',
		'purple',
		'fuchsia',
		'pink',
		'rose',
	]

	const fromFamily = fromColor.split('-')[0]
	const toFamily = toColor.split('-')[0]

	const usesTailwindColors =
		commonColorFamilies.includes(fromFamily) && commonColorFamilies.includes(toFamily)

	return (
		<section className="relative overflow-hidden py-12">
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
			<div className="u-container relative">
				<div className="text-center">
					<div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10">
						<Icon icon={finalTagIcon} className="w-5 h-5 text-primary" />
						<span className="text-sm font-medium text-primary">{finalTagText}</span>
					</div>
					<h1 className="fl-text-step-5 md:fl-text-step-7 font-medium tracking-tight text-foreground mb-6">
						{finalTitle}
						<br />
						{usesTailwindColors ? (
							// Use Tailwind classes for common colors
							<span
								className={cn(
									'bg-gradient-to-r bg-clip-text text-transparent',
									`from-${fromColor}`,
									`to-${toColor}`,
								)}
							>
								{finalGradientWord || '[Gradient Word Missing]'}
							</span>
						) : (
							// Fallback to inline styles for custom or uncommon colors
							<span
								style={{
									background: `linear-gradient(to right, ${fromFallback}, ${toFallback})`,
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									color: 'transparent',
									padding: '0 4px',
									display: 'inline-block',
								}}
							>
								{finalGradientWord || '[Gradient Word Missing]'}
							</span>
						)}
					</h1>
					<p className="fl-text-step-1 text-muted-foreground max-w-3xl mx-auto">{finalSubtitle}</p>
				</div>
			</div>
		</section>
	)
}

export default GradientHero

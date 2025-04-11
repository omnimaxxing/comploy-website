import { useEffect, useRef } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export function AnimatedLogo() {
	const lottieRef = useRef<any>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// Preload the animation file
		const preloadLink = document.createElement('link')
		preloadLink.rel = 'preload'
		preloadLink.href = '/anim/logo-animation.json'
		preloadLink.as = 'fetch'
		preloadLink.type = 'application/json'
		document.head.appendChild(preloadLink)

		// Set up animation completion handler
		const handleAnimationComplete = () => {
			if (containerRef.current) {
				// Add a CSS class for fade-out animation instead of using JS
				containerRef.current.classList.add('animation-complete')

				// Dispatch event after CSS transition completes
				setTimeout(() => {
					window.dispatchEvent(new CustomEvent('lottieComplete'))
					window.dispatchEvent(new CustomEvent('loadingComplete'))
				}, 500) // Match the CSS transition duration
			}
		}

		// Connect to the lottie instance when it's ready
		const connectToLottie = () => {
			if (lottieRef.current) {
				const lottieInstance = lottieRef.current.getDotLottieInstance()

				if (lottieInstance) {
					// Listen for animation complete
					lottieInstance.addEventListener('complete', handleAnimationComplete)

					// Ensure cleanup
					return () => {
						lottieInstance.removeEventListener('complete', handleAnimationComplete)
					}
				}
			}

			// If we couldn't connect, set a fallback timer
			const fallbackTimer = setTimeout(() => {
				handleAnimationComplete()
			}, 2500) // Reasonable fallback time

			return () => clearTimeout(fallbackTimer)
		}

		// Try to connect immediately, and also after a short delay as backup
		const cleanup = connectToLottie()
		const backupTimer = setTimeout(connectToLottie, 500)

		return () => {
			cleanup()
			clearTimeout(backupTimer)
			document.head.removeChild(preloadLink)
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className="w-32 h-32 relative transition-opacity duration-500"
			style={{
				willChange: 'opacity, transform',
			}}
		>
			{/* Add a simple CSS spinner as fallback while Lottie loads */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
			</div>

			<DotLottieReact
				ref={lottieRef}
				src="/anim/logo-animation.json"
				autoplay
				loop={false}
				speed={1}
				className="w-full h-full"
				style={{
					opacity: 1,
					position: 'relative',
					zIndex: 1,
				}}
			/>
		</div>
	)
}

// Add this to your global CSS or as a style tag in your layout
export const AnimatedLogoStyles = `
.animation-complete {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
`

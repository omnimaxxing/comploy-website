'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
	const lenisRef = useRef<Lenis | null>(null)
	const pathname = usePathname()
	const hasMounted = useRef(false)

	useEffect(() => {
		// Ensure body is scrollable
		document.body.style.overflow = 'auto'
		document.documentElement.style.overflow = 'auto'

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			gestureOrientation: 'vertical',
			lerp: 0.1,
			orientation: 'vertical',
			wheelMultiplier: 1,
			smoothWheel: true,
			// Don't use syncTouch
			syncTouch: false,
			touchMultiplier: 1,
			infinite: false,
		})

		lenisRef.current = lenis

		function raf(time: number) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		hasMounted.current = true

		return () => {
			lenis.destroy()
		}
	}, [])

	// Only reset the scroll position on route changes, not on initial load
	useEffect(() => {
		if (lenisRef.current && hasMounted.current) {
			lenisRef.current.scrollTo(0, { immediate: true })
		}
	}, [pathname])

	return <>{children}</>
}

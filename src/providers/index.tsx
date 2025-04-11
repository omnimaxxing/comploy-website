// components/Providers.tsx
'use client'
import { HeroUIProvider } from '@heroui/react'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthProvider } from './Auth'
import dynamic from 'next/dynamic'

const ClarityProvider = dynamic(() => import('@/components/analytics/ClarityProvider'), {
	ssr: false,
})

// Create a theme context
export type ThemeType = 'light' | 'dark' | 'meertrak' | 'imgin'

interface ThemeContextType {
	theme: ThemeType
	setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
	theme: 'light',
	setTheme: () => {},
})

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext)

// Theme provider component
export const ThemeProvider: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	// Initialize with light theme, but check localStorage if available
	const [theme, setTheme] = useState<ThemeType>('light')

	// Effect to initialize theme from localStorage if available
	useEffect(() => {
		const savedTheme = localStorage.getItem('omnipixel-theme') as ThemeType
		if (savedTheme && ['light', 'dark', 'meertrak', 'imgin'].includes(savedTheme)) {
			setTheme(savedTheme)
		}
	}, [])

	// Effect to update document class and localStorage when theme changes
	useEffect(() => {
		// Remove all theme classes
		document.documentElement.classList.remove('light', 'dark', 'meertrak', 'imgin')
		// Add the current theme class
		document.documentElement.classList.add(theme)
		// Save to localStorage
		localStorage.setItem('omnipixel-theme', theme)
	}, [theme])

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const Providers: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	return (
		<HeroUIProvider>
			<ThemeProvider>
				<AuthProvider>
					<ClarityProvider />
					{children}
				</AuthProvider>
			</ThemeProvider>
		</HeroUIProvider>
	)
}

'use client'

import type { User } from '@/payload-types'
import { setCookie } from 'cookies-next'
import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react'

type AuthStatus = 'loggedIn' | 'loggedOut' | 'unknown'

type AuthContext = {
	user?: User | null
	create: (args: {
		firstName: string
		lastName: string
		email: string
		password: string
		phone?: string
	}) => Promise<void>
	login: (args: { email: string; password: string }) => Promise<void>
	logout: () => Promise<void>
	forgotPassword: (args: { email: string }) => Promise<void>
	resetPassword: (args: {
		password: string
		passwordConfirm: string
		token: string
	}) => Promise<void>
	refresh: () => Promise<void>
	status: AuthStatus
	setStatus: (status: AuthStatus) => void
	setUser: (user: User | null) => void
	isAuthenticated: () => boolean
	googleAuth: () => Promise<void>
	appleAuth: () => Promise<void>
}
type Logout = () => Promise<void>

const Context = createContext({} as AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>()
	const [status, setStatus] = useState<AuthStatus>('unknown')
	const hasInitialized = useRef(false)

	// Initialize auth state
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				})

				if (res.ok) {
					const { user: currentUser } = await res.json()
					setUser(currentUser || null)
					setStatus(currentUser ? 'loggedIn' : 'loggedOut')
				} else {
					setUser(null)
					setStatus('loggedOut')
				}
			} catch (error) {
				console.error('Error checking auth status:', error)
				setUser(null)
				setStatus('loggedOut')
			}
		}

		void checkAuthStatus()
	}, [])

	// Sync cart when auth status changes
	useEffect(() => {
		// Skip if we've already initialized
		if (hasInitialized.current) return

		const syncCart = async () => {
			if (status === 'unknown') return

			hasInitialized.current = true

			if (status === 'loggedOut') {
				// For logged out users, reset cart sync state in one update
			} else if (user?.id && status === 'loggedIn') {
				// For logged in users, sync with server
				try {
				} catch (error) {
					console.error('Failed to sync cart:', error)
					// If sync fails, still mark as initialized
				}
			}
		}

		void syncCart()
	}, [status, user?.id]) // Remove cart from dependencies

	const create = useCallback(
		async (args: {
			firstName: string
			lastName: string
			email: string
			password: string
			phone?: string
		}) => {
			try {
				// Password validation
				const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
				if (!passwordRegex.test(args.password)) {
					throw new Error(
						'Password must be at least 8 characters and include uppercase, lowercase, and number',
					)
				}

				// Field validation
				if (!args.firstName || !args.lastName || !args.email || !args.password) {
					throw new Error('All required fields must be provided')
				}

				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
					body: JSON.stringify({
						firstName: args.firstName,
						lastName: args.lastName,
						name: `${args.firstName} ${args.lastName}`,
						email: args.email,
						password: args.password,
						phone: args.phone || undefined,
						roles: ['user'],
						origin: 'omnipixel',
					}),
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
				})

				const data = await res.json()

				// Check if the response status is in the success range (200-299)
				if (res.status >= 200 && res.status < 300) {
					if (data.errors) {
						if (data.errors[0].message.includes('email')) {
							throw new Error('This email is already registered')
						}
						throw new Error(data.errors[0].message)
					}

					// Ensure we have a valid user object and token
					if (!data?.user && !data?.doc) {
						throw new Error('No user data received')
					}

					// Handle both possible response formats
					const userData = data.user || data.doc

					setUser(userData)
					setStatus('loggedIn')

					// Set hasAccount cookie on successful account creation
					setCookie('hasAccount', 'true', {
						maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
						path: '/',
					})

					// Ensure payload-token is set
					if (data.token) {
						setCookie('payload-token', data.token, {
							path: '/',
							httpOnly: false, // Need this for client-side access
						})
					}

					// Wait a moment for auth to be set up before syncing cart
					await new Promise((resolve) => setTimeout(resolve, 500))

					// Sync cart with server after successful registration
					if (userData.id) {
						try {
						} catch (error) {
							console.warn('Initial cart sync failed, will retry later:', error)
						}
					}

					// Return to indicate success
					return
				}

				// Handle specific error cases
				if (res.status === 409 || (data.errors && data.errors[0].message.includes('email'))) {
					throw new Error('This email is already registered')
				}

				// If we get here, something went wrong
				throw new Error('Failed to create account')
			} catch (e: any) {
				if (e.name === 'ValidationError') {
					if (e.message.includes('email')) {
						throw new Error('This email is already registered')
					}
					throw new Error(e.message)
				}

				// Re-throw the error with the specific message if we created it
				if (
					e.message.includes('Password must be') ||
					e.message.includes('email is already registered') ||
					e.message.includes('All required fields')
				) {
					throw e
				}

				// Check for email-related errors in the error message
				if (
					e.message.toLowerCase().includes('email') &&
					e.message.toLowerCase().includes('invalid')
				) {
					throw new Error('This email is already registered')
				}

				// Generic error for unexpected issues
				throw new Error('An unexpected error occurred while creating your account.')
			}
		},
		[],
	)

	const login = useCallback(async (args: { email: string; password: string }) => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
				body: JSON.stringify({
					email: args.email,
					password: args.password,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			})

			const data = await res.json()

			if (res.ok) {
				if (data.errors) {
					throw new Error(data.errors[0].message)
				}

				if (!data.user || !data.token) {
					throw new Error('No user data or token received')
				}

				// Set user state
				setUser(data.user)
				setStatus('loggedIn')

				// Set hasAccount cookie
				setCookie('hasAccount', 'true', {
					maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
					path: '/',
				})

				// Ensure payload-token is set
				if (data.token) {
					setCookie('payload-token', data.token, {
						path: '/',
						httpOnly: false, // Need this for client-side access
					})
				}

				// Sync cart with server after successful login
				if (data.user.id) {
					try {
					} catch (error) {
						console.error('Failed to sync cart after login:', error)
					}
				}
			} else {
				throw new Error('Invalid email or password')
			}
		} catch (e: any) {
			if (e.message.includes('email or password')) {
				throw e
			}
			throw new Error('Invalid email or password')
		}
	}, [])

	const logout = useCallback<Logout>(async () => {
		try {
			// First update local state
			setUser(null)
			setStatus('loggedOut')

			// Ensure cart is synced one last time before logout
			if (user?.id) {
				try {
				} catch (error) {
					console.warn('Failed to sync cart before logout:', error)
				}
			}

			// Then attempt server logout
			try {
				await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
				})
			} catch (error) {
				console.warn('Server logout failed, but local state is cleared:', error)
			}
		} catch (e) {
			console.warn('Logout error, but local state is cleared:', e)
			// Even if server logout fails, we want to clear local state
			setUser(null)
			setStatus('loggedOut')
		}
	}, [user?.id])

	const forgotPassword = useCallback(async (args: { email: string }) => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`, {
				body: JSON.stringify({
					email: args.email,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			})

			if (res.ok) {
				const { data, errors } = await res.json()
				if (errors) throw new Error(errors[0].message)
				setUser(data?.loginUser?.user)
			} else {
				throw new Error('Invalid login')
			}
		} catch (e) {
			throw new Error('An error occurred while attempting to login.')
		}
	}, [])

	const resetPassword = useCallback(
		async (args: { password: string; passwordConfirm: string; token: string }) => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/reset-password`, {
					body: JSON.stringify({
						password: args.password,
						passwordConfirm: args.passwordConfirm,
						token: args.token,
					}),
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
				})

				if (res.ok) {
					const { data, errors } = await res.json()
					if (errors) throw new Error(errors[0].message)
					setUser(data?.loginUser?.user)
					setStatus(data?.loginUser?.user ? 'loggedIn' : 'loggedOut')
				} else {
					throw new Error('Invalid login')
				}
			} catch (e) {
				throw new Error('An error occurred while attempting to login.')
			}
		},
		[],
	)

	const refresh = useCallback(async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			const { user: loggedInUser } = await res.json()

			if (res.ok) {
				setUser(loggedInUser)
				setStatus('loggedIn')

				// Sync cart with server after successful refresh
				if (loggedInUser?.id) {
				}
			} else {
				setUser(null)
				setStatus('loggedOut')
			}
		} catch (e) {
			console.error(e)
			setUser(null)
			setStatus('loggedOut')
		}
	}, [])

	const googleAuth = useCallback(async () => {
		try {
			window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/oauth/google`
		} catch (err: any) {
			throw new Error('Failed to authenticate with Google')
		}
	}, [])

	const appleAuth = useCallback(async () => {
		try {
			window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/oauth/apple`
		} catch (err: any) {
			throw new Error('Failed to authenticate with Apple')
		}
	}, [])

	const isAuthenticated = () => {
		return !!user && status === 'loggedIn'
	}

	return (
		<Context.Provider
			value={{
				user,
				status,
				create,
				login,
				logout,
				forgotPassword,
				resetPassword,
				refresh,
				setStatus,
				setUser,
				isAuthenticated,
				googleAuth,
				appleAuth,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export const useAuth = () => useContext(Context)

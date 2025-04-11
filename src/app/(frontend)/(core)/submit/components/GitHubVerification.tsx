'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'

import { Icon } from '@iconify/react'
import { toast } from '@/components/ui/use-toast'
import { signInWithGitHub } from './github-actions'
import { getAuthSession } from '../actions'

interface GitHubVerificationProps {
	githubUrl: string
	onVerificationChange: (isVerified: boolean, verificationData?: any) => void
	formData?: any
	compact?: boolean
}

export default function GitHubVerification({
	githubUrl,
	onVerificationChange,
	formData,
	compact = false,
}: GitHubVerificationProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [session, setSession] = useState<any>(null)
	const [sessionChecked, setSessionChecked] = useState(false)

	// Check for existing session on component mount and after auth redirects
	useEffect(() => {
		const checkSession = async () => {
			try {
				setIsLoading(true)
				// Use the server action to get the session
				const result = await getAuthSession()
				
				if (result.success && result.session) {
					setSession(result.session)
					
					// If user is already authenticated with GitHub, trigger verification change
					if (result.session.user) {
						const githubUser = result.session.user
						
						// Call the parent component's verification handler
						onVerificationChange(true, {
							userId: githubUser.id,
							username: githubUser.username || extractGitHubUsername(githubUser.email, githubUser.name),
							displayName: githubUser.name,
							verified: true,
							method: 'owner',
							accessToken: result.session.accessToken || ''
						})
						
						// Show success toast
						toast({
							title: 'GitHub Account Connected',
							description: `Successfully authenticated as ${githubUser.name}`,
							variant: 'default',
						})
						
						// Force router refresh to ensure UI updates
						router.refresh()
					}
				} else if (!result.success) {
					console.error('Error checking session:', result.error)
					toast({
						title: 'Authentication Error',
						description: 'Failed to authenticate with GitHub. Please try again.',
						variant: 'destructive',
					})
				}
				
				setSessionChecked(true)
			} catch (error) {
				console.error('Error checking session:', error)
				setSessionChecked(true)
				toast({
					title: 'Authentication Error',
					description: 'Failed to authenticate with GitHub. Please try again.',
					variant: 'destructive',
				})
			} finally {
				setIsLoading(false)
			}
		}
		
		checkSession()
		
		// Also listen for URL changes (after redirect)
		const handleRouteChange = () => {
			checkSession()
		}
		
		window.addEventListener('popstate', handleRouteChange)
		
		return () => {
			window.removeEventListener('popstate', handleRouteChange)
		}
	}, [onVerificationChange, router])

	// Handle GitHub sign-in
	const handleSignIn = async () => {
		try {
			setIsLoading(true)
			// The actual sign-in happens in the form action
		} catch (error) {
			console.error('Error signing in with GitHub:', error)
			toast({
				title: 'Authentication Error',
				description: 'Failed to authenticate with GitHub. Please try again.',
				variant: 'destructive',
			})
			setIsLoading(false)
		}
	}

	// Compact verification button for initial screen
	if (compact) {
		return (
			<div className={compact ? '' : 'mb-6'}>
				{!session?.user ? (
					<form action={signInWithGitHub} onSubmit={handleSignIn}>
						<Button
							color="default"
							type="submit"
							startContent={<Icon icon="mdi:github" />}
							isLoading={isLoading}
							className="min-w-[150px] bg-foreground text-background hover:bg-foreground/90 transition-colors"
							size="lg"
							radius="none"
						>
							Connect with GitHub
						</Button>
					</form>
				) : (
					<div className="flex items-center gap-3 p-3 border border-green-500/30 bg-green-900/20 rounded-none">
						<Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500" />
						<div className="flex-1">
							<p className="text-sm font-medium">Verified as {session.user.name}</p>
							<p className="text-xs text-foreground/70">
								You can now submit plugins as a verified GitHub user
							</p>
						</div>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="mt-4">
			{session?.user ? (
				<div className="flex items-center p-6 bg-foreground/10 backdrop-blur-sm border border-foreground/20 rounded-lg shadow-sm transition-all">
					<div className="flex-shrink-0 mr-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 border border-foreground/30">
							<svg
								className="h-6 w-6 text-foreground"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>
					<div>
						<p className="text-md font-medium text-foreground">GitHub Account Connected</p>
						<div className="mt-1 text-sm text-foreground/70 flex items-center">
							<Icon icon="mdi:github" className="mr-2" />
							Verified as GitHub user
							<span className="inline-flex items-center px-2.5 py-0.5 ml-2 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
								{session.user.name}
							</span>
						</div>
					</div>
				</div>
			) : (
				<div className="p-6 bg-foreground/5 backdrop-blur-sm border border-foreground/20 rounded-lg shadow-sm transition-all">
					<div className="flex items-center">
						<div className="flex-shrink-0 mr-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 border border-foreground/30">
								<Icon icon="mdi:github" className="h-6 w-6 text-foreground" />
							</div>
						</div>
						<div>
							<p className="text-md font-medium text-foreground">GitHub Authentication</p>
							<p className="mt-1 text-sm text-foreground/70">
								Connect your GitHub account to verify ownership of repositories.
							</p>
						</div>
					</div>
					<div className="mt-5">
						<form action={signInWithGitHub} onSubmit={handleSignIn}>
							<Button
								type="submit"
								color="default"
								variant="flat"
								isLoading={isLoading}
								startContent={<Icon icon="mdi:github" />}
								className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors py-6"
								size="lg"
								radius="none"
							>
								Connect with GitHub
							</Button>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

function extractGitHubUsername(email?: string | null, name?: string | null): string {
	// Extract GitHub username from email if available
	if (email && email.includes('@users.noreply.github.com')) {
		return email.split('@')[0];
	}
	
	// If email doesn't contain GitHub domain or is not available, use name as fallback
	return name || 'GitHub User';
}

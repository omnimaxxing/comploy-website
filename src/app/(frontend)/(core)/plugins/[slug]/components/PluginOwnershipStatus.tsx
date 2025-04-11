'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { checkGitHubOwnership } from '../actions'
import { getAuthSession } from '../../../submit/actions'
interface PluginOwnershipStatusProps {
	slug: string
	isVerified: boolean
	githubUrl: string
}

export function PluginOwnershipStatus({ slug, isVerified, githubUrl }: PluginOwnershipStatusProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [isOwner, setIsOwner] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		const checkOwnership = async () => {
			try {
				setIsLoading(true)

				// First check if the user is authenticated
				const authResult = await getAuthSession()
				const isUserAuthenticated = authResult.success && !!authResult.session?.accessToken
				setIsAuthenticated(isUserAuthenticated)

				if (isUserAuthenticated) {
					// If authenticated, check if they have ownership
					const ownershipResult = await checkGitHubOwnership(slug)
					setIsOwner(ownershipResult.success && ownershipResult.isOwner)
				}
			} catch (error) {
				console.error('Error checking ownership status:', error)
			} finally {
				setIsLoading(false)
			}
		}

		checkOwnership()
	}, [slug])

	// Handle claim ownership
	const handleClaimOwnership = async () => {
		if (isAuthenticated) {
			// User is already authenticated, check if they have access to the repo
			setIsLoading(true)
			try {
				const result = await checkGitHubOwnership(slug)

				if (result.success && result.isOwner) {
					toast.success('You now have ownership of this plugin!')
					setIsOwner(true)
					// Refresh the page to update the UI
					router.refresh()
				} else {
					toast.error(result.message || 'You do not have access to this repository')
				}
			} catch (error) {
				console.error('Error claiming ownership:', error)
				toast.error('Failed to verify repository ownership')
			} finally {
				setIsLoading(false)
			}
		} else {
			// User needs to authenticate first
			router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/plugins/${slug}`)}`)
		}
	}

	if (isLoading) {
		return null // Don't show anything while loading
	}

	if (isOwner) {
		return (
			<div className="flex flex-wrap gap-4 mt-4">
				<Button
					color="primary"
					as={Link}
					href={`/plugins/${slug}/edit`}
					startContent={<Icon icon="heroicons:pencil-square" className="w-5 h-5" />}
				>
					Edit Plugin
				</Button>
			</div>
		)
	}

	if (!isVerified) {
		return (
			<div className="mt-4">
				<Button
					color="secondary"
					onPress={handleClaimOwnership}
					startContent={<Icon icon="heroicons:identification" className="w-5 h-5" />}
					isLoading={isLoading}
				>
					{isAuthenticated ? 'Verify Ownership' : 'Sign in to Claim Ownership'}
				</Button>
			</div>
		)
	}

	return null
}

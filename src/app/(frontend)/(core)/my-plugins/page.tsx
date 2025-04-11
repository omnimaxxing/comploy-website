import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { auth } from '@/auth'
import { MyPluginsClient } from './components/MyPluginsClient'
import type { Plugin } from '@/payload-types'

export default async function MyPluginsPage() {
	// Get the user session
	const session = await auth()

	// If not authenticated, redirect to home
	if (!session || !session.user) {
		redirect('/')
	}

	// Get the GitHub username from the session
	const username = session.user.username
	if (!username) {
		// If no username, show the client component with an error
		return (
			<MyPluginsClient
				session={session}
				verifiedPlugins={[]}
				unclaimedPlugins={[]}
				error="GitHub username not found in session"
			/>
		)
	}

	try {
		// Initialize Payload
		const payload = await getPayload({ config: configPromise })
		
		// 1. Query plugins that are verified by this user
		let verifiedPlugins: Plugin[] = []
		try {
			const verifiedPluginsData = await payload.find({
				collection: 'plugins',
				where: {
					'verification.isVerified': {
						equals: true,
					},
					'verification.githubVerification.username': {
						equals: username,
					},
				},
				limit: 100,
			})
			verifiedPlugins = verifiedPluginsData.docs as Plugin[]
		} catch (verifiedError) {
			console.error('Error fetching verified plugins:', verifiedError)
			// Fall back to filtering all plugins
			const allPluginsData = await payload.find({
				collection: 'plugins',
				where: {
					_status: {
						equals: 'published',
					},
				},
				limit: 100,
			})
			
			verifiedPlugins = allPluginsData.docs.filter((plugin: any) => {
				const verificationData = plugin.verification || {}
				const githubData = verificationData.githubVerification || {}
				return verificationData.isVerified && githubData.username === username
			}) as Plugin[]
		}
		
		// 2. Query plugins that have GitHub repos owned by this user but are not verified
		let unclaimedPlugins: Plugin[] = []
		try {
			// Find plugins with GitHub URLs that might belong to this user
			const allPluginsData = await payload.find({
				collection: 'plugins',
				where: {
					_status: {
						equals: 'published',
					},
				},
				limit: 200,
			})
			
			// Filter plugins that have GitHub URLs containing the user's username
			// but are not verified by this user
			unclaimedPlugins = allPluginsData.docs.filter((plugin: any) => {
				// Skip plugins that are already verified by this user
				const verificationData = plugin.verification || {}
				const githubData = verificationData.githubVerification || {}
				if (verificationData.isVerified && githubData.username === username) {
					return false
				}
				
				// Check if the GitHub URL contains the user's username
				const githubUrl = plugin.githubUrl || ''
				const urlLower = githubUrl.toLowerCase()
				const usernameLower = username.toLowerCase()
				
				// Look for patterns like github.com/username/ or github.com/username-org/
				return urlLower.includes(`github.com/${usernameLower}/`) || 
					   urlLower.includes(`github.com/${usernameLower}-`) ||
					   urlLower.includes(`github.com/${usernameLower}_`)
			}) as Plugin[]
		} catch (unclaimedError) {
			console.error('Error processing unclaimed plugins:', unclaimedError)
			// If there's an error, just use an empty array
			unclaimedPlugins = []
		}

		// Pass both sets of data to the client component
		return (
			<MyPluginsClient 
				session={session} 
				verifiedPlugins={verifiedPlugins} 
				unclaimedPlugins={unclaimedPlugins}
				error={null} 
			/>
		)
	} catch (error: any) {
		console.error('Error fetching plugins:', error)
		
		return (
			<MyPluginsClient
				session={session}
				verifiedPlugins={[]}
				unclaimedPlugins={[]}
				error="Failed to load your plugins. Please try again later."
			/>
		)
	}
}

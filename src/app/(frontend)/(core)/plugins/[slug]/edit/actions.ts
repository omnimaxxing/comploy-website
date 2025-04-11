'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import type { Plugin } from '@/payload-types'

// Extend the Plugin type with GitHub specific fields
interface PluginWithGitHubData extends Omit<Plugin, 'verification'> {
  stars?: number;
  forks?: number;
  images?: Array<{ id: string; url: string; alt?: string }>;
  verification?: {
    isVerified?: boolean | null;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    githubVerification?: {
      userId?: string | null;
      username?: string | null;
      method?: 'owner' | 'contributor' | 'manual' | null;
    };
  };
  githubData?: {
    stars?: number;
    forks?: number;
    lastUpdated?: string;
  };
}

// Define the types for installation commands and images
interface InstallCommand {
	packageManager: string
	customLabel?: string | null
	command: string
	id?: string | null
}

interface PluginImage {
	id: number
	url: string
	alt?: string
}

// Fetch a plugin for editing
export async function getPluginForEdit(slug: string) {
	// Check authentication and ownership directly
	const session = await auth()
	
	if (!session || !session.user) {
		throw new Error('You must be logged in to edit a plugin')
	}
	
	const payload = await getPayload({ config: configPromise })
	
	try {
		// Get the plugin data
		const plugin = await payload.find({
			collection: 'plugins',
			where: {
				slug: {
					equals: slug,
				},
			},
			depth: 2, // Need depth for related links and other nested data
		})
		
		if (plugin.docs.length === 0) {
			throw new Error('Plugin not found')
		}
		
		const pluginData = plugin.docs[0] as PluginWithGitHubData
		
		// Check if user is owner based on verification data
		let isOwner = false
		
		// Check if the verification data exists and matches the current user
		if (pluginData.verification && pluginData.verification.githubVerification) {
			// Get the GitHub username from the session
			const githubUsername = session.user.username
			
			// Check if usernames match (either as direct username or verified by field)
			isOwner = (
				// Check if the username matches the verified username
				(pluginData.verification.githubVerification.username === githubUsername) ||
				// Or check if the username matches the verifiedBy field
				(pluginData.verification.verifiedBy === githubUsername)
			)
		}
		
		if (!isOwner) {
			throw new Error('You do not have permission to edit this plugin')
		}

		// Extract the rich text fullDescription as plain text
		let fullDescription = ''

		if (
			pluginData.fullDescription &&
			typeof pluginData.fullDescription === 'object' &&
			pluginData.fullDescription.root &&
			Array.isArray(pluginData.fullDescription.root.children)
		) {
			fullDescription = pluginData.fullDescription.root.children
				.map((paragraph) => {
					if (paragraph.children && Array.isArray(paragraph.children)) {
						return paragraph.children
							.filter((node) => node.type === 'text')
							.map((node) => node.text)
							.join('')
					}
					return ''
				})
				.filter((text) => text.trim().length > 0)
				.join('\n\n')
		}

		// Extract installation commands
		let installCommands: InstallCommand[] = []
		if (pluginData.installCommands && Array.isArray(pluginData.installCommands)) {
			installCommands = pluginData.installCommands
		} else if ('installCommand' in pluginData && pluginData.installCommand) {
			// Convert legacy format to new format
			installCommands = [
				{
					packageManager: 'npm',
					command: `npm install ${String(pluginData.installCommand)}`,
				},
			]
		}

		// Get images if available
		let images: PluginImage[] = []
		if (pluginData.imagesGallery && Array.isArray(pluginData.imagesGallery)) {
			// Fetch image URLs
			try {
				// Extract IDs properly, handling both simple IDs and object references
				const imageIds = pluginData.imagesGallery
					.map((id) => {
						// Check if the id is an object with an id property
						if (typeof id === 'object' && id !== null && 'id' in id) {
							return String(id.id)
						}
						// Otherwise, assume it's a primitive ID
						return String(id)
					})
					.filter(Boolean) // Remove any undefined/null values

				if (imageIds.length > 0) {
					console.log(`Fetching image data for IDs:`, imageIds)
					const imagesData = await payload.find({
						collection: 'media',
						where: {
							id: {
								in: imageIds,
							},
						},
					})

					if (imagesData.docs && imagesData.docs.length > 0) {
						images = imagesData.docs.map((img) => ({
							id: Number(img.id),
							url: String(img.url),
							alt: String(img.alt || ''),
						}))
					}
				}
			} catch (error) {
				console.error('Error fetching image data:', error)
			}
		}

		// Include additional GitHub data if available
		const githubData = {
			stars: pluginData.githubData?.stars as number || 0,
			forks: pluginData.githubData?.forks as number || 0,
			githubRepo: pluginData.githubUrl as string || '(not specified)',
			updatedAt: pluginData.githubData?.lastUpdated || pluginData.updatedAt || null
		}

		// Debug log
		console.log('Plugin data:', {
			id: pluginData.id,
			name: pluginData.name,
			githubUrl: pluginData.githubUrl,
			githubData: pluginData.githubData,
			category: pluginData.category,
			tags: pluginData.tags,
		});

		return {
			id: pluginData.id,
			name: pluginData.name as string,
			shortDescription: pluginData.shortDescription as string,
			fullDescription: fullDescription,
			category: pluginData.category || null,
			tags: pluginData.tags || [],
			installCommand: 'installCommand' in pluginData ? String(pluginData.installCommand || '') : '',
			installCommands: installCommands,
			relatedLinks: {
				npmUrl: pluginData.relatedLinks?.npmUrl || null,
				demoUrl: pluginData.relatedLinks?.demoUrl || null,
				videoUrl: pluginData.relatedLinks?.videoUrl || null,
			},
			images: images,
			mainImage: pluginData.mainImage || null,
			// Add GitHub data
			...githubData
		}
	} catch (error) {
		console.error('Error fetching plugin for edit:', error)
		throw error
	}
}

// Update an existing plugin
export async function updatePlugin(formData: FormData) {
	// Check authentication
	const session = await auth()
	if (!session || !session.user) {
		return { success: false, message: 'You must be logged in to update a plugin' }
	}

	const slug = formData.get('slug') as string
	
	// Parse JSON data from form
	const jsonData = formData.get('data') as string
	if (!jsonData) return { success: false, message: 'No data provided' }
	
	const data = JSON.parse(jsonData)
	
	// Check if user is authorized to edit this plugin
	const payload = await getPayload({ config: configPromise })
	
	try {
		// Fetch the current plugin
		const pluginResponse = await payload.find({
			collection: 'plugins',
			where: {
				slug: {
					equals: slug,
				},
			},
		})

		if (pluginResponse.docs.length === 0) {
			return { success: false, message: 'Plugin not found' }
		}

		const plugin = pluginResponse.docs[0] as PluginWithGitHubData
		const pluginId = plugin.id
		
		// Check if user is owner based on verification data
		let isOwner = false
		
		// Check if the verification data exists and matches the current user
		if (plugin.verification) {
			// Get the GitHub username from the session
			const githubUsername = session.user.username
			
			// Check if usernames match (either as direct username or verified by field)
			isOwner = (
				// Check if the verification data exists
				(plugin.verification.githubVerification?.username === githubUsername) ||
				// Or check if the username matches the verifiedBy field
				(plugin.verification.verifiedBy === githubUsername)
			)
			
			// Debug log to see the verification check
			console.log(`[updatePlugin] Ownership check:`, {
				sessionUserName: session.user.name, // Display name
				sessionUsername: session.user.username, // GitHub username
				verificationUsername: plugin.verification.githubVerification?.username,
				verifiedBy: plugin.verification.verifiedBy,
				isOwner
			})
		}
		
		if (!isOwner) {
			return { success: false, message: 'You do not have permission to edit this plugin' }
		}
		
		// Process form data
		const updateData: any = {
			name: data.name,
			shortDescription: data.shortDescription,
			category: data.category ? Number(data.category) : null,
			tags: data.tags ? data.tags.map((tagId: string) => Number(tagId)) : [],
			installCommands: data.installCommands || [],
			relatedLinks: {
				npmUrl: data.relatedLinks.npmUrl || null,
				demoUrl: data.relatedLinks.demoUrl || null,
				videoUrl: data.relatedLinks.videoUrl || null,
			},
		}
		
		// Upload new images if provided
		if (formData.getAll('images').length > 0) {
			const imageFiles = formData.getAll('images') as File[]
			
			// Filter out any empty files (browser might send empty entries)
			const validImageFiles = imageFiles.filter(file => 
				file instanceof File && file.size > 0 && file.name
			);
			
			console.log(`Processing ${validImageFiles.length} image files for upload`);
			
			if (validImageFiles.length > 0) {
				// Upload each image
				const uploadPromises = validImageFiles.map(async (file: File) => {
					console.log(`Uploading image: ${file.name}, size: ${file.size}, type: ${file.type}`);
					
					// Upload to Payload
					const uploadResponse = await payload.create({
						collection: 'media',
						data: {
							alt: `Image for ${data.name}`,
						},
						file: {
							data: Buffer.from(await file.arrayBuffer()),
							mimetype: file.type,
							size: file.size,
							name: file.name
						}
					})
					
					console.log(`Image uploaded successfully, ID: ${uploadResponse.id}`);
					
					return {
						media: uploadResponse.id,
					}
				})
				
				// Wait for all uploads to complete and add to images array
				const uploadedImages = await Promise.all(uploadPromises)
				
				// Combine existing images with new uploaded ones
				const existingImages = plugin.images || []
				
				console.log(`Adding ${uploadedImages.length} new images to ${existingImages.length} existing images`);
				
				updateData.images = [
					...existingImages,
					...uploadedImages,
				]
			}
		} else {
			// If no new images uploaded, keep existing images
			if (plugin.images && plugin.images.length > 0) {
				updateData.images = plugin.images;
			}
		}
		
		// Update the plugin
		const updatedPlugin = await payload.update({
			collection: 'plugins',
			id: pluginId,
			data: updateData,
		})
		
		// Revalidate the plugin page cache
		revalidatePath(`/plugins/${slug}`)
		
		// If name changed, the slug might have changed too
		const newSlug = updatedPlugin.slug
		if (newSlug !== slug) {
			revalidatePath(`/plugins/${newSlug}`)
		}
		
		return {
			success: true,
			message: 'Plugin updated successfully',
			newSlug: newSlug !== slug ? newSlug : null,
		}
	} catch (error) {
		console.error('Error updating plugin:', error)
		return { success: false, message: 'Error updating plugin' }
	}
}

// Helper to create rich text from plain text with paragraphs
function createRichTextFromDescription(description: string) {
	// Split the description into paragraphs based on double newlines
	const paragraphs = description.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

	// Create a rich text node for each paragraph
	const children = paragraphs.map((paragraph) => ({
		children: [
			{
				detail: 0,
				format: 0,
				mode: 'normal',
				style: '',
				text: paragraph.trim(),
				type: 'text',
				version: 1,
			},
		],
		direction: 'ltr',
		format: '',
		indent: 0,
		type: 'paragraph',
		version: 1,
	}))

	return {
		root: {
			children,
			direction: 'ltr',
			format: '',
			indent: 0,
			type: 'root',
			version: 1,
		},
	}
}

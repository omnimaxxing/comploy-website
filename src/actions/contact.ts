'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export type ContactFormData = {
	fullName: string
	email: string
	message: string
}

// Form field validation patterns
const VALIDATION_PATTERNS = {
	email: {
		pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		message: 'Please enter a valid email address',
	},
	fullName: {
		pattern: /^.{3,}$/,
		message: 'Name must be at least 3 characters',
	},
	message: {
		pattern: /^.{10,}$/,
		message: 'Message must be at least 10 characters',
	},
}

// Base submit function for contact form
export async function submitContactForm(data: ContactFormData) {
	try {
		const payload = await getPayload({ config: configPromise })

		// Create a new contact submission
		await payload.create({
			collection: 'contact-submissions',
			data: {
				fullName: data.fullName,
				email: data.email,
				message: data.message,
				status: 'new',
			},
		})

		return {
			success: true,
		}
	} catch (error) {
		console.error('Error submitting contact form:', error)
		return {
			success: false,
			error: 'Failed to submit your message. Please try again later.',
		}
	}
}

// Enhanced server action with validation for use with useActionState
export async function enhancedSubmitContact(prevState: any, formData: FormData) {
	const fullName = formData.get('fullName') as string
	const email = formData.get('email') as string
	const message = formData.get('message') as string

	// Server-side validation
	if (!fullName || !email || !message) {
		return {
			success: false,
			error: 'All fields are required',
			fieldErrors: {
				fullName: !fullName ? 'Name is required' : null,
				email: !email ? 'Email is required' : null,
				message: !message ? 'Message is required' : null,
			},
		}
	}

	if (!VALIDATION_PATTERNS.email.pattern.test(email)) {
		return {
			success: false,
			error: 'Invalid email format',
			fieldErrors: { email: VALIDATION_PATTERNS.email.message },
		}
	}

	try {
		const result = await submitContactForm({ fullName, email, message })
		return {
			success: true,
			message: "Thank you for your message! We'll be in touch shortly.",
		}
	} catch (error) {
		return {
			success: false,
			error: 'Failed to submit form. Please try again.',
		}
	}
}

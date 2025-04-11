'use server'

import { revalidatePath } from 'next/cache'
import payload from 'payload'
import type { ContactSubmission } from '@/payload/payload-types'

type ContactFormData = {
	fullName: string
	email: string
	company?: string
	inquiryType: string
	message: string
}

export async function submitContactForm(data: ContactFormData) {
	try {
		// Create the contact submission in Payload
		const submission = await payload.create<ContactSubmission>({
			collection: 'contact-submissions',
			data: {
				fullName: data.fullName,
				email: data.email,
				company: data.company || '',
				inquiryType: data.inquiryType,
				message: data.message,
				status: 'new',
			},
		})

		// Revalidate the contact page
		revalidatePath('/contact')

		return {
			success: true,
			data: submission,
		}
	} catch (error) {
		console.error('Error submitting contact form:', error)
		return {
			success: false,
			error: 'Failed to submit contact form. Please try again.',
		}
	}
}

import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import {
	sendContactFormConfirmation,
	sendContactFormNotification,
} from '@/emails/hooks/sendContactFormEmails'
import type { CollectionConfig } from 'payload'

const ContactSubmissions: CollectionConfig = {
	slug: 'contact-submissions',
	admin: {
		useAsTitle: 'fullName',
		description: 'Contact form submissions from the website.',
		group: 'Content',
	},
	access: {
		create: anyone,
		read: admins,
		update: admins,
		delete: admins,
	},
	fields: [
		{
			name: 'fullName',
			type: 'text',
			required: true,
		},
		{
			name: 'email',
			type: 'email',
			required: true,
		},
		{
			name: 'message',
			type: 'textarea',
			required: true,
		},
		{
			name: 'status',
			type: 'select',
			defaultValue: 'new',
			options: [
				{ label: 'New', value: 'new' },
				{ label: 'In Progress', value: 'in-progress' },
				{ label: 'Completed', value: 'completed' },
				{ label: 'Archived', value: 'archived' },
			],
			admin: {
				position: 'sidebar',
			},
		},
		{
			name: 'internalNotes',
			type: 'textarea',
			admin: {
				description: 'Internal notes for staff (not visible to submitter)',
			},
		},
	],
	hooks: {
		afterChange: [
			async ({ doc, operation, req }) => {
				// Only send emails on create operation
				if (operation === 'create') {
					try {
						// Send confirmation email to submitter
						await sendContactFormConfirmation(req.payload, {
							fullName: doc.fullName,
							email: doc.email,
							message: doc.message,
						})

						// Send notification email to admin
						await sendContactFormNotification(req.payload, {
							fullName: doc.fullName,
							email: doc.email,
							message: doc.message,
						})

						console.log('Contact form emails sent successfully')
					} catch (error) {
						console.error('Error sending contact form emails:', error)
						// Don't throw error to prevent blocking the submission
					}
				}
			},
		],
	},
	timestamps: true,
}

export default ContactSubmissions

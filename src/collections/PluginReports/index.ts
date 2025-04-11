import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import type { CollectionConfig } from 'payload'

const PluginReports: CollectionConfig = {
	slug: 'plugin-reports',
	admin: {
		useAsTitle: 'pluginName',
		description: 'Plugin reports and deletion requests.',
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
			name: 'reportType',
			type: 'select',
			required: true,
			options: [
				{ label: 'Deletion Request', value: 'deletion' },
				{ label: 'Content Violation', value: 'content-violation' },
				{ label: 'Security Concern', value: 'security' },
				{ label: 'Copyright Infringement', value: 'copyright' },
				{ label: 'Other Report', value: 'other' },
			],
		},
		{
			name: 'pluginName',
			type: 'text',
			required: true,
			admin: {
				description: 'Name of the plugin being reported',
			},
		},
		{
			name: 'pluginSlug',
			type: 'text',
			required: true,
			admin: {
				description: 'Slug of the plugin being reported',
			},
		},
		{
			name: 'reporterName',
			type: 'text',
			required: true,
			admin: {
				description: 'Name of the person making the report',
			},
		},
		{
			name: 'reporterEmail',
			type: 'email',
			required: true,
			admin: {
				description: 'Email of the person making the report',
			},
		},
		{
			name: 'isOwner',
			type: 'checkbox',
			label: 'Is Plugin Owner',
			defaultValue: false,
			admin: {
				description: 'Indicates if the reporter is the plugin owner',
			},
		},
		{
			name: 'message',
			type: 'textarea',
			required: true,
			admin: {
				description: 'Details of the report or deletion request',
			},
		},
		{
			name: 'status',
			type: 'select',
			defaultValue: 'pending',
			options: [
				{ label: 'Pending', value: 'pending' },
				{ label: 'In Review', value: 'in-review' },
				{ label: 'Resolved', value: 'resolved' },
				{ label: 'Rejected', value: 'rejected' },
			],
			admin: {
				position: 'sidebar',
			},
		},
		{
			name: 'internalNotes',
			type: 'textarea',
			admin: {
				description: 'Internal notes for administrators',
			},
		},
	],
	hooks: {
		afterChange: [
			async ({ doc, operation, req }) => {
				// Only send emails on create operation
				if (operation === 'create') {
					try {
						// Send notification email to admin (reusing the existing email functions)
						const adminMessage = `
New plugin ${doc.reportType === 'deletion' ? 'deletion request' : 'report'} received:
Plugin: ${doc.pluginName} (${doc.pluginSlug})
Reporter: ${doc.reporterName} (${doc.reporterEmail})
${doc.isOwner ? 'Reporter is the plugin owner' : 'Reporter is not the plugin owner'}
Type: ${doc.reportType}
Message: ${doc.message}
						`

						// Send email using existing payload email utility
						// This would ideally use the same email utility as ContactSubmissions
						await req.payload.sendEmail({
							from: process.env.SMTP_FROM || 'noreply@payloadplugins.com',
							to: process.env.ADMIN_EMAIL || 'admin@payloadplugins.com',
							subject: `[Plugin ${doc.reportType === 'deletion' ? 'Deletion Request' : 'Report'}] ${
								doc.pluginName
							}`,
							text: adminMessage,
						})

						console.log('Plugin report notification email sent successfully')
					} catch (error) {
						console.error('Error sending plugin report notification email:', error)
						// Don't throw error to prevent blocking the submission
					}
				}
			},
		],
	},
	timestamps: true,
}

export default PluginReports

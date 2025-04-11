import type { CollectionAfterChangeHook } from 'payload'
import { render } from '@react-email/render'
import { generateEmailTemplate } from '../templates/baseTemplate'
import { lexicalToMarkdown } from '@/utilities/lexicalToMarkdown'
import { generatePasswordResetEmail } from '@/collections/Users/functions/generatePasswordResetEmail'
const SENDER_NAME = 'TigerShark Pickleball'
const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'welcome@tigersharkpickleball.com'
const PASSWORD_RESET_EMAIL =
	process.env.PASSWORD_RESET_FROM_EMAIL || 'security@tigersharkpickleball.com'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@tigersharkpickleball.com'

// Helper function to send a single email
const sendSingleEmail = async (payload, { to, from, subject, html }) => {
	try {
		await payload.sendEmail({
			from: `${SENDER_NAME} <${from}>`,
			to,
			subject,
			html,
		})
		console.log(`Email sent successfully to ${to}`)
	} catch (error) {
		console.error('Error sending email:', error)
	}
}

// Get recipients based on type and configuration
const getRecipients = async (payload, recipientsConfig): Promise<string[]> => {
	let recipients: string[] = []

	switch (recipientsConfig.type) {
		case 'all':
			const allUsers = await payload.find({
				collection: 'users',
				depth: 0,
			})
			recipients = allUsers.docs.map((user) => user.email)
			break

		case 'subscribers':
			// Build preference query
			const preferenceQuery: Record<string, any>[] = []
			if (recipientsConfig.preferences?.productUpdates) {
				preferenceQuery.push({
					preferences: {
						productUpdates: {
							equals: true,
						},
					},
				})
			}
			if (recipientsConfig.preferences?.promotions) {
				preferenceQuery.push({
					preferences: {
						promotions: {
							equals: true,
						},
					},
				})
			}
			if (recipientsConfig.preferences?.blogPosts) {
				preferenceQuery.push({
					preferences: {
						blogPosts: {
							equals: true,
						},
					},
				})
			}

			// Query newsletter-subscribers collection with preferences
			const subscribers = await payload.find({
				collection: 'newsletter-subscribers',
				where: {
					and: [
						{
							subscribed: {
								equals: true,
							},
						},
						...(preferenceQuery.length > 0
							? [
									{
										or: preferenceQuery,
									},
							  ]
							: []),
					],
				},
				depth: 0,
			})
			recipients = subscribers.docs.map((sub) => sub.email)

			// Also get users who opted in for newsletters
			const subscribedUsers = await payload.find({
				collection: 'users',
				where: {
					preferences: {
						subscription: {
							equals: true,
						},
					},
				},
				depth: 0,
			})
			recipients = [...recipients, ...subscribedUsers.docs.map((user) => user.email)]
			break

		case 'specific':
			if (recipientsConfig.users) {
				const users = await payload.find({
					collection: 'users',
					where: {
						id: {
							in: recipientsConfig.users.map((user) => user.id || user),
						},
					},
					depth: 0,
				})
				recipients = users.docs.map((user) => user.email)
			}
			break

		case 'custom':
			if (recipientsConfig.customEmails) {
				recipients = recipientsConfig.customEmails.map((item) => item.email)
			}
			break
	}

	// Remove duplicates
	return [...new Set(recipients)]
}

// Main email sending function that handles all email types
export const sendEmail: CollectionAfterChangeHook = async ({
	doc,
	operation,
	req,
	collection,
	context,
	previousDoc,
}) => {
	const { payload } = req
	const recipients = await getRecipients(payload, doc.recipients)

	// Convert Lexical content to markdown
	const markdownContent = lexicalToMarkdown(doc.content)

	// Generate email content based on type
	const email = generateEmailTemplate({
		type: doc.typeEmail,
		subject: doc.subject,
		content: {
			title: doc.title,
			content: doc.typeEmail === 'newsletter-broadcast' ? markdownContent : undefined,
			message: doc.typeEmail !== 'newsletter-broadcast' ? markdownContent : undefined,
		},
	})

	const html = await render(email.react)
	const fromEmail = doc.typeEmail === 'password-reset' ? PASSWORD_RESET_EMAIL : SENDER_EMAIL

	// Send to each recipient
	for (const recipient of recipients) {
		await sendSingleEmail(payload, {
			to: recipient,
			from: fromEmail,
			subject: doc.subject,
			html,
		})
	}
}

// Specialized function for account creation emails
export const sendAccountCreationEmail = async (payload, user) => {
	const email = generateEmailTemplate({
		type: 'welcome',
		subject: `Welcome to TigerShark Pickleball, ${user.firstName}!`,
		content: {
			title: 'Your TigerShark Pickleball Account is Ready!',
			greeting: `Hello ${user.firstName},`,
			message:
				"Thank you for creating your Tigershark Pickleball account. We're excited to work with you!",
			actionButton: {
				text: 'Visit Your Account',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/account`,
			},
		},
	})

	const html = await render(email.react)
	await sendSingleEmail(payload, {
		to: user.email,
		from: SENDER_EMAIL,
		subject: email.subject,
		html,
	})
}

// Specialized function for password reset emails
export const sendPasswordResetEmail = async (payload, user, token) => {
	const email = generatePasswordResetEmail(user, token)
	const html = await render(email.react)
	await sendSingleEmail(payload, {
		to: user.email,
		from: PASSWORD_RESET_EMAIL,
		subject: email.subject,
		html,
	})
}

// Specialized function for admin access granted emails
export const sendAdminAccessEmail = async (payload, user) => {
	const email = generateEmailTemplate({
		type: 'admin-access',
		subject: 'Welcome to TigerShark Admin Panel',
		content: {
			title: 'Admin Access Granted',
			greeting: `Hello ${user.firstName || user.name || user.email},`,
			message:
				'You have been granted administrator access to the TigerShark Pickleball admin panel. You can now access the admin panel to manage products, orders, content, and more.',
			actionButton: {
				text: 'Access Admin Panel',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin`,
			},
		},
	})

	const html = await render(email.react)
	await sendSingleEmail(payload, {
		to: user.email,
		from: SENDER_EMAIL,
		subject: email.subject,
		html,
	})
}

// Specialized function for order confirmation emails
export const sendOrderConfirmationEmail = async (payload, user, order) => {
	const email = generateEmailTemplate({
		type: 'order-confirmation',
		subject: `Order Confirmation #${order.id}`,
		content: {
			title: 'Thank You for Your Order!',
			greeting: `Hi ${user.firstName},`,
			message: "We've received your order and are processing it now.",
			orderDetails: order,
		},
	})

	const html = await render(email.react)
	await sendSingleEmail(payload, {
		to: user.email,
		from: SENDER_EMAIL,
		subject: email.subject,
		html,
	})
}

// Specialized function for shipping confirmation emails
export const sendShippingConfirmationEmail = async (payload, user, order) => {
	const email = generateEmailTemplate({
		type: 'shipping-confirmation',
		subject: `Your Order #${order.id} Has Shipped!`,
		content: {
			title: 'Your Order is On Its Way!',
			greeting: `Hi ${user.firstName},`,
			message: 'Great news! Your order has been shipped and is on its way to you.',
			trackingInfo: order.tracking,
		},
	})

	const html = await render(email.react)
	await sendSingleEmail(payload, {
		to: user.email,
		from: SENDER_EMAIL,
		subject: email.subject,
		html,
	})
}

// Specialized function for newsletter subscription confirmation
export const sendNewsletterConfirmationEmail = async (payload, { email }) => {
	const emailTemplate = generateEmailTemplate({
		type: 'newsletter',
		subject: 'Welcome to TigerShark Pickleball Newsletter!',
		content: {
			title: 'Thanks for Subscribing!',
			message: `Thank you for subscribing to our newsletter! You'll be the first to know about new products, exclusive offers, and pickleball tips from TigerShark.`,
			actionButton: {
				text: 'Visit Our Shop',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/shop`,
			},
		},
	})

	const html = await render(emailTemplate.react)
	await sendSingleEmail(payload, {
		to: email,
		from: SENDER_EMAIL,
		subject: emailTemplate.subject,
		html,
	})
}

// Support Email Templates
export const generateSupportConfirmationEmail = ({
	name,
	email,
	category,
	orderNumber,
	productName,
}) => {
	return generateEmailTemplate({
		type: 'support-inquiry',
		subject: 'We Received Your Support Request',
		content: {
			title: 'Support Request Received',
			greeting: `Hi ${name},`,
			message: `Thank you for reaching out to TigerShark Support. We've received your ${category} inquiry${
				orderNumber ? ` regarding order #${orderNumber}` : ''
			}${
				productName ? ` about ${productName}` : ''
			}. Our support team will review your request and get back to you as soon as possible.`,
			actionButton: {
				text: 'View Support Resources',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/support`,
			},
		},
	})
}

export const generateSupportNotificationEmail = ({
	name,
	email,
	category,
	orderNumber,
	productName,
	purchaseDate,
	message,
}) => {
	return generateEmailTemplate({
		type: 'support-inquiry-admin',
		subject: `New Support Request: ${category.toUpperCase()}`,
		content: {
			title: 'New Support Request',
			message: `
A new support request has been submitted:

Customer Name: ${name}
Email: ${email}
Category: ${category}
${orderNumber ? `Order Number: ${orderNumber}` : ''}
${productName ? `Product Name: ${productName}` : ''}
${purchaseDate ? `Purchase Date: ${purchaseDate}` : ''}

Message:
${message}
`,
			actionButton: {
				text: 'View in Admin Panel',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/support-inquiries`,
			},
		},
	})
}

// Support Email Sending Functions
export const sendSupportInquiryConfirmation = async (payload, data) => {
	const emailTemplate = generateSupportConfirmationEmail(data)
	const html = await render(emailTemplate.react)
	await sendSingleEmail(payload, {
		to: data.email,
		from: SENDER_EMAIL,
		subject: emailTemplate.subject,
		html,
	})
}

export const sendSupportInquiryNotification = async (payload, data) => {
	const emailTemplate = generateSupportNotificationEmail(data)
	const html = await render(emailTemplate.react)
	await sendSingleEmail(payload, {
		to: SUPPORT_EMAIL,
		from: SENDER_EMAIL,
		subject: emailTemplate.subject,
		html,
	})
}

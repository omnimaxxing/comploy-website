import { render } from '@react-email/render'
import { generateEmailTemplate } from '../templates/baseTemplate'

const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'welcome@tigersharkpickleball.com'
const ADMIN_EMAIL = process.env.BUSINESS_INQUIRY_EMAIL || 'partnerships@tigersharkpickleball.com'

// Helper function to send a single email
const sendSingleEmail = async (payload, { to, from, subject, html }) => {
	try {
		await payload.sendEmail({
			from: `TigerShark Pickleball <${from}>`,
			to,
			subject,
			html,
		})
		console.log(`Email sent successfully to ${to}`)
	} catch (error) {
		console.error('Error sending email:', error)
		throw error
	}
}

// Send confirmation email to the business inquirer
export const sendBusinessInquiryConfirmation = async (
	payload,
	{ businessName, contactName, email },
) => {
	const emailTemplate = generateEmailTemplate({
		type: 'business-inquiry',
		subject: 'Thank You for Your Interest in TigerShark Pickleball',
		content: {
			title: 'Thank You for Your Interest!',
			greeting: `Hi ${contactName},`,
			message: `Thank you for your interest in partnering with TigerShark Pickleball. We've received your inquiry for ${businessName} and will review it promptly. Our partnerships team will be in touch within 24 hours to discuss your requirements in detail.`,
			actionButton: {
				text: 'View Our Partner Success Stories',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/business#showcase`,
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

// Send notification email to admin
export const sendBusinessInquiryNotification = async (
	payload,
	{ businessName, contactName, email, phone, message },
) => {
	const emailTemplate = generateEmailTemplate({
		type: 'business-inquiry-admin',
		subject: `New Business Partnership Inquiry: ${businessName}`,
		content: {
			title: 'New Business Partnership Inquiry',
			message: `
A new business partnership inquiry has been submitted:

Business Name: ${businessName}
Contact Name: ${contactName}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
`,
			actionButton: {
				text: 'View in Admin Panel',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/business-inquiries`,
			},
		},
	})

	const html = await render(emailTemplate.react)
	await sendSingleEmail(payload, {
		to: ADMIN_EMAIL,
		from: SENDER_EMAIL,
		subject: emailTemplate.subject,
		html,
	})
}

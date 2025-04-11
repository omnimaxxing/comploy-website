import { render } from '@react-email/render'
import { generateEmailTemplate } from '../templates/baseTemplate'
import { format, parseISO } from 'date-fns'

const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'welcome@omnipixel.ai'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@omnipixel.ai'

// Helper function to send a single email
const sendSingleEmail = async (payload, { to, from, subject, html }) => {
	try {
		await payload.sendEmail({
			from: `OmniPixel <${from}>`,
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

const formatCallType = (callType: string) => {
	switch (callType) {
		case 'discovery':
			return 'Discovery Call'
		case 'consultation':
			return 'Technical Consultation'
		case 'project-discussion':
			return 'Project Discussion'
		case 'partnership':
			return 'Partnership Discussion'
		default:
			return callType
	}
}

// Helper function to safely parse date string
const parseDateString = (dateStr: string): Date => {
	try {
		// If it's an ISO string, parse it with parseISO
		if (dateStr.includes('T')) {
			return parseISO(dateStr)
		}
		// Otherwise, create a new date at noon ET
		return new Date(`${dateStr}T12:00:00-05:00`)
	} catch (error) {
		console.error('Error parsing date:', error)
		throw new Error('Invalid date format')
	}
}

// Send confirmation email to the person who scheduled
export const sendSchedulingConfirmation = async (
	payload,
	{ fullName, email, callDate, timeSlot, callType, phone },
) => {
	console.log('Email template - Original date:', callDate)

	// Safely parse the date
	const date = parseDateString(callDate)
	console.log('Email template - Parsed date:', date)

	const formattedDate = format(date, 'MMMM do, yyyy')
	console.log('Email template - Formatted date:', formattedDate)

	const emailTemplate = generateEmailTemplate({
		type: 'scheduled-call',
		subject: 'Call Scheduled Successfully - OmniPixel',
		content: {
			title: 'Your Call is Scheduled!',
			greeting: `Hi ${fullName},`,
			message: 'Your call has been scheduled successfully. Here are the details:',
			fullName,
			callType: formatCallType(callType),
			callDate: formattedDate,
			timeSlot: `${timeSlot} ET`,
			footer: 'If you need to reschedule or cancel, please contact us at hello@omnipixel.ai',
			actionButton: {
				text: 'Add to Calendar',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/calendar?date=${callDate}&time=${timeSlot}&type=${callType}`,
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
export const sendSchedulingNotification = async (
	payload,
	{ fullName, email, callDate, timeSlot, callType, phone },
) => {
	console.log('Admin email - Original date:', callDate)

	// Safely parse the date
	const date = parseDateString(callDate)
	console.log('Admin email - Parsed date:', date)

	const formattedDate = format(date, 'MMMM do, yyyy')
	console.log('Admin email - Formatted date:', formattedDate)

	const emailTemplate = generateEmailTemplate({
		type: 'scheduled-call-admin',
		subject: `New Call Scheduled: ${formatCallType(callType)}`,
		content: {
			title: 'New Call Scheduled',
			message: 'A new call has been scheduled through the website.',
			fullName,
			email,
			phoneNumber: phone,
			callType: formatCallType(callType),
			callDate: formattedDate,
			timeSlot: `${timeSlot} ET`,
			actionButton: {
				text: 'View in Admin Panel',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/scheduling-submissions`,
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

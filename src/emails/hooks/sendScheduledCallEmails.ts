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

// Format date for display
const formatDate = (dateString: string) => {
	const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
	return format(date, 'EEEE, MMMM d, yyyy')
}

// Format time for display
const formatTime = (timeString: string) => {
	// If time is in 24-hour format (e.g., "14:00"), convert to 12-hour format with AM/PM
	const [hours, minutes] = timeString.split(':')
	const hour = parseInt(hours, 10)
	const ampm = hour >= 12 ? 'PM' : 'AM'
	const hour12 = hour % 12 || 12
	return `${hour12}:${minutes} ${ampm}`
}

// Helper function to get call type label
const getCallTypeLabel = async (payload, callTypeValue) => {
	try {
		const schedulingGlobal = await payload.findGlobal({
			slug: 'scheduling-global',
		})

		const callType = schedulingGlobal?.callTypes?.find((type) => type.value === callTypeValue)
		return callType?.label || callTypeValue
	} catch (error) {
		console.error('Error getting call type label:', error)
		return callTypeValue
	}
}

// Send confirmation email to the person who scheduled the call
export const sendScheduledCallConfirmation = async (
	payload,
	{ fullName, email, phoneNumber, callDate, timeSlot, callType },
) => {
	const formattedDate = formatDate(callDate)
	const formattedTime = formatTime(timeSlot)
	const callTypeLabel = await getCallTypeLabel(payload, callType)

	const emailTemplate = generateEmailTemplate({
		type: 'scheduled-call',
		subject: 'Your Call with OmniPixel is Confirmed',
		content: {
			title: 'Call Scheduled Successfully!',
			greeting: `Hi ${fullName},`,
			message: `Thank you for scheduling a call with OmniPixel. We're looking forward to speaking with you!

Your call details:`,
			fullName,
			email,
			phoneNumber,
			callDate: formattedDate,
			timeSlot: formattedTime,
			callType: callTypeLabel,
			actionButton: {
				text: 'Add to Calendar',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/calendar?date=${callDate}&time=${timeSlot}`,
			},
			footer: `What's Next:
• You'll receive a calendar invite shortly
• Our team will be prepared to discuss your needs
• Feel free to prepare any questions you have

If you need to reschedule, please contact us at least 24 hours in advance.`,
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
export const sendScheduledCallNotification = async (
	payload,
	{ fullName, email, phoneNumber, callDate, timeSlot, callType },
) => {
	const formattedDate = formatDate(callDate)
	const formattedTime = formatTime(timeSlot)
	const callTypeLabel = await getCallTypeLabel(payload, callType)

	const emailTemplate = generateEmailTemplate({
		type: 'scheduled-call-admin',
		subject: `New Call Scheduled: ${callTypeLabel}`,
		content: {
			title: 'New Call Scheduled',
			message: 'A new call has been scheduled with the following details:',
			fullName,
			email,
			phoneNumber,
			callDate: formattedDate,
			timeSlot: formattedTime,
			callType: callTypeLabel,
			actionButton: {
				text: 'View in Admin Panel',
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/scheduled-calls`,
			},
			footer:
				'Please ensure the calendar invite is sent and any necessary preparation is completed.',
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

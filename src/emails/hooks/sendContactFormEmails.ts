import type { Payload } from 'payload'

type ContactFormData = {
	fullName: string
	email: string
	message: string
}

export async function sendContactFormConfirmation(payload: Payload, data: ContactFormData) {
	try {
		await payload.sendEmail({
			from: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
			to: data.email,
			subject: 'Thank you for contacting us',
			html: `
				<h1>Thank you for reaching out!</h1>
				<p>Hello ${data.fullName},</p>
				<p>We've received your message and will get back to you as soon as possible.</p>
				<p>Best regards,<br>The Team</p>
			`,
		})
		return true
	} catch (error) {
		console.error('Error sending confirmation email:', error)
		return false
	}
}

export async function sendContactFormNotification(payload: Payload, data: ContactFormData) {
	try {
		const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'admin@example.com'
		
		await payload.sendEmail({
			from: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
			to: adminEmail,
			subject: 'New Contact Form Submission',
			html: `
				<h1>New Contact Form Submission</h1>
				<p><strong>Name:</strong> ${data.fullName}</p>
				<p><strong>Email:</strong> ${data.email}</p>
				<p><strong>Message:</strong></p>
				<p>${data.message.replace(/\n/g, '<br>')}</p>
			`,
		})
		return true
	} catch (error) {
		console.error('Error sending notification email:', error)
		return false
	}
}

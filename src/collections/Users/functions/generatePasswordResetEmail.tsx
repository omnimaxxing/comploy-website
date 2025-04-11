import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components'
import * as React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://omnipixel.ai'

export const generatePasswordResetEmail = (user, token) => ({
	subject: 'Reset Your Omnipixel Password',
	react: (
		<Html>
			<Head />
			<Preview>Reset your Omnipixel account password</Preview>
			<Tailwind>
				<Body className="bg-gray-50 font-sans">
					<Container className="bg-white mx-auto my-8 p-8 max-w-[600px] shadow-lg rounded-lg">
						<Section className="text-center">
							<Img
								src={`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/images/omnipixel_logo.png`}
								width="80"
								height="80"
								alt="Omnipixel Logo"
								className="mx-auto brightness-0"
							/>
						</Section>
						<Section className="mt-8">
							<Heading className="text-3xl font-bold text-accent-500 text-center mb-6">
								Password Reset Request
							</Heading>
							<Text className="text-lg text-primary-900 mb-4">Hi {user.firstName},</Text>
							<Text className="text-base text-primary-900 mb-4">
								We received a request to reset the password for your OmniPixel account. If you
								didn't make this request, you can safely ignore this email.
							</Text>
							<Text className="text-base text-primary-900 mb-4">
								To reset your password, click the button below:
							</Text>
							<Section className="text-center mt-8">
								<Button
									href={`${baseUrl}/reset-password?token=${token}`}
									style={{
										backgroundColor: '#000',
										color: '#fff',
										padding: '10px 20px',
										borderRadius: '5px',
										textDecoration: 'none',
										fontWeight: 'bold',
									}}
								>
									Reset Password
								</Button>
							</Section>

							<Text className="text-base text-primary-900 mt-4">
								This password reset link will expire in 1 hour for security reasons.
							</Text>
							<Text className="text-base text-primary-900 mt-4">
								If you're having trouble clicking the button, copy and paste the URL below into your
								web browser:
							</Text>
							<Text className="text-xs text-primary-600 break-all mt-2">
								{`${baseUrl}/reset-password?token=${token}`}
							</Text>
							<Text className="text-base text-primary-900 mb-4">Best regards,</Text>
							<Text className="text-base text-primary-900 mb-4">Omnipixel Support</Text>
						</Section>
						<Hr className="my-8 border-primary-600" />
						<Section className="text-center text-sm text-primary-600">
							<Text className="mb-2">© 2025 Omnipixel. All rights reserved.</Text>
							<Text className="mb-2">West Palm Beach, FL</Text>
							<Text className="mb-2">
								<Link
									href={`${process.env.NEXT_PUBLIC_SERVER_URL}/support`}
									className="text-accent-500 no-underline hover:underline"
								>
									Support
								</Link>
								{' | '}
								<Link
									href={`${process.env.NEXT_PUBLIC_SERVER_URL}/legal`}
									className="text-accent-500 no-underline hover:underline"
								>
									Legal
								</Link>
							</Text>
							<Text>
								<Link
									href={process.env.NEXT_PUBLIC_SERVER_URL}
									className="text-accent-500 no-underline hover:underline"
								>
									Visit our website
								</Link>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	),
})

export default generatePasswordResetEmail

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

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://omnipixel.io'

// Utility function to split full name into first and last name
const splitName = (fullName: string) => {
	const names = fullName.trim().split(/\s+/)
	if (names.length === 1) return { firstName: names[0], lastName: '' }
	if (names.length === 2) return { firstName: names[0], lastName: names[1] }

	// Handle cases with more than two names
	const lastName = names.pop()
	const firstName = names.join(' ')
	return { firstName, lastName }
}

export const generateSignUpEmail = (doc: { name: string }) => {
	const { firstName } = splitName(doc.name)

	return {
		subject: `Welcome to OmniPixel, ${firstName}!`,
		react: (
			<Html>
				<Head />
				<Preview>{`Your OmniPixel account is ready, ${firstName}.`}</Preview>
				<Tailwind>
					<Body className="bg-gray-50 font-sans">
						<Container className="bg-white mx-auto my-8 p-8 max-w-[600px] shadow-lg rounded-lg">
							<Section className="text-center">
								<Img
									src={`${baseUrl}/assets/images/Logo_White_No_Text.png`}
									width="80"
									height="80"
									alt="OmniPixel Logo"
									className="mx-auto brightness-0"
								/>
							</Section>
							<Section className="mt-8">
								<Heading className="text-3xl font-bold text-accent-500 text-center mb-6">
									Your OmniPixel Account is Ready!
								</Heading>
								<Text className="text-lg text-primary-900 mb-4">Hello {firstName},</Text>
								<Text className="text-base text-primary-900 mb-4">
									Thank you for creating your OmniPixel account. We're excited to work with you!
								</Text>
							</Section>
							<Hr className="my-8 border-primary-600" />
							<Section className="text-center text-sm text-primary-600">
								<Text className="mb-2">© 2025 OmniPixel. All rights reserved.</Text>
								<Text className="mb-2">
									<Link
										href={`${baseUrl}/support`}
										className="text-accent-500 no-underline hover:underline"
									>
										Support
									</Link>
									{' | '}
									<Link
										href={`${baseUrl}/account`}
										className="text-accent-500 no-underline hover:underline"
									>
										Manage Account
									</Link>
								</Text>
								<Text>
									<Link href={baseUrl} className="text-accent-500 no-underline hover:underline">
										Visit our website
									</Link>
								</Text>
							</Section>
						</Container>
					</Body>
				</Tailwind>
			</Html>
		),
	}
}

export default generateSignUpEmail

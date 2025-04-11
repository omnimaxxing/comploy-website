import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Markdown,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from '@react-email/components'
import * as React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://omnipixel.ai'

interface EmailContent {
	title: string
	greeting?: string
	message?: string
	content?: any
	organization?: string
	company?: string
	inquiryType?: string
	fullName?: string
	email?: string
	callDate?: string
	timeSlot?: string
	callType?: string
	phoneNumber?: string
	actionButton?: {
		text: string
		url: string
	}
	footer?: string
}

interface EmailTemplateProps {
	type:
		| 'welcome'
		| 'password-reset'
		| 'newsletter'
		| 'order-confirmation'
		| 'business-inquiry'
		| 'business-inquiry-admin'
		| 'support-inquiry'
		| 'support-inquiry-admin'
		| 'admin-access'
		| 'contact-form'
		| 'contact-form-admin'
		| 'scheduled-call'
		| 'scheduled-call-admin'
	subject: string
	content: EmailContent
}

const renderNewsletterContent = (content) => (
	<Section className="mt-6 rounded-2xl bg-primary-50 p-8">
		<Markdown
			markdownContainerStyles={{
				fontSize: '16px',
				lineHeight: '1.6',
				color: '#333333',
			}}
		>
			{content}
		</Markdown>
	</Section>
)

const renderFooter = () => (
	<Section className="mt-6 bg-white p-8">
		<Row>
			<Column className="w-1/2">
				<Img
					src={`${baseUrl}/icons/omnipixel_text_logo.svg`}
					width="280"
					height="50"
					alt="OmniPixel Logo"
					className="mx-auto"
				/>
				<Text className="my-2 text-base font-semibold leading-6 text-primary-900">OmniPixel</Text>
				<Text className="mt-1 text-base leading-6 text-primary-600">Elevate Your Game</Text>
			</Column>
			<Column align="right" className="w-1/2">
				<Row className="justify-end">
					<Column className="px-2">
						<Link href="https://facebook.com/omnipixel">
							<Img
								alt="Facebook"
								height="32"
								width="32"
								src={`${baseUrl}/assets/images/social/facebook.png`}
								className="opacity-80 hover:opacity-100"
							/>
						</Link>
					</Column>
					<Column className="px-2">
						<Link href="https://twitter.com/omnipixel">
							<Img
								alt="Twitter"
								height="32"
								width="32"
								src={`${baseUrl}/assets/images/social/twitter.png`}
								className="opacity-80 hover:opacity-100"
							/>
						</Link>
					</Column>
				</Row>
				<Row>
					<Text className="mt-4 text-right text-sm leading-6 text-primary-600">Contact Us</Text>
					<Text className="mt-1 text-right text-sm leading-6 text-primary-600">
						support@omnipixel.ai
					</Text>
				</Row>
			</Column>
		</Row>
		<Hr className="my-4 border-gray-200" />
		<Text className="text-center text-xs text-primary-500">
			© {new Date().getFullYear()} OmniPixel. All rights reserved.
			<br />
			<Link href={`${baseUrl}/privacy`} className="text-accent-500 hover:underline">
				Privacy
			</Link>
			{' | '}
			<Link href={`${baseUrl}/terms`} className="text-accent-500 hover:underline">
				Terms of Service
			</Link>
			{' | '}
			<Link href={baseUrl} className="text-accent-500 hover:underline">
				Visit Website
			</Link>
		</Text>
	</Section>
)

export const generateEmailTemplate = ({ type, subject, content }: EmailTemplateProps) => {
	return {
		subject,
		react: (
			<Html>
				<Head />
				<Preview>{content.title}</Preview>
				<Tailwind>
					<Body className="bg-white font-sans">
						<Container className="mx-auto w-full max-w-[600px] p-0">
							{/* Header Section */}
							<Section className="p-8 text-center">
								<Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
									<span className="font-bold tracking-tighter">OmniPixel</span>
									<sup className="text-xs">™</sup>
								</Text>
								<Text className="text-sm font-medium uppercase tracking-wider text-gray-500">
									{type === 'contact-form'
										? 'Contact Confirmation'
										: type === 'scheduled-call'
										  ? 'Call Confirmation'
										  : type === 'scheduled-call-admin'
											  ? 'New Call Scheduled'
											  : 'Notification'}
								</Text>
								<Heading className="mt-4 mb-2 text-3xl font-medium leading-tight text-gray-900">
									{content.title}
								</Heading>
							</Section>

							{/* Main Content Section */}
							<Section className="my-6 rounded-2xl overflow-hidden">
								{/* Gradient Background */}
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-violet-400/10 to-transparent" />
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#fb7a00_0%,transparent_60%)]" />

									{/* Content */}
									<div className="relative p-8 text-left">
										{content.greeting && (
											<Text className="mb-6 text-lg font-medium bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text">
												{content.greeting}
											</Text>
										)}
										<Text className="text-base leading-relaxed text-gray-800 mb-6">
											{content.message}
										</Text>

										{/* Call Details Section */}
										{(type === 'scheduled-call' || type === 'scheduled-call-admin') && (
											<Section className="mb-6 p-6 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-100">
												<div className="space-y-3">
													{type === 'scheduled-call-admin' && (
														<>
															<Row>
																<Column>
																	<Text className="text-sm text-gray-600 mb-1">Full Name</Text>
																	<Text className="text-base font-medium text-gray-900">
																		{content.fullName}
																	</Text>
																</Column>
															</Row>
															<Row>
																<Column>
																	<Text className="text-sm text-gray-600 mb-1">Email</Text>
																	<Text className="text-base font-medium text-gray-900">
																		{content.email}
																	</Text>
																</Column>
															</Row>
															<Row>
																<Column>
																	<Text className="text-sm text-gray-600 mb-1">Phone</Text>
																	<Text className="text-base font-medium text-gray-900">
																		{content.phoneNumber}
																	</Text>
																</Column>
															</Row>
															<Hr className="my-4 border-gray-200" />
														</>
													)}
													<Row>
														<Column>
															<Text className="text-sm text-gray-600 mb-1">Call Type</Text>
															<Text className="text-base font-medium text-primary">
																{content.callType}
															</Text>
														</Column>
													</Row>
													<Row>
														<Column>
															<Text className="text-sm text-gray-600 mb-1">Date</Text>
															<Text className="text-base font-medium text-gray-900">
																{content.callDate}
															</Text>
														</Column>
													</Row>
													<Row>
														<Column>
															<Text className="text-sm text-gray-600 mb-1">Time</Text>
															<Text className="text-base font-medium text-gray-900">
																{content.timeSlot}
															</Text>
														</Column>
													</Row>
												</div>
											</Section>
										)}

										{/* Contact Form Details */}
										{type === 'contact-form' && (
											<>
												{content.company && (
													<>
														<span className="text-sm">
															<span className="text-gray-600">Company: </span>
															<span className="font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">
																{content.company}
															</span>
														</span>
														<br />
													</>
												)}
												<span className="text-sm">
													<span className="text-gray-600">Inquiry Type: </span>
													<span className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text">
														{content.inquiryType}
													</span>
												</span>
											</>
										)}

										{/* Footer Message */}
										{content.footer && (
											<Text className="mt-6 text-sm leading-relaxed text-gray-600">
												{content.footer}
											</Text>
										)}

										{/* Action Button */}
										{content.actionButton && (
											<Section className="mt-8 text-center">
												<Button
													href={content.actionButton.url}
													className="inline-flex items-center rounded-full bg-gradient-to-r from-[#fb7a00] via-[#fd8a00] to-[#e66e00] px-12 py-4 text-center text-sm font-bold text-white no-underline shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300"
												>
													{content.actionButton.text}
												</Button>
											</Section>
										)}
									</div>
								</div>
							</Section>

							{/* Footer Section */}
							<Section className="p-8 text-center">
								<Text className="text-sm text-gray-600">
									© {new Date().getFullYear()} OmniPixel<sup className="text-xs">™</sup>. All rights
									reserved.
								</Text>
								<Row className="mt-4">
									<Column align="center">
										<Link href={`${baseUrl}/privacy`} className="text-xs text-gray-500 underline">
											Privacy Policy
										</Link>
										<Text className="mx-2 inline text-xs text-gray-500">•</Text>
										<Link href={`${baseUrl}/terms`} className="text-xs text-gray-500 underline">
											Terms of Service
										</Link>
										<Text className="mx-2 inline text-xs text-gray-500">•</Text>
										<Link href={baseUrl} className="text-xs text-gray-500 underline">
											Visit Website
										</Link>
									</Column>
								</Row>
								<Text className="mt-4 text-xs text-gray-500">
									OmniPixel<sup className="text-xs">™</sup> • 10183 Orchid Reserve Dr • West Palm
									Beach, FL 34042
								</Text>
							</Section>
						</Container>
					</Body>
				</Tailwind>
			</Html>
		),
	}
}

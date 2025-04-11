import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import React from 'react'
import { ImageMedia } from '../Media/ImageMedia'

interface AboutSectionProps {
	title: string
	subtitle: string
	buttonText?: string
	buttonLink?: string
	text?: string
	image?: string
}

const AboutSection: React.FC<AboutSectionProps> = ({
	title,
	subtitle,
	buttonText,
	buttonLink,
	text,
	image,
}) => {
	return (
		<section className="bg-accent-50 fl-mb-xl fl-pt-l">
			<div className="u-container u-grid mx-auto flex flex-col justify-between max-w-full relative">
				<div className="lg:col-start-1 lg:col-span-7 col-span-12 flex-col flex justify-around w-full relative">
					<div className="flex-col fl-gap-m w-full">
						<h2 className="fl-text-step-0">{title}</h2>
						<p className="fl-text-step-1 text-primary-900 fl-mt-m">{subtitle}</p>
					</div>
					{buttonLink && (
						<div className="lg:fl-mt-3xl fl-mt-m">
							<Button color="dark" text="light" className="fl-mb-m">
								<Link href={buttonLink.url}> {buttonText}</Link>
							</Button>
						</div>
					)}
				</div>
				<div className="lg:col-start-9 lg:col-span-4 col-span-12 justify-end self-end h-full relative">
					<p className="absolute z-10 -left-80 bottom-10 max-w-sm fl-text-step--1 text-neutral-900 hidden lg:block">
						{text}
					</p>
					<ImageMedia
						resource={image}
						alt="About OmniPixel"
						className="rounded-t-lg w-3/4 lg:w-full h-full object-cover z-0"
						priority
					/>
				</div>
			</div>
		</section>
	)
}

export default AboutSection

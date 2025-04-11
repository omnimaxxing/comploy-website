import React from 'react'
import { notFound } from 'next/navigation'
import { FooterClient } from './FooterClient'

// Types that match our config and FooterClient components
type Footer = {
	officialLinks: {
		discord?: string
		github?: string
		website?: string
		discordIcon?: string
		githubIcon?: string
		websiteIcon?: string
	}
	linkColumns: Array<{
		heading: string
		links: Array<{ 
			label: string
			url: string
			id?: string 
		}>
		id?: string
	}>
	legalLinks: Array<{ 
		document: { 
			slug?: string
		}
		label: string
		id?: string 
	}>
	tagline?: string
	additionalSettings: {
		copyrightText?: string
	}
}

type GlobalsPayload<T> = T & {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export async function Footer() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/globals/footer`)

	if (!res.ok) {
		notFound()
	}

	const footer = (await res.json()) as GlobalsPayload<Footer>

	const { 
		officialLinks,
		linkColumns,
		legalLinks,
		additionalSettings,
		tagline
	} = footer

	const footerData = {
		copyrightText: additionalSettings?.copyrightText || `&copy; ${new Date().getFullYear()} Payload Plugins. All rights reserved.`,
		officialLinks,
		linkColumns: linkColumns || [],
		legalLinks: legalLinks || [],
		tagline
	}

	return <FooterClient footerData={footerData} />
}

export default Footer

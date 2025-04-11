'use server'

import type { Banner } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { cookies } from 'next/headers'

async function Spacer() {
	// Get banner data and cookie state
	const banner: Banner = (await getCachedGlobal('banner', 2)()) as Banner
	const cookieStore = cookies()
	const isBannerClosed = (await cookieStore).get('bannerClosed')?.value === 'true'

	return (
		<div
			className={cn(
				'w-full transition-all duration-300',
				// Base height without banner
				'h-[88px] sm:h-[110px]',
				// Increased height when banner is showing
				banner?.display && !isBannerClosed && 'h-[88px] sm:h-[110px]',
			)}
			aria-hidden="true"
		/>
	)
}

export default Spacer

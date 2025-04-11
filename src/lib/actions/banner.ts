'use server'

import { cookies } from 'next/headers'

export async function setBannerClosed() {
	;(await cookies()).set('bannerClosed', 'true', {
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		path: '/',
	})
}

export async function resetBannerCookie() {
	;(await cookies()).delete('bannerClosed')
}

export async function resetAllBannerCookies() {
	// This will be called from admin to reset all cookies
	const cookieStore = await cookies()
	cookieStore.delete('bannerClosed')
	return { success: true }
}

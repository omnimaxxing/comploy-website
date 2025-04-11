'use client'

import { resetAllBannerCookies } from '@/lib/actions/banner'
import type { TextFieldClientProps } from 'payload'

const BannerResetField: React.FC<TextFieldClientProps> = () => {
	return (
		<div className="p-4">
			<h4 className="text-lg font-medium mb-2">Banner Cookie Management</h4>
			<p className="text-sm text-gray-500 mb-4">Reset the banner visibility for all users.</p>
			<button
				onClick={async () => {
					try {
						await resetAllBannerCookies()
						alert('Banner cookies have been reset for all users')
					} catch (error) {
						alert('Failed to reset banner cookies')
					}
				}}
				className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
			>
				Reset Banner Cookies
			</button>
		</div>
	)
}

export default BannerResetField

import React from 'react'
import Link from 'next/link'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export const AnalyticsLink: React.FC = () => {
	return (
		<Link href="/analytics" className="nav-link">
			<ChartBarIcon className="w-5 h-5 mr-2" />
			<span>Analytics</span>
		</Link>
	)
}

export default AnalyticsLink

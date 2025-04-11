import { Icon } from '@iconify/react'
import type React from 'react'
import Link from 'next/link'

const BeforeDashboard: React.FC = () => {
	return (
		<div className="u-container w-full py-8">
			<div className="w-full bg-brand-100 rounded-lg shadow-lg p-6 mb-8">
				<div className="flex items-center gap-3 mb-4">
					<h2 className="text-2xl font-semibold text-neutral-900">
						Welcome to OmniPixel Admin Dashboard
					</h2>
				</div>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{/* Analytics Card */}
				<Link href="/analytics" className="block group">
					<div className="bg-gradient-to-br from-indigo-950/10 to-transparent p-0.5 rounded-lg overflow-hidden shadow-lg">
						<div className="flex flex-col h-full bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden p-6 hover:bg-black/50 transition-all">
							<div className="flex items-center mb-4">
								<div className="p-3 bg-indigo-900/20 rounded-lg mr-4">
									<Icon icon="heroicons:chart-bar" className="w-6 h-6 text-indigo-400" />
								</div>
								<h3 className="text-lg font-semibold">Plugin Analytics</h3>
							</div>
							<p className="text-white/70 mb-4">
								View detailed analytics about plugins, including views, voting statistics, and
								engagement metrics.
							</p>
							<div className="mt-auto flex items-center text-indigo-400 group-hover:text-indigo-300 text-sm">
								<span>View Analytics</span>
								<Icon
									icon="heroicons:arrow-right"
									className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
								/>
							</div>
						</div>
					</div>
				</Link>
			</div>
		</div>
	)
}

export default BeforeDashboard

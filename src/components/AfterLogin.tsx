'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const AfterLogin = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5, duration: 0.5 }}
			className="w-full max-w-md mx-auto mt-6 text-center"
		>
			{/* Terminal-style info message */}
			<div className="w-full bg-black border border-gray-700 rounded-md overflow-hidden shadow-xl">
				{/* Terminal header */}
				<div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-700">
					<div className="flex space-x-2">
						<div className="w-3 h-3 bg-red-500 rounded-full"></div>
						<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
					</div>
					<div className="mx-auto text-gray-400 text-sm font-mono">developer-mode.sh</div>
				</div>

				{/* Terminal content */}
				<div className="bg-black p-4 h-auto overflow-auto font-mono text-sm">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="mb-1 text-green-400"
					>
						$ echo $USER_TYPE
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="mb-1 text-blue-400"
					>
						DEVELOPER_MODE
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 1 }}
						className="mb-1 text-green-400"
					>
						$ cat plugin-suggestions.txt
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 1.5 }}
						className="mb-3 text-gray-300"
					>
						Looking for Payload plugins? Head back to the{' '}
						<a href="/plugins" className="text-primary-400 hover:underline">
							plugins directory
						</a>
						.
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 2 }}
						className="text-xs text-gray-500 p-2 bg-black/50 rounded border border-gray-800 text-left"
					>
						<code className="block mb-1">
							<span className="text-green-400">$</span> <span className="text-blue-400">npm</span>{' '}
							install @payloadcms/plugin-seo
						</code>
					</motion.div>
				</div>
			</div>
		</motion.div>
	)
}

export default AfterLogin

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Meteors } from '@/components/ui/Meteors'

const BeforeLogin = () => {
	return (
		<div className="w-full max-w-md mx-auto mb-6">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.5 }}
				className="mt-4 text-center relative"
			>
				<div className="flex items-center justify-center mb-2">
					<div className="h-px w-12 bg-red-500/50"></div>
					<h2 className="text-md font-bold text-red-400 mx-4 font-mono tracking-widest">
						ADMIN_AREA
					</h2>
					<div className="h-px w-12 bg-red-500/50"></div>
				</div>
				<p className="text-xs text-gray-500 font-mono">
					<span className="text-red-400">STACK TRACE:</span>If you're the admin, welcome back. If
					not, how did you get here?
				</p>
			</motion.div>

			{/* Background effects */}
			<Meteors number={10} className="absolute inset-0 opacity-30" />
		</div>
	)
}

export default BeforeLogin

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect, useCallback, useMemo } from 'react'

import { CMSLink } from '../CMSLink'
import { Button } from '../ui/Button'

const BottomCTA = ({}) => {
	// Function to handle button click and ensure it works
	const handleButtonClick = (e: React.MouseEvent) => {
		// Prevent event propagation to ensure the click is captured by the button
		e.stopPropagation()
	}

	return (
		<section className="u-container">
			<div className="rounded-3xl fl-p-2xl bg-accent-700">
				<Image
					src={'/assets/images/omnipixel_logo.png'}
					height={64}
					width={64}
					alt="Omnipixel Logo"
					className=""
					loading="eager"
					quality={90}
					sizes="64px"
				/>
				<div className="fl-mt-m">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<h2 className="fl-text-step-3 text-left font-semibold fl-mb-s text-white">
							Let's Bring Your Vision to Life
						</h2>
						<div className="w-full md:w-auto" onClick={handleButtonClick} role="none">
							<Button
								asChild
								variant="primary"
								color="light"
								text="dark"
								aria-label="Get in Touch"
								className="w-full md:w-auto py-4 min-h-[48px] z-10 relative active:scale-95 transition-transform"
							>
								<Link
									href="/contact"
									className="w-full md:w-auto flex items-center justify-center"
									onClick={(e) => e.stopPropagation()}
								>
									<span className="px-4">Start Your Project</span>
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default React.memo(BottomCTA)

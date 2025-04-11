'use client'
import { cn } from '@/utilities/cn'
import React, { ReactNode } from 'react'

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
	children: ReactNode
	showRadialGradient?: boolean
}

export const AuroraBackground = ({
	className,
	children,
	showRadialGradient = true,
	...props
}: AuroraBackgroundProps) => {
	return (
		<div
			className={cn(
				'relative flex flex-col items-center justify-center bg-background dark:bg-background transition-bg',
				className,
			)}
			{...props}
		>
			<div className="absolute inset-0 overflow-hidden">
				<div
					className={cn(
						`
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#60A5FA_10%,#14B8A6_15%,#2563EB_20%,#A855F7_25%,#0EA5E9_30%)]
            dark:[--aurora:repeating-linear-gradient(100deg,#3B82F6_10%,#0D9488_15%,#1D4ED8_20%,#7C3AED_25%,#0284C7_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[20px] invert-0 dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-soft-light
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,
						showRadialGradient &&
							`[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,transparent_60%)]`,
					)}
				/>
			</div>
			{children}
		</div>
	)
}

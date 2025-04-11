// components/ui/Button.tsx
import { cn } from '@/app/utilities/cn'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import * as React from 'react'

const buttonStyles = cva(
	'inline-flex items-center  min-w-[100px]  justify-center whitespace-nowrap font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			color: {
				light: 'bg-primary-100 border-primary-100',
				brand: 'bg-brand-500 border-brand-500',
				dark: 'bg-primary-900 border-primary-900',
				gradient: 'bg-gradient-to-r from-[#BDDDD4] to-[#80C6B2] border-primary-500',
			},
			text: {
				brand: 'text-brand-800',
				dark: 'text-black',
				light: 'text-white',
			},
			size: {
				large: 'px-3 py-2 fl-text-step--2 font-semibold rounded-[11px]', // Large button with 17px rounding
				icon: 'p-2 rounded-full', // Icon-only button with full rounding
			},
			variant: {
				primary: '', // No extra styling, default look
				ghost: 'bg-transparent text-inherit shadow-none hover:shadow-none', // Transparent, with text or icon only
				outline: ' bg-primary/5  backdrop-blur-md border', // Transparent, with border
			},
		},
		defaultVariants: {
			color: 'brand',
			text: 'light',
			size: 'large',
			variant: 'primary',
		},
	},
)

export interface ButtonProps extends VariantProps<typeof buttonStyles> {
	asChild?: boolean
	color?: 'light' | 'brand' | 'dark' | 'gradient'
	text?: 'brand' | 'dark' | 'light'
	size?: 'large' | 'icon'
	variant?: 'primary' | 'ghost' | 'outline'
	href?: string
}

type ConditionalButtonProps = ButtonProps &
	(ButtonProps['href'] extends string
		? React.AnchorHTMLAttributes<HTMLAnchorElement>
		: React.ButtonHTMLAttributes<HTMLButtonElement>)

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ConditionalButtonProps>(
	(
		{
			className,
			color,
			text,
			size = 'large',
			variant = 'primary',
			asChild = false,
			href,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button'

		const buttonContent = (
			<Comp
				className={cn(
					buttonStyles({ color, text, size, variant, className }),
					'lg:hover:scale-105 lg:hover:opacity-90 lg:duration-150 lg:ease-in-out lg:hover:bg-opacity-80', // Hover effects restricted to large screens only
				)}
				ref={ref as any} // Casting ref to any to accommodate both button and anchor refs
				{...props}
			/>
		)

		return href ? (
			<Link href={href} passHref>
				{buttonContent}
			</Link>
		) : (
			buttonContent
		)
	},
)

Button.displayName = 'Button'

export { Button, buttonStyles }

import { cn } from '@/app/utilities/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const cardVariants = cva('rounded-xl shadow-sm border card-transition', {
	variants: {
		variant: {
			primary:
				'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 card-hover touch-card',
			secondary:
				'bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-primary-100 card-hover touch-card ring-1 ring-accent-700 dark:ring-accent-200 shadow-md backdrop-blur-md',
			review:
				'border-primary-200 dark:border-primary-700 shadow-md card-hover touch-card bg-white/[.8] dark:bg-primary-950/[.8] backdrop-blur-sm',
			light:
				'bg-white border-primary-50 border-2 rounded-[20px] card-hover touch-card shadow-[0px_4px_36px_0px_#e8f5f0]',
			'moving-border':
				'relative overflow-hidden bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-100 card-hover touch-card',
		},
		size: {
			sm: 'p-4',
			md: 'p-6',
			lg: 'p-8',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
	},
})

export interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, size, ...props }, ref) => {
		return <div ref={ref} className={cn(cardVariants({ variant, size, className }))} {...props} />
	},
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
	),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h3
			ref={ref}
			className={cn(
				'fl-text-step-2 font-bold tracking-tight font-sans text-primary-900 dark:text-primary-100',
				className,
			)}
			{...props}
		/>
	),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('fl-text-step-0 font-sans text-accent-600 dark:text-accent-300', className)}
		{...props}
	/>
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => <div ref={ref} className={cn('mt-4', className)} {...props} />,
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('flex items-center mt-4', className)} {...props} />
	),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

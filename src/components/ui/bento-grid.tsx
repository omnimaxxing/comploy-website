import { cn } from '@/app/utilities/cn'
export const BentoGrid = ({
	className,
	children,
}: {
	className?: string
	children?: React.ReactNode
}) => {
	return (
		<div
			className={cn(
				'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ',
				className,
			)}
		>
			{children}
		</div>
	)
}

export const BentoGridItem = ({
	className,
	title,
	description,
	header,
	icon,
}: {
	className?: string
	title?: string | React.ReactNode
	description?: string | React.ReactNode
	header?: React.ReactNode
	icon?: React.ReactNode
}) => {
	return (
		<div
			className={cn(
				'row-span-1 rounded-xl group/bento  transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4',
				className,
			)}
		>
			{header}
			<div className="group-hover/bento:translate-x-2 transition duration-200">
				{icon}
				<div className="font-sans fl-text-step-1 font-medium  mb-2 mt-2">{title}</div>
				<p className="fl-text-step-0 ">{description}</p>
			</div>
		</div>
	)
}

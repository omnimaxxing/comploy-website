import Link from 'next/link'
import { cn } from '@heroui/react'
import { Tag as PayloadTag } from '@/payload-types'

export type TagColor =
	| 'blue'
	| 'green'
	| 'red'
	| 'purple'
	| 'yellow'
	| 'orange'
	| 'pink'
	| 'gray'
	| undefined

export interface TagProps {
	tag: {
		id: string | number
		name: string
		slug?: string
		color?: TagColor
	}
	showHash?: boolean
	className?: string
}

/**
 * Tag component for displaying colored tags based on the Tags collection
 */
export const Tag = ({ tag, showHash = true, className }: TagProps) => {
	const { name, slug, color } = tag

	// Generate the tag URL if not explicitly provided
	const tagUrl = `/plugins/all?tag=${slug || name.toLowerCase().replace(/\s+/g, '-')}`

	// Base component that will be wrapped with Link if needed
	const TagContent = () => (
		<span
			className={cn(
				'inline-flex items-center rounded-none bg-black px-1.5 py-0.5 text-xs hover:bg-white/5 transition-colors',
				{
					'border border-blue-500/40 text-blue-400/90': color === 'blue',
					'border border-green-500/40 text-green-400/90': color === 'green',
					'border border-red-500/40 text-red-400/90': color === 'red',
					'border border-purple-500/40 text-purple-400/90': color === 'purple',
					'border border-yellow-500/40 text-yellow-400/90': color === 'yellow',
					'border border-orange-500/40 text-orange-400/90': color === 'orange',
					'border border-pink-500/40 text-pink-400/90': color === 'pink',
					'border border-gray-500/40 text-gray-400/90': color === 'gray',
					'border border-white/20 text-white/70': !color,
				},
				className,
			)}
		>
			{showHash && (
				<span
					className={cn('mr-0.5', {
						'text-blue-400/60': color === 'blue',
						'text-green-400/60': color === 'green',
						'text-red-400/60': color === 'red',
						'text-purple-400/60': color === 'purple',
						'text-yellow-400/60': color === 'yellow',
						'text-orange-400/60': color === 'orange',
						'text-pink-400/60': color === 'pink',
						'text-gray-400/60': color === 'gray',
						'text-white/50': !color,
					})}
				>
					#
				</span>
			)}
			{name}
		</span>
	)

	// Always make it a link, using name as fallback for slug
	return (
		<Link href={tagUrl}>
			<TagContent />
		</Link>
	)
}

export default Tag

import { cn } from '@heroui/react'
import type { Tag as PayloadTag } from '@/payload-types'
import { Tag, type TagProps, type TagColor } from './tag'

interface TagListProps {
	tags: (number | PayloadTag | TagProps['tag'] | null)[]
	className?: string
	showHash?: boolean
}

export const TagList = ({ tags, className, showHash = true }: TagListProps) => {
	return (
		<div className={cn('flex flex-wrap gap-1', className)}>
			{tags.map((tag) => {
				// Handle numeric IDs (references to tags that need to be loaded)
				if (typeof tag === 'number') {
					return null // Skip numeric references as they should be populated
				}

				// Skip null tags
				if (!tag) return null

				// Handle Payload Tag objects
				if (typeof tag === 'object' && 'id' in tag && 'name' in tag) {
					return (
						<Tag
							key={String(tag.id)}
							tag={{
								id: String(tag.id),
								name: tag.name || '',
								slug: tag.slug || undefined,
								color: (tag.color || undefined) as TagColor,
							}}
							showHash={showHash}
						/>
					)
				}

				// Handle regular tag objects
				if (typeof tag === 'object' && tag !== null && 'name' in tag && 'id' in tag) {
					const tagObj = tag as { id: string | number; name: string; slug?: string; color?: string }
					return (
						<Tag
							key={tagObj.name || String(tagObj.id)}
							tag={{
								id: tagObj.id,
								name: tagObj.name || '',
								slug: tagObj.slug || undefined,
								color: (tagObj.color || undefined) as TagColor,
							}}
							showHash={showHash}
						/>
					)
				}

				return null
			})}
		</div>
	)
}

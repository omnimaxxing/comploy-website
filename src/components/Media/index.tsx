import type React from 'react'
import { Fragment } from 'react'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import type { Props } from './types'

export const Media: React.FC<Props> = (props) => {
	const { className, htmlElement = 'div', resource } = props

	const isVideo =
		typeof resource === 'object' && 'mimeType' in resource && resource.mimeType?.includes('video')
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const Tag = (htmlElement as any) || Fragment

	return (
		<Tag
			{...(htmlElement !== null
				? {
						className,
					}
				: {})}
		>
			{isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
		</Tag>
	)
}

'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/utilities/cn'

interface BlurImageProps extends Omit<ImageProps, 'placeholder'> {
	blurDataUrl?: string
}

export default function BlurImage({ blurDataUrl, className, ...props }: BlurImageProps) {
	const [isLoading, setLoading] = useState(true)
	const placeholderBlurHash = 'data:image/png;base64,.....'

	return (
		<Image
			{...props}
			placeholder="blur"
			blurDataURL={blurDataUrl || placeholderBlurHash}
			onLoad={() => setLoading(false)}
			className={cn(className, 'duration-700 ease-in-out', isLoading ? 'blur-lg' : 'blur-0')}
		/>
	)
}

'use client'

import { useCallback } from 'react'
import type { Showcase } from '@/payload-types'
import { ShowcaseGallery } from './ShowcaseGallery'

interface ShowcaseWrapperProps {
	initialShowcases: Showcase[]
	totalPages: number
}

export function ShowcaseWrapper({ initialShowcases, totalPages }: ShowcaseWrapperProps) {
	const handleLoadMore = useCallback(async (page: number) => {
		const response = await fetch(
			`/api/showcases?page=${page}&limit=12&where[_status][equals]=published&depth=2&sort=-createdAt`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch more showcases')
		}
		const data = await response.json()
		return {
			docs: data.docs,
			hasNextPage: data.hasNextPage,
		}
	}, [])

	return (
		<ShowcaseGallery
			showcases={initialShowcases}
			totalPages={totalPages}
			currentPage={1}
			onLoadMore={handleLoadMore}
		/>
	)
}

'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

// This component will be used as an afterInput component in Payload CMS
const CharacterCounter = (props: any) => {
	const { path } = props
	const { value } = useField({ path })
	const [charCount, setCharCount] = useState(0)

	// Try to determine if this is a title or description field based on the field name
	const fieldPath = path || ''
	const isTitle = fieldPath.includes('title')
	const minChars = isTitle ? 50 : 150
	const maxChars = isTitle ? 60 : 160

	// Calculate the status color based on character count
	const getStatusColor = (count: number) => {
		if (count < minChars) return '#f59e0b' // yellow
		if (count > maxChars) return '#ef4444' // red
		return '#10b981' // green
	}

	// Update character count when the field value changes
	useEffect(() => {
		if (typeof value === 'string') {
			setCharCount(value.length)
		} else {
			setCharCount(0)
		}
	}, [value])

	// Always render the counter
	return (
		<div style={{ marginTop: '8px', fontSize: '14px' }}>
			<span style={{ color: getStatusColor(charCount) }}>
				{charCount} characters
				{charCount > 0 && (
					<>
						{charCount < minChars && ` (${minChars - charCount} below recommended minimum)`}
						{charCount > maxChars && ` (${charCount - maxChars} above recommended maximum)`}
						{charCount >= minChars && charCount <= maxChars && ' (optimal length)'}
					</>
				)}
			</span>
		</div>
	)
}

export default CharacterCounter

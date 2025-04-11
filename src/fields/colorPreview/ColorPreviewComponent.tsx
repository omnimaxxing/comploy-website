'use client'
import { useField } from '@payloadcms/ui'
import type { ClientFieldProps } from 'payload'
import React from 'react'

import './index.scss'

interface ColorPreviewProps {
	path: string
	value?: {
		hexCode: string
	}
}

export const ColorPreviewComponent: React.FC<ColorPreviewProps> = ({ path }) => {
	const { value } = useField<{ hexCode: string }>({ path })
	const hexCode = value?.hexCode || '#000000'

	return (
		<div className="color-preview-field">
			<div
				className="color-preview-swatch"
				style={{
					backgroundColor: hexCode,
				}}
			/>
		</div>
	)
}

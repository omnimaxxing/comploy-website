'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import CharacterCounter from '../CharacterCounter'

type SEOFieldProps = {
	name: string
	label: string
	path: string
	required?: boolean
	minLength?: number
	maxLength?: number
	fieldType?: 'text' | 'textarea'
	description?: string
}

export const SEOField: React.FC<SEOFieldProps> = ({
	name,
	label,
	path,
	required = false,
	minLength = 0,
	maxLength = 100,
	fieldType = 'text',
	description,
}) => {
	const fullPath = path ? `${path}.${name}` : name

	return (
		<div className="field-type">
			{fieldType === 'text' ? (
				<div className="field-description">{description}</div>
			) : (
				<div className="field-description">{description}</div>
			)}
			<CharacterCounter path={fullPath} recommendedMin={minLength} recommendedMax={maxLength} />
		</div>
	)
}

export default SEOField

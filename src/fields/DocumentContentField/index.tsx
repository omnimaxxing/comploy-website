'use client'

import React from 'react'
import { Icon } from '@iconify/react'
import './DocumentContentField.scss'

// This component is used as a custom Label component in the admin UI
const DocumentContentField = (props) => {
	// Extract the label from the field
	const label = props.label || 'Document Content'

	return (
		<div className="document-content-header">
			<Icon icon="mdi:file-document-edit-outline" className="content-icon" />
			<h3 className="content-label">{label}</h3>
		</div>
	)
}

export default DocumentContentField

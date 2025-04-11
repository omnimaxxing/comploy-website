'use client'
import { Button, FieldLabel, TextInput, useField, useForm, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import type React from 'react'
import { useCallback, useEffect } from 'react'

import { formatSlug } from './formatSlug'
import './index.scss'

type SlugComponentProps = {
	fieldsToUse: string[]
	checkboxFieldPath: string
} & TextFieldClientProps

export const SlugComponent: React.FC<SlugComponentProps> = ({
	field,
	fieldsToUse,
	checkboxFieldPath: checkboxFieldPathFromProps,
	path,
	readOnly: readOnlyFromProps,
}) => {
	const { label } = field

	const checkboxFieldPath = path?.includes('.')
		? `${path}.${checkboxFieldPathFromProps}`
		: checkboxFieldPathFromProps

	const { value, setValue } = useField<string>({ path: path || field.name })

	const { dispatchFields } = useForm()

	const checkboxValue = useFormFields(([fields]) => fields[checkboxFieldPath]?.value as string)

	const targetFieldValues = useFormFields(([fields]) =>
		fieldsToUse.map((field) => fields[field]?.value as string).filter(Boolean),
	)

	useEffect(() => {
		if (checkboxValue) {
			const formattedSlug = targetFieldValues.map(formatSlug).join('-')
			if (value !== formattedSlug) setValue(formattedSlug)
		}
	}, [targetFieldValues, checkboxValue, setValue, value])

	const handleLock = useCallback(
		(e) => {
			e.preventDefault()
			dispatchFields({
				type: 'UPDATE',
				path: checkboxFieldPath,
				value: !checkboxValue,
			})
		},
		[checkboxValue, checkboxFieldPath, dispatchFields],
	)

	const readOnly = readOnlyFromProps || checkboxValue

	return (
		<div className="field-type slug-field-component">
			<div className="label-wrapper">
				<FieldLabel htmlFor={`field-${path}`} label={label} />

				<Button className="lock-button" buttonStyle="none" onClick={handleLock}>
					{checkboxValue ? 'Unlock' : 'Lock'}
				</Button>
			</div>

			<TextInput
				value={value}
				onChange={setValue}
				path={path || field.name}
				readOnly={Boolean(readOnly)}
			/>
		</div>
	)
}

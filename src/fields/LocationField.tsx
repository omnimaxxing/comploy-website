'use client'

import { useEffect, useState } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useField, useFormFields } from '@payloadcms/ui'

declare global {
	interface Window {
		google: any
	}
}

const LocationField: React.FC<TextFieldClientProps> = (props) => {
	const { field, path = '' } = props

	const { setValue } = useField<string>({ path })
	const { dispatchFields } = useFormFields(([fields, dispatch]) => ({ dispatchFields: dispatch }))
	const [address, setAddress] = useState('')
	const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

	const currentPath = path.split(/\.(?=[^.]+$)/)[0]
	const latitudePath = path.includes('.') ? `${currentPath}.latitude` : 'latitude'
	const longitudePath = path.includes('.') ? `${currentPath}.longitude` : 'longitude'
	const displayAddressPath = path.includes('.') ? `${currentPath}.displayAddress` : 'displayAddress'

	useEffect(() => {
		if (!window.google) {
			const script = document.createElement('script')
			script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
			script.async = true
			script.defer = true
			document.head.appendChild(script)

			script.onload = initializeAutocomplete
			return () => {
				document.head.removeChild(script)
			}
		} else {
			initializeAutocomplete()
		}
	}, [])

	const initializeAutocomplete = () => {
		const input = document.getElementById('location-search') as HTMLInputElement
		if (!input) return

		const autoCompleteInstance = new google.maps.places.Autocomplete(input, {
			types: ['address'],
			fields: ['geometry', 'formatted_address'],
		})

		autoCompleteInstance.addListener('place_changed', () => {
			const place = autoCompleteInstance.getPlace()

			if (place.geometry?.location) {
				const lat = place.geometry.location.lat()
				const lng = place.geometry.location.lng()
				const formattedAddress = place.formatted_address

				// Update using Payload's form fields system
				dispatchFields({
					type: 'UPDATE',
					path: latitudePath,
					value: lat,
				})

				dispatchFields({
					type: 'UPDATE',
					path: longitudePath,
					value: lng,
				})

				dispatchFields({
					type: 'UPDATE',
					path: displayAddressPath,
					value: formattedAddress || '',
				})

				setAddress(formattedAddress || '')
				setValue(formattedAddress || '')
			}
		})

		setAutocomplete(autoCompleteInstance)
	}

	if (!path) return null

	return (
		<div>
			<p style={{ marginBottom: '0' }}>
				{typeof field.label === 'string' ? field.label : 'Location'}
			</p>
			<p style={{ color: 'var(--theme-elevation-400)', marginBottom: '0.75rem' }}>
				Search for an address to automatically set the coordinates.
			</p>

			<input
				id="location-search"
				type="text"
				name={path}
				className="field-input"
				value={address}
				onChange={(e) => {
					setAddress(e.target.value)
					setValue(e.target.value)
				}}
				placeholder="Type an address..."
				style={{
					width: '100%',
					marginBottom: '1rem',
				}}
			/>

			{address && (
				<div
					style={{
						padding: '0.75rem',
						background: 'var(--theme-elevation-50)',
						borderRadius: '4px',
						marginBottom: '1rem',
					}}
				>
					<p
						style={{
							margin: '0',
							color: 'var(--theme-elevation-800)',
							fontSize: '0.9rem',
						}}
					>
						Selected Address: {address}
					</p>
				</div>
			)}
		</div>
	)
}

export default LocationField

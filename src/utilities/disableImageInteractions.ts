// src/components/ImageInteractionDisabler.tsx
'use client'

import { useEffect } from 'react'


const ImageInteractionDisabler = () => {
	useEffect(() => {
		const disableRightClick = (e: MouseEvent) => {
			if ((e.target as HTMLElement).tagName === 'IMG') {
				e.preventDefault()
			}
		}

		const disableDragStart = (e: DragEvent) => {
			if ((e.target as HTMLElement).tagName === 'IMG') {
				e.preventDefault()
			}
		}

		document.addEventListener('contextmenu', disableRightClick)
		document.addEventListener('dragstart', disableDragStart)

		return () => {
			document.removeEventListener('contextmenu', disableRightClick)
			document.removeEventListener('dragstart', disableDragStart)
		}
	}, [])

	return null
}

export default ImageInteractionDisabler

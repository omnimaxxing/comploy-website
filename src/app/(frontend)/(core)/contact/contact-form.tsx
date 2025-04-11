'use client'
import React, { useRef, useState, useTransition, useEffect } from 'react'
import { submitContactForm, enhancedSubmitContact } from '@/actions/contact'
import { Icon } from '@iconify/react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { toast } from 'sonner'
// Form status component for better UX
function FormStatus() {
	const { pending } = useFormStatus()

	if (!pending) return null

	return (
		<div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-none">
			<div className="flex flex-col items-center bg-background/80 p-4 rounded-md shadow-lg">
				<Icon icon="heroicons:arrow-path" className="w-10 h-10 text-foreground animate-spin mb-3" />
				<p className="text-sm font-medium">Processing submission...</p>
			</div>
		</div>
	)
}

// Input field with validation
function FormField({
	id,
	label,
	icon,
	type = 'text',
	placeholder,
	required = true,
	error,
	rows,
	onChange,
	value = '',
	resetKey,
}: {
	id: string
	label: string
	icon: string
	type?: string
	placeholder: string
	required?: boolean
	error: string | null
	rows?: number
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	value?: string
	resetKey?: number
}) {
	const [isFocused, setIsFocused] = useState(false)
	const [isTouched, setIsTouched] = useState(false)
	const [localError, setLocalError] = useState<string | null>(null)
	const [fieldValue, setFieldValue] = useState(value)

	// Reset field when resetKey changes
	useEffect(() => {
		setFieldValue('')
		setIsTouched(false)
		setLocalError(null)
	}, [resetKey])

	const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setIsFocused(false)
		setIsTouched(true)

		// Client-side validation when field loses focus
		if (required && !e.target.value.trim()) {
			setLocalError('This field is required')
		} else if (
			id === 'email' &&
			e.target.value.trim() &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
		) {
			setLocalError('Please enter a valid email address')
		} else {
			setLocalError(null)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFieldValue(e.target.value)
		onChange(e)

		// Clear error when user starts typing again
		if (localError) setLocalError(null)
	}

	// Use server error if available, otherwise use local client-side error
	const displayError = error || localError

	const inputProps = {
		id,
		name: id,
		type,
		required,
		value: fieldValue,
		onFocus: () => setIsFocused(true),
		onBlur: handleBlur,
		onChange: handleChange,
		placeholder,
		className: `w-full pl-10 py-2.5 bg-transparent border ${
			displayError && isTouched
				? 'border-rose-500'
				: isFocused
				  ? 'border-foreground'
				  : 'border-foreground/30'
		} outline-none focus:border-foreground transition-all rounded-none`,
		'aria-invalid': displayError && isTouched ? true : false,
		'aria-describedby': displayError && isTouched ? `${id}-error` : undefined,
	}

	return (
		<div className="relative group">
			<label
				htmlFor={id}
				className="block text-sm font-medium mb-1.5 text-foreground/80 flex justify-between"
			>
				<span>
					{label} {required && <span className="text-rose-500">*</span>}
				</span>
				{isTouched && displayError && (
					<span id={`${id}-error`} className="text-rose-500 text-xs font-normal animate-fadeIn">
						{displayError}
					</span>
				)}
			</label>
			<div className="relative">
				{rows ? (
					<textarea {...inputProps} rows={rows} className={`${inputProps.className} resize-none`} />
				) : (
					<input {...inputProps} />
				)}
				<div
					className={`absolute ${rows ? 'top-3' : 'inset-y-0'} left-0 pl-3 flex ${
						rows ? 'items-start' : 'items-center'
					} pointer-events-none ${
						isFocused ? 'text-foreground' : 'text-foreground/50'
					} transition-colors`}
				>
					<Icon icon={`heroicons:${icon}`} className="w-5 h-5" />
				</div>
				{isTouched && !displayError && fieldValue.trim() !== '' && (
					<div className="absolute inset-y-0 right-3 flex items-center text-green-500">
						<Icon icon="heroicons:check-circle" className="w-5 h-5" />
					</div>
				)}
			</div>
		</div>
	)
}

export function ContactForm() {
	const formRef = useRef<HTMLFormElement>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formKey, setFormKey] = useState(0) // Key to force form reset
	const [formValues, setFormValues] = useState({
		fullName: '',
		email: '',
		message: '',
	})

	// Form state with server validation
	const [formState, formAction] = useActionState(enhancedSubmitContact, {
		success: false,
		error: null,
		fieldErrors: { fullName: null, email: null, message: null },
	})

	// Handle form submission with client-side state management
	const handleFormAction = async (formData: FormData) => {
		setIsSubmitting(true)

		try {
			// Call the server action and wait for the state to update
			await formAction(formData)

			// Check the updated state after the action completes
			if (formState.success) {
				// Success - show toast and reset the form
				toast.success(formState.message || "Thank you for your message! We'll be in touch shortly.")

				// Reset form state
				setFormValues({ fullName: '', email: '', message: '' })
				setFormKey((prev) => prev + 1) // Force field components to reset
				formRef.current?.reset()
			} else if (formState.error) {
				// General error
				toast.error(formState.error)
			}
			// Field errors are handled by the individual fields
		} catch (error) {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormValues((prev) => ({ ...prev, [name]: value }))
	}

	return (
		<div className="relative w-full">
			<form
				ref={formRef}
				action={handleFormAction}
				className="w-full space-y-5"
				autoComplete="on"
				aria-label="Contact form"
			>
				{/* Overlay for form submission state */}
				{isSubmitting && (
					<div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-none">
						<div className="flex flex-col items-center bg-background/80 p-4 rounded-md shadow-lg">
							<Icon
								icon="heroicons:arrow-path"
								className="w-10 h-10 text-foreground animate-spin mb-3"
							/>
							<p className="text-sm font-medium">Processing submission...</p>
						</div>
					</div>
				)}

				<FormField
					id="fullName"
					label="Full Name"
					icon="user"
					placeholder="John Doe"
					error={formState?.fieldErrors?.fullName}
					onChange={handleInputChange}
					value={formValues.fullName}
					resetKey={formKey}
				/>

				<FormField
					id="email"
					label="Email"
					icon="envelope"
					type="email"
					placeholder="john@example.com"
					error={formState?.fieldErrors?.email}
					onChange={handleInputChange}
					value={formValues.email}
					resetKey={formKey}
				/>

				<FormField
					id="message"
					label="Message"
					icon="chat-bubble-left-text"
					placeholder="How can we help you?"
					rows={5}
					error={formState?.fieldErrors?.message}
					onChange={handleInputChange}
					value={formValues.message}
					resetKey={formKey}
				/>

				<div className="pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full h-12 relative rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg flex items-center justify-center group overflow-hidden disabled:opacity-70"
						aria-disabled={isSubmitting}
					>
						<span className="relative z-10 flex items-center">
							{isSubmitting ? (
								<>
									<Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Icon
										icon="heroicons:paper-airplane"
										className="w-5 h-5 mr-2 transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
									/>
									Send Message
								</>
							)}
						</span>
						<span className="absolute inset-0 bg-gradient-to-r from-foreground to-foreground/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
					</button>
				</div>
			</form>
		</div>
	)
}

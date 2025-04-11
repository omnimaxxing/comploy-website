'use client'

import { Button } from '@/components/ui/Button'
import { Icon } from '@iconify/react'

import { useActionState } from 'react'

import { Input } from '@heroui/react'
import { useFormState, useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { subscribeToNewsletter } from '../actions/newsletter'

interface NewsletterFormProps {
	buttonText?: string
}

function SubmitButton({ buttonText }: { buttonText: string }) {
	const { pending } = useFormStatus()

	return (
		<Button variant="primary" text="dark" color="gradient" type="submit" disabled={pending}>
			{pending ? 'Subscribing...' : buttonText}
		</Button>
	)
}

export default function NewsletterForm({ buttonText = 'Join Now' }: NewsletterFormProps) {
	const [state, action] = useActionState(subscribeToNewsletter, null)

	// Show toast when state changes
	if (state) {
		if (state.error) {
			toast.error(state.error)
		} else if (state.success) {
			toast.success('Successfully subscribed!', {
				description: 'Welcome to the OmniPixel newsletter.',
			})
		}
	}

	return (
		<form action={action} className="mt-6 sm:flex sm:max-w-md lg:mt-0">
			<Input
				isRequired
				aria-label="Email"
				autoComplete="email"
				id="email-address"
				labelPlacement="outside"
				name="email-address"
				placeholder="johndoe@email.com"
				startContent={<Icon className="text-default-500" icon="solar:letter-linear" />}
				type="email"
			/>
			<div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
				<SubmitButton buttonText={buttonText} />
			</div>
		</form>
	)
}

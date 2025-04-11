'use client'

import { Button } from '@/components/ui/Button'
import { Input, Link } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

type FormState = { error?: string } | null

export default function ForgotPasswordForm({
	forgotPasswordAction,
}: {
	forgotPasswordAction: (prevState: FormState, formData: FormData) => Promise<FormState>
}) {
	const router = useRouter()
	const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, null)

	// Show toast when state changes
	if (state?.error) {
		toast.error(state.error)
	}

	return (
		<>
			{state?.error && (
				<div className="w-full rounded-md bg-danger-50 p-3 text-danger text-small">
					{state.error}
				</div>
			)}

			<form action={action} className="space-y-4">
				<Input label="Email" name="email" type="email" variant="underlined" required />
				<Button type="submit" variant="primary" className="w-full">
					Send Reset Link
				</Button>
			</form>

			<p className="text-center text-small">
				Remember your password?&nbsp;
				<Link href="/auth/login" size="sm">
					Log In
				</Link>
			</p>
		</>
	)
}

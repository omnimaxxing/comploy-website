'use client'

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { Input, Link } from '@heroui/react'
type FormState = { error?: string } | null

export default function ResetPasswordForm({
	resetPasswordAction,
	token,
}: {
	resetPasswordAction: (prevState: FormState, formData: FormData) => Promise<FormState>
	token: string
}) {
	const router = useRouter()
	const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, null)

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
				<input type="hidden" name="token" value={token} />
				<Input
					label="New Password"
					name="password"
					placeholder="Enter your new password"
					type="password"
					variant="underlined"
					required
				/>
				<Input
					label="Confirm Password"
					name="confirmPassword"
					placeholder="Confirm your new password"
					type="password"
					variant="underlined"
					required
				/>
				<Button type="submit" variant="primary" className="w-full">
					Reset Password
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

// Assuming you are in the `/app` directory structure and this is a Client Component.
// Add "use client" at the top to allow hooks in this component.
'use client'

import { useSearchParams } from 'next/navigation'

const CustomLogin = () => {
	const searchParams = useSearchParams()
	const error = searchParams.get('error')

	return (
		<div style={{ textAlign: 'center', marginTop: '100px' }}>
			<h1>Sign In</h1>
			{error && (
				<div style={{ color: 'red', marginBottom: '20px' }}>
					{error === 'Unauthorized'
						? 'You are not authorized to log in with this account.'
						: 'An error occurred, please try again.'}
				</div>
			)}
			<a href="/api/users/oauth/google" style={{ textDecoration: 'none' }}>
				<button
					style={{
						backgroundColor: '#4285F4',
						color: '#fff',
						border: 'none',
						padding: '10px 15px',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '14px',
						marginTop: '20px',
					}}
				>
					Sign in with Google
				</button>
			</a>
		</div>
	)
}

export default CustomLogin

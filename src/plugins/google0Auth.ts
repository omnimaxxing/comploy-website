import crypto from 'crypto'
import { OAuth2Plugin, defaultGetToken } from '@omnipixel/payload-oauth2-plus'
// plugins/googleOAuth.ts
import { PayloadRequest } from 'payload'

export const googleOAuth = OAuth2Plugin({
	enabled:
		typeof process.env.GOOGLE_CLIENT_ID === 'string' &&
		typeof process.env.GOOGLE_CLIENT_SECRET === 'string',
	strategyName: 'google',
	useEmailAsIdentity: true,
	serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
	clientId: process.env.GOOGLE_CLIENT_ID || '',
	clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
	authorizePath: '/oauth/google',
	callbackPath: '/oauth/google/callback',
	authCollection: 'users',
	tokenEndpoint: 'https://oauth2.googleapis.com/token',
	scopes: [
		'openid',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile',
	],
	providerAuthorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',

	getUserInfo: async (accessToken: string, req: PayloadRequest) => {
		const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		const googleUser = await response.json()

		// Check if the user exists
		const existingUser = await req.payload.find({
			collection: 'users',
			where: {
				email: {
					equals: googleUser.email,
				},
			},
			limit: 1,
		})

		// If user doesn't exist, create a new one
		if (!existingUser.docs || existingUser.docs.length === 0) {
			// Generate a secure random password for Google OAuth users
			const randomPassword = crypto.randomBytes(32).toString('hex')

			const newUser = await req.payload.create({
				collection: 'users',
				data: {
					email: googleUser.email,
					firstName: googleUser.given_name,
					lastName: googleUser.family_name,
					name: `${googleUser.given_name} ${googleUser.family_name}`,
					password: randomPassword, // Add secure random password
					roles: ['customer'], // Default role for Google OAuth users
					origin: 'google', // Set the origin for Google OAuth users
				},
			})
			return {
				...newUser,
				roles: ['customer'],
			}
		}

		// Return existing user
		const userFromDB = existingUser.docs[0]
		return {
			email: googleUser.email,
			firstName: googleUser.given_name,
			lastName: googleUser.family_name,
			name: `${googleUser.given_name} ${googleUser.family_name}`,
			roles: userFromDB.roles || ['customer'],
		}
	},

	getToken: async (code: string, req: PayloadRequest) => {
		const redirectUri = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/users/oauth/google/callback`
		const token = await defaultGetToken(
			'https://oauth2.googleapis.com/token',
			process.env.GOOGLE_CLIENT_ID || '',
			process.env.GOOGLE_CLIENT_SECRET || '',
			redirectUri,
			code,
		)
		return token
	},

	successRedirect: (req) => {
		// Check for redirect_after parameter
		const redirectAfter = req.query?.redirect_after
		if (typeof redirectAfter === 'string' && redirectAfter.startsWith('/')) {
			return redirectAfter
		}

		// Default redirects
		const user = req.user
		if (user && Array.isArray(user.roles)) {
			if (user.roles.includes('admin')) {
				return '/admin'
			}
		}
		return '/' // Default redirect for customers
	},

	failureRedirect: (req, err) => {
		req.payload.logger.error(err)
		return '/login?error=google-auth-failed'
	},
})

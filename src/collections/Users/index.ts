import { admins } from '@/access/admins'
import { adminsAndUser } from '@/access/adminsAndUser'
import { anyone } from '@/access/anyone'
import { checkRole } from '@/access/checkRole'
import type { User } from '@/payload-types'

import type { CollectionConfig } from 'payload'
import { sendPasswordResetEmail, sendAdminAccessEmail } from '@/emails/hooks/sendEmails'
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { sendAccountCreationEmail } from '@/emails/hooks/sendEmails'
import { loginAfterCreate } from './hooks/loginAfterCreate'
//import { loginAfterCreate } from './hooks/loginAfterCreate'

export const Users: CollectionConfig = {
	slug: 'users',
	access: {
		admin: ({ req: { user } }) => checkRole(['admin'], user),
		create: anyone,
		delete: admins,
		read: adminsAndUser,
		update: adminsAndUser,
	},
	admin: {
		defaultColumns: ['name', 'email', 'roles', 'origin'],
		useAsTitle: 'name',
	},
	auth: {
		forgotPassword: {
			generateEmailHTML: (args) => {
				if (!args?.req || !args?.token || !args?.user) {
					throw new Error('Missing required parameters for password reset email')
				}
				sendPasswordResetEmail(args.req.payload, args.user, args.token)
				return 'Password reset email sent.'
			},
		},
	},
	endpoints: [],
	fields: [
		{
			name: 'name',
			type: 'text',
			required: false,
			label: 'Full Name',
		},
		{
			name: 'firstName',
			type: 'text',
			required: false,
			label: 'First Name',
		},
		{
			name: 'lastName',
			type: 'text',
			required: false,
			label: 'Last Name',
		},
		{
			name: 'email',
			type: 'email',
			required: true,
			label: 'Email',
		},
		{
			name: 'phone',
			type: 'text',
			required: false,
			label: 'Phone Number',
		},
		{
			name: 'roles',
			type: 'select',
			access: {
				/* create: admins, */
				read: admins,
				update: admins,
			},
			defaultValue: ['user'],
			hasMany: true,
			hooks: {
				beforeChange: [ensureFirstUserIsAdmin],
			},
			options: [
				{
					label: 'admin',
					value: 'admin',
				},
				{
					label: 'user',
					value: 'user',
				},
			],
		},

		{
			name: 'origin',
			type: 'select',
			required: true,
			defaultValue: 'manual',
			options: [
				{ label: 'Manual', value: 'manual' },
				{ label: 'Google', value: 'google' },
				{ label: 'Apple', value: 'apple' },
			],
			admin: {
				description: 'Where this account originated from',
			},
		},
	],
	hooks: {
		afterChange: [
			async (args) => {
				if (args.operation === 'create') {
					await loginAfterCreate(args)
				}
			},
		],
	},
	timestamps: true,
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URI: string
			S3_ACCESS_KEY_ID: string
			S3_SECRET_ACCESS_KEY: string
			S3_BUCKET: string
			S3_REGION: string
			S3_ENDPOINT: string
			REPLICATE_API_TOKEN: string
			EMAIL_FROM_ADDRESS: string
			EMAIL_FROM_NAME: string
			RESEND_API_KEY: string
			PAYLOAD_PUBLIC_SERVER_URL: string
			PAYLOAD_SECRET: string
			NEXT_PUBLIC_SERVER_URL: string
			REVALIDATION_KEY: string
			NEXT_PUBLIC_VERCEL_URL: string
			NEXT_PUBLIC_ENABLE_AUTOLOGIN: string
			APPLE_CLIENT_ID: string
			APPLE_CLIENT_SECRET: string
			GOOGLE_CLIENT_ID: string
			GOOGLE_CLIENT_SECRET: string
			OPENAI_API_KEY: string
			NEXT_PUBLIC_UNICORN_PRODUCTION: string
			NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string
			RESEND_API_KEY: string
			EMAIL_FROM_NAME: string
			EMAIL_FROM_ADDRESS: string
			ADMIN_EMAIL_ADDRESS: string
			NEXT_PUBLIC_ENABLE_AUTOLOGIN: string
			WELCOME_FROM_EMAIL: string
			PASSWORD_RESET_FROM_EMAIL: string
			MAILING_LIST_FROM_EMAIL: string
			STRIPE_SECRET_KEY: string
			NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
			NEXT_PUBLIC_IS_STRIPE_TEST_KEY: boolean
			STRIPE_WEBHOOKS_SIGNING_SECRET: string

			// Add other environment variables here
		}
	}
}

// This export is necessary to make this a module
export type {}

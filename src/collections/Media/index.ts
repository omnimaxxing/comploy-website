import type { CollectionConfig } from 'payload'

import path from 'node:path'

import { fileURLToPath } from 'node:url'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
import { adminsAndUser } from '@/access/adminsAndUser'
import { anyone } from '@/access/anyone'
import { generateBlurDataURL } from './generateBlur'

export const Media: CollectionConfig = {
	slug: 'media',
	access: {
		create: anyone,
		delete: adminsAndUser,
		read: anyone,
		update: adminsAndUser,
	},
	admin: {
		group: 'Media & Files',
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			required: false,
		},
		{
			name: 'blurDataURL',
			admin: {
				hidden: true,
			},
			type: 'text',
			required: false,
		},
	],
	upload: {
		crop: true,
		focalPoint: true,
		formatOptions: {
			format: 'webp',
			options: {
				quality: 100,
			},
		},
		adminThumbnail: 'thumbnail',
		imageSizes: [
			{
				width: 300,
				height: 300,
				name: 'thumbnail',
				crop: 'center',

				formatOptions: {
					format: 'webp',
					options: {
						quality: 60,
					},
				},
			},
			{
				width: 500,
				height: 500,
				name: 'square',
				crop: 'center',
			},
			{
				width: 10, // Set this to a small size for the blur effect
				height: 10,
				crop: 'center',
				name: 'blur', // This is the size we will use for generating blurDataURL
				formatOptions: {
					format: 'webp', // You can use 'png' or 'webp' depending on your needs
					options: {
						quality: 30, // Lower quality to keep the image lightweight
					},
				},
			},
			{
				width: 1400, // New size option
				height: undefined, // Keeps the aspect ratio intact
				name: 'large', // You can name this 'large' or another identifier
				formatOptions: {
					format: 'webp', // Use 'webp' for better compression and quality
					options: {
						quality: 80, // Keeps a good balance of quality
					},
				},
				crop: 'center',
			},
			{
				width: 900, // New size option
				height: undefined, // Keeps the aspect ratio intact
				name: 'medium', // You can name this 'large' or another identifier
				formatOptions: {
					format: 'webp', // Use 'webp' for better compression and quality
					options: {
						quality: 80, // Keeps a good balance of quality
					},
				},
				crop: 'center',
			},
			{
				width: 600, // New size option
				height: undefined, // Keeps the aspect ratio intact
				name: 'small', // You can name this 'large' or another identifier
				formatOptions: {
					format: 'webp', // Use 'webp' for better compression and quality
					options: {
						quality: 80, // Keeps a good balance of quality
					},
				},
				crop: 'center',
			},
			{
				width: 1920, // New size option
				height: undefined, // Keeps the aspect ratio intact
				name: 'xlarge', // You can name this 'large' or another identifier
				formatOptions: {
					format: 'webp', // Use 'webp' for better compression and quality
					options: {
						quality: 80, // Keeps a good balance of quality
					},
				},
				crop: 'center',
			},
		],
		staticDir: path.resolve(dirname, '../../public/media'),
	},
	hooks: {
		beforeChange: [generateBlurDataURL],
	},
}

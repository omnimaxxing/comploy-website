import type { CollectionConfig } from 'payload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { adminsAndUser } from '@/access/adminsAndUser'
import { anyone } from '@/access/anyone'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const SVGs: CollectionConfig = {
	slug: 'svgs',
	access: {
		create: anyone,
		delete: adminsAndUser,
		read: anyone,
		update: adminsAndUser,
	},
	admin: {
		group: 'Media & Files',
		description: 'SVG files for logos and icons',
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			required: false,
			label: 'Alternative Text',
		},
		{
			name: 'title',
			type: 'text',
			required: false,
			label: 'SVG Title',
		},
	],
	upload: {
		staticDir: path.resolve(dirname, '../../public/svg'),
		mimeTypes: ['image/svg+xml'],
		imageSizes: [],
	},
}

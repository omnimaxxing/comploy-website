import { anyone } from '@/access/anyone'
import { admins } from '@/access/admins'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'

// Create revalidation hooks for the Items collection
const revalidateItem = async ({ doc, req }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?secret=${process.env.REVALIDATION_KEY}&collection=items&slug=${doc.slug}`)

    if (res.ok) {
      const json = await res.json()
      console.log(`Revalidated item: ${doc.slug}`, json)
    } else {
      console.error(`Error revalidating item: ${doc.slug}`, await res.text())
    }
  } catch (err) {
    console.error(`Error hitting revalidate route for item: ${doc.slug}`, err)
  }
}

const revalidateItemAfterDelete = async ({ doc, req }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?secret=${process.env.REVALIDATION_KEY}&collection=items&slug=${doc.slug}`)

    if (res.ok) {
      const json = await res.json()
      console.log(`Revalidated item after delete: ${doc.slug}`, json)
    } else {
      console.error(`Error revalidating item after delete: ${doc.slug}`, await res.text())
    }
  } catch (err) {
    console.error(`Error hitting revalidate route for item after delete: ${doc.slug}`, err)
  }
}

export const Items: CollectionConfig = {
  slug: 'items',
  labels: {
    singular: 'Item',
    plural: 'Items',
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'publishedAt', 'status'],
    description: 'Create and manage items.',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'items',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'items',
        req,
      }),
  },

  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: { placeholder: 'Item Name' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        placeholder: 'A brief description of this item.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Image to display for this item',
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Price',
      admin: {
        placeholder: '99.99',
        description: 'Price of the item (optional)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Item',
      defaultValue: false,
      admin: {
        description: 'Check to mark this as a featured item',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateItem],
    afterDelete: [revalidateItemAfterDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  timestamps: true,
} 
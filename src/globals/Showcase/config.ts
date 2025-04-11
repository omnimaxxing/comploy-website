import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { seoGroup } from '@/fields/seoGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import type { GlobalConfig } from 'payload'

const ShowcaseGlobal: GlobalConfig = {
  slug: 'showcase-global',
  label: 'Showcase Page',
  access: {
    read: anyone,
    update: admins,
  },
  admin: {
    description: 'Configure the showcase gallery page content and settings.',
    meta: {
      title: 'Showcase Page',
      description: 'Configure the showcase gallery page content and settings.',
    },
    livePreview: {
      url: ({ data }) => {
        const path = generatePreviewPath({
          global: 'showcase-global',
        })
        return `${getServerSideURL()}${path}`
      },
    },
    preview: (data) => {
      const path = generatePreviewPath({
        global: 'showcase-global',
      })
      return `${getServerSideURL()}${path}`
    },
  },
  fields: [
    {
      type: 'tabs',
      label: 'Content Sections',
      tabs: [
        {
          label: 'SEO & Metadata',
          description: 'SEO and metadata settings for the showcase page',
          fields: [seoGroup()],
        },
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: 'Hero',
              fields: [
                {
                  type: 'text',
                  name: 'title',
                  label: 'Title',
                  defaultValue: 'Showcase Gallery',
                  required: true,
                },
                {
                  type: 'textarea',
                  name: 'description',
                  label: 'Description',
                  defaultValue: "Explore websites and applications built with Payload CMS. Get inspired by real-world examples of what's possible.",
                  required: true,
                },
                {
                  type: 'group',
                  name: 'submitButton',
                  label: 'Submit Project Button',
                  fields: [
                    {
                      type: 'text',
                      name: 'label',
                      label: 'Button Label',
                      defaultValue: 'Submit Your Project',
                      required: true,
                    },
                    {
                      type: 'text',
                      name: 'url',
                      label: 'Button URL',
                      defaultValue: '/showcase/submit',
                      required: true,
                    },
                    {
                      type: 'select',
                      name: 'variant',
                      label: 'Button Variant',
                      defaultValue: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Outline', value: 'outline' },
                      ],
                      required: true,
                    },
                    {
                      type: 'select',
                      name: 'size',
                      label: 'Button Size',
                      defaultValue: 'lg',
                      options: [
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ],
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Empty State',
          fields: [
            {
              name: 'emptyState',
              type: 'group',
              label: 'Empty State',
              fields: [
                {
                  type: 'text',
                  name: 'title',
                  label: 'Title',
                  defaultValue: 'No examples yet',
                  required: true,
                },
                {
                  type: 'textarea',
                  name: 'message',
                  label: 'Message',
                  defaultValue: 'No examples have been added yet. Check back soon or submit your own Payload project!',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [createRevalidateGlobal('showcase-global')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
  },
}

export default ShowcaseGlobal 
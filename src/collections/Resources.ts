import { CollectionConfig } from 'payload';

import { slugField } from '../fields/slug';
import formatSlug from '../utilities/formatSlug';
import { anyone } from '@/access/anyone';
import { admins } from '@/access/admins';

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'resourceType', 'source', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: anyone,
    update: anyone,
    delete: anyone,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.title) {
          // Sanitize the slug to ensure it only contains valid characters
          const sanitizedSlug = formatSlug(data.title);
          const finalSlug = String(sanitizedSlug).replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');

          return {
            ...data,
            slug: finalSlug,
          };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      required: true,
      admin: {
        description: 'A brief description for the resource card (1-2 sentences)',
      },
    },
    {
      name: 'resourceType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Tutorial',
          value: 'tutorial',
        },
        {
          label: 'Blog Post',
          value: 'blog',
        },
        {
          label: 'Video',
          value: 'video',
        },
        {
          label: 'Tool',
          value: 'tool',
        },
      ],
      admin: {
        description: 'What type of resource is this?',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        {
          label: 'External Link',
          value: 'external',
        },
        {
          label: 'Internal Content',
          value: 'internal',
        },
      ],
      admin: {
        description: 'Is this content hosted externally or written internally?',
      },
    },
    {
      name: 'externalLink',
      type: 'text',
      admin: {
        condition: (data) => data.source === 'external',
        description: 'URL to the external resource',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the resource. For videos, thumbnail will be auto-fetched if not provided.',
      },
    },
    {
      name: 'sourcePlatform',
      type: 'select',
      admin: {
        condition: (data) => data.source === 'external',
        description: 'Which platform is this content from?',
      },
      options: [
        {
          label: 'YouTube',
          value: 'youtube',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'GitHub',
          value: 'github',
        },
        {
          label: 'DEV.to',
          value: 'dev',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'videoID',
      type: 'text',
      admin: {
        condition: (data) => data.resourceType === 'video' && data.sourcePlatform === 'youtube',
        description: 'YouTube video ID (e.g., dQw4w9WgXcQ from https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        condition: (data) => data.source === 'internal',
        description: 'Content for internally hosted resources',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who created or submitted this resource?',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Relevant tags for this resource',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        {
          label: 'Beginner',
          value: 'beginner',
        },
        {
          label: 'Intermediate',
          value: 'intermediate',
        },
        {
          label: 'Advanced',
          value: 'advanced',
        },
      ],
      admin: {
        description: 'Difficulty level of this content',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this resource at the top of its category',
       // condition: admins,
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        description: 'When was this content published?',
      },
    },
    ...slugField(),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      access: {
       // update: admins,
      },
      options: [
        {
          label: 'Pending Review',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'published',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      admin: {
        description: 'Only approved resources will be displayed publicly',
      },
    },
  ],
}; 
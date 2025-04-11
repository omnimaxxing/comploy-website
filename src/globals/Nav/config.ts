import type { GlobalConfig } from 'payload';

import { createRevalidateGlobal } from '@/hooks/revalidateGlobal';

const Nav: GlobalConfig = {
  slug: 'nav',
  label: 'Navigation',
  access: {
    read: () => true,
  },
  admin: {
    meta: {
      title: 'Navigation',
      description: 'Configure the main navigation menu.',
    },
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
      defaultValue: 'Your Brand',
      admin: {
        description: 'The name of your site to display in the navigation.',
      },
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Navigation Links',
      admin: {
        description: 'Add, remove, and reorder the links in the main navigation.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Link Label',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Link URL',
        },
        {
          name: 'hasChildren',
          type: 'checkbox',
          label: 'Has Dropdown Menu',
          defaultValue: false,
          admin: {
            description: 'Enable if this link should have a dropdown menu with child links',
          },
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Menu Items',
          admin: {
            description: 'Add items to the dropdown menu for this link',
            condition: (data, siblingData) => siblingData?.hasChildren,
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Link Title',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'Link URL',
            },
            {
              name: 'description',
              type: 'text',
              label: 'Short Description',
              admin: {
                description: 'A brief description that appears below the link title',
              },
            },
            {
              name: 'icon',
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'Book', value: 'book' },
                { label: 'Trees', value: 'trees' },
                { label: 'Sunset', value: 'sunset' },
                { label: 'Zap', value: 'zap' },
                { label: 'Code', value: 'code' },
                { label: 'Globe', value: 'globe' },
                { label: 'Plugin', value: 'plugin' },
                { label: 'User', value: 'user' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'contactButton',
      type: 'group',
      label: 'Dedicated Submit Button on Right of Navbar',
      admin: {
        description: 'Configure the submit button in the navigation.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Submit Button',
          defaultValue: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Button Label',
          defaultValue: 'Submit',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Button URL',
          defaultValue: '/submit',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [createRevalidateGlobal('nav')],
  },
};

export default Nav;

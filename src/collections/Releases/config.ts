import { CollectionConfig } from 'payload';

export const Releases: CollectionConfig = {
  slug: 'releases',
  admin: {
    useAsTitle: 'version',
    description: 'PayloadCMS release information',
    defaultColumns: ['version', 'releaseDate', 'isBreaking'],
    listSearchableFields: ['version', 'content'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'version',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Release version number (e.g., v3.28.1)',
      },
    },
    {
      name: 'releaseDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Date when the release was published',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'isBreaking',
      type: 'checkbox',
      label: 'Contains Breaking Changes',
      defaultValue: false,
      admin: {
        description: 'Whether this release contains breaking changes',
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Full release notes content in Markdown format',
      },
    },
    {
      name: 'contributors',
      type: 'text',
      admin: {
        description: 'List of contributors in raw format',
        position: 'sidebar',
      },
    },
    {
      name: 'githubReleaseId',
      type: 'text',
      admin: {
        description: 'GitHub release ID for tracking',
        position: 'sidebar',
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: {
        description: 'When the release data was last fetched from GitHub',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};

export default Releases;

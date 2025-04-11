import { searchPlugin } from '@payloadcms/plugin-search';

export const pluginSearch = searchPlugin({
  collections: ['plugins'],
  defaultPriorities: {
    plugins: 10,
  },
  searchOverrides: {
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'shortDescription',
        type: 'textarea',
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'comments',
        type: 'array',
        fields: [
          {
            name: 'author',
            type: 'text',
          },
          {
            name: 'comment',
            type: 'textarea',
          },
        ],
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'categories',
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'tags',
        type: 'relationship',
        relationTo: 'tags',
        hasMany: true,
        admin: {
          position: 'sidebar',
        },
      },
    ],
  },
  beforeSync: async ({ originalDoc, searchDoc }) => {
    // Extract essential data from the plugin doc
    const enhancedSearchDoc = {
      ...searchDoc,
      shortDescription: originalDoc?.shortDescription || '',
      fullDescription: originalDoc?.fullDescription || '',
      comments:
        originalDoc?.comments?.map(comment => ({
          author: comment.author || '',
          comment: comment.comment || '',
        })) || [],
      category: originalDoc?.category || null,
      tags: originalDoc?.tags || [],
    };

    return enhancedSearchDoc;
  },
});

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Plugin } from '@/payload-types';
import { ClientSidePlugins } from './ClientSidePlugins';
import Link from 'next/link';

export interface DynamicSearchResultsProps {
  params: {
    page: number;
    limit: number;
    sort: string;
    category?: string;
    tag?: string;
    search?: string;
  };
  searchQuery: string;
  currentPage: number;
  isAllPluginsView?: boolean;
}

export async function DynamicSearchResults({
  params,
  currentPage,
  searchQuery,
  isAllPluginsView = false,
}: DynamicSearchResultsProps) {
  const payload = await getPayload({ config: configPromise });
  const where: any = {};

  // Determine if we need to fetch by category
  let categoryId: string | null = null;
  if (params.category) {
    try {
      // Look up the category by slug
      const categoryResult = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: params.category,
          },
        },
        limit: 1,
      });

      if (categoryResult.docs && categoryResult.docs.length > 0) {
        categoryId = String(categoryResult.docs[0].id); // Ensure it's a string
        console.log(`Found category ID ${categoryId} for slug ${params.category}`);
      } else {
        console.log(`No category found with slug ${params.category}`);
      }
    } catch (error) {
      console.error('Error looking up category:', error);
    }
  }

  // Build where query
  if (categoryId) {
    // Use the category ID in the query
    where.category = {
      equals: categoryId,
    };
  }

  if (params.tag) {
    // For tags, we'll need a similar approach if they're stored by ID
    try {
      // Look up the tag by slug
      const tagResult = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: params.tag,
          },
        },
        limit: 1,
      });

      if (tagResult.docs && tagResult.docs.length > 0) {
        where.tags = {
          contains: String(tagResult.docs[0].id), // Ensure it's a string
        };
      }
    } catch (error) {
      console.error('Error looking up tag:', error);
    }
  }

  if (params.search) {
    where.or = [
      {
        name: {
          like: params.search,
        },
      },
      {
        shortDescription: {
          like: params.search,
        },
      },
    ];
  }

  // Default sort to newest first if not specified
  const sort = params.sort || '-createdAt';

  try {
    // Fetch tags separately to pass to the client component
    const tagsResult = await payload.find({
      collection: 'tags',
      limit: 100, // Fetch all available tags (adjust limit if you have more)
    });

    // Extract tag names for easier use in the client component
    const allTags = tagsResult.docs.map(tag => tag.name);

    // Fetch plugins with search query
    // Use a much higher limit to effectively disable pagination
    const limit = 500;

    let pluginResults;

    if (searchQuery) {
      // Use Payload search plugin with the search query
      // We'll switch back to using search API for better results
      pluginResults = await payload.find({
        collection: 'plugins',
        where,
        depth: 1,
        limit,
        page: 1,
        sort,
      });

      // When we have search functionality working:
      // pluginResults = await payload.search({
      //   collection: 'plugins',
      //   query: searchQuery,
      //   where,
      //   depth: 1,
      //   limit,
      //   page: 1,
      //   sort,
      // });
    } else {
      // Use regular find
      pluginResults = await payload.find({
        collection: 'plugins',
        where,
        depth: 2,
        limit,
        page: 1,
        sort,
      });
    }

    // Render the client-side component with fetched data
    return (
      <ClientSidePlugins
        initialPlugins={pluginResults.docs}
        totalDocs={pluginResults.totalDocs}
        totalPages={1} // Force to 1 page since we're loading everything
        currentPage={1} // Always page 1
        searchQuery={searchQuery}
        params={{
          category: params.category,
          tag: params.tag,
          search: params.search,
          limit,
        }}
        isAllPluginsView={isAllPluginsView}
        allTags={allTags} // Pass all tags directly
      />
    );
  } catch (error) {
    console.error('Error in DynamicSearchResults:', error);
    return <div>Error loading plugins. Please try again later.</div>;
  }
}

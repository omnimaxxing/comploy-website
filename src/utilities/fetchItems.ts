import type { Item } from '@/payload-types'
import { ITEMS_COLLECTION } from '@/constants/collections'
import { getPayloadClient } from '@/getPayload'

type FetchItemsParams = {
  limit?: number
  page?: number
  sort?: string
  where?: any
}

export async function fetchItems({
  limit = 10,
  page = 1,
  sort = '-createdAt',
  where = {
    status: {
      equals: 'published',
    },
  },
}: FetchItemsParams = {}) {
  const payload = await getPayloadClient()

  const { docs: items, totalDocs } = await payload.find({
    collection: ITEMS_COLLECTION,
    limit,
    page,
    sort,
    where,
    depth: 1,
  })

  return {
    items: items as Item[],
    totalItems: totalDocs,
  }
}

export async function fetchFeaturedItems({ limit = 6 } = {}) {
  return fetchItems({
    limit,
    where: {
      and: [
        {
          status: {
            equals: 'published',
          },
        },
        {
          featured: {
            equals: true,
          },
        },
      ],
    },
  })
}

export async function fetchItemBySlug(slug: string) {
  const payload = await getPayloadClient()

  try {
    const item = await payload.find({
      collection: ITEMS_COLLECTION,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      depth: 1,
      limit: 1,
    })

    if (item.docs && item.docs.length > 0) {
      return item.docs[0] as Item
    }

    return null
  } catch (error) {
    console.error(`Error fetching item with slug '${slug}':`, error)
    return null
  }
} 
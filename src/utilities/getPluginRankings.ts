import { cache } from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { Plugin } from '@/payload-types';
import { getPopularPlugins, getTrendingPlugins } from './pluginAlgorithms';

// Cache time constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache the function to get all plugins for rankings
export const getPluginsForRankings = cache(async (): Promise<Plugin[]> => {
  const payload = await getPayload({ config: configPromise });

  try {
    const response = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published'
        }
      },
      limit: 100, // Get a larger set for ranking algorithms to work with
      depth: 1 // Load relationships to get necessary data
    });

    return response.docs as Plugin[];
  } catch (error) {
    console.error('Error fetching plugins for rankings:', error);
    return [];
  }
});

// Get popular plugins with caching
export const getCachedPopularPlugins = cache(async (limit = 8): Promise<Plugin[]> => {
  const allPlugins = await getPluginsForRankings();
  
  if (!allPlugins.length) return [];
  
  // Apply popular plugins algorithm
  return getPopularPlugins(allPlugins, limit);
});

// Get trending plugins with caching
export const getCachedTrendingPlugins = cache(async (limit = 8): Promise<Plugin[]> => {
  const allPlugins = await getPluginsForRankings();
  
  if (!allPlugins.length) return [];
  
  // Apply trending plugins algorithm
  return getTrendingPlugins(allPlugins, limit);
}); 
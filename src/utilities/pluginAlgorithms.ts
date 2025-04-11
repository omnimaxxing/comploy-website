import type { Plugin } from '@/payload-types';

/**
 * Plugin Ranking Algorithms
 * =========================
 * 
 * This module provides algorithms to determine popular and trending plugins based on various metrics.
 * These algorithms are designed to provide users with meaningful ways to discover plugins.
 * 
 * Key metrics used for scoring:
 * - Views: Total page views of the plugin
 * - GitHub stars: Stars on the GitHub repository
 * - GitHub forks: Forks of the GitHub repository
 * - Upvotes: User upvotes within our platform
 * - Comments: Total number of comments and discussion
 * - Age: How old the plugin is
 * - Update recency: How recently the plugin was updated
 * 
 * The algorithms calculate scores with different weights for these metrics depending on
 * whether we're calculating popularity (established quality) or trending (recent momentum).
 */

// Type for plugin ranking factors
type RankingFactors = {
  viewWeight: number;
  starsWeight: number;
  forksWeight: number;
  upvotesWeight: number;
  commentsWeight: number;
  ageWeight: number;
  updateRecencyWeight: number;
};

/**
 * calculatePluginScore
 * --------------------
 * Core function that calculates a numerical score for a plugin based on various metrics.
 * Each metric is multiplied by its respective weight factor to determine its contribution.
 * 
 * @param plugin - The plugin to calculate score for
 * @param factors - Weight factors for each metric
 * @returns Numerical score representing the plugin's rank
 */
const calculatePluginScore = (plugin: Plugin, factors: RankingFactors): number => {
  let score = 0;
  
  // Views - measure of overall traffic/interest
  if (plugin.views) {
    score += plugin.views * factors.viewWeight;
  }
  
  // GitHub stars - measure of community appreciation
  if (plugin.githubData?.stars) {
    score += plugin.githubData.stars * factors.starsWeight;
  }
  
  // GitHub forks - measure of developer adoption/contribution
  if (plugin.githubData?.forks) {
    score += plugin.githubData.forks * factors.forksWeight;
  }
  
  // Upvotes - measure of user appreciation on our platform
  if (plugin.rating?.upvotes) {
    score += plugin.rating.upvotes * factors.upvotesWeight;
  }
  
  // Comments count - measure of community discussion
  if (plugin.comments?.length) {
    score += plugin.comments.length * factors.commentsWeight;
  }
  
  // Age factor (inverse logarithmic scale)
  // For popular plugins: slight bonus for mature plugins
  // For trending plugins: significant bonus for newer plugins (negative weight)
  if (plugin.createdAt) {
    const ageInDays = Math.max(1, (Date.now() - new Date(plugin.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    score += (1 / Math.log(ageInDays)) * factors.ageWeight;
  }
  
  // Update recency factor (inverse logarithmic scale)
  // Rewards plugins that are actively maintained
  if (plugin.githubData?.lastUpdated) {
    const updateAge = Math.max(1, (Date.now() - new Date(plugin.githubData.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    score += (1 / Math.log(updateAge)) * factors.updateRecencyWeight;
  }
  
  return score;
};

/**
 * getPopularPlugins
 * -----------------
 * Identifies plugins that have established popularity and quality over time.
 * 
 * Algorithm characteristics:
 * - Emphasizes sustained metrics like total views and GitHub stars
 * - Values community validation (upvotes weight is high)
 * - Considers age as a small positive factor (established plugins)
 * - Maintenance (update recency) is moderately valued
 * 
 * Use for showcasing reliable, widely-adopted plugins that many users depend on.
 * 
 * @param plugins - Array of plugins to rank
 * @param limit - Maximum number of plugins to return (default: 8)
 * @returns Array of plugins sorted by popularity score
 */
export const getPopularPlugins = (plugins: Plugin[], limit = 8): Plugin[] => {
  // Popular plugins favor total views, stars, and overall engagement
  const popularFactors: RankingFactors = {
    viewWeight: 1,        // Views are important but not dominant
    starsWeight: 2,       // GitHub stars are a strong signal of quality
    forksWeight: 1.5,     // Forks show developer interest
    upvotesWeight: 3,     // User upvotes are the strongest signal of quality
    commentsWeight: 0.5,  // Comments show engagement but less than direct votes
    ageWeight: 0.2,       // Small bonus for established plugins
    updateRecencyWeight: 0.3,  // Small bonus for maintenance
  };
  
  return [...plugins]
    .map(plugin => ({
      plugin,
      score: calculatePluginScore(plugin, popularFactors)
    }))
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit)
    .map(item => item.plugin);
};

/**
 * getTrendingPlugins
 * ------------------
 * Identifies plugins with recent momentum and activity.
 * 
 * Algorithm characteristics:
 * - Strongly emphasizes recent activity
 * - Values recent updates significantly (3x weight)
 * - Additional recency bonuses for comments and updates in last 30 days
 * - Gives newer plugins a boost with negative age weight
 * - Views are weighted more heavily than in popularity (recent views signal trends)
 * 
 * Use for showcasing what's hot right now, what's gaining traction quickly,
 * and newly released plugins that are worth checking out.
 * 
 * @param plugins - Array of plugins to rank
 * @param limit - Maximum number of plugins to return (default: 8)
 * @returns Array of plugins sorted by trending score
 */
export const getTrendingPlugins = (plugins: Plugin[], limit = 8): Plugin[] => {
  // Calculate current date for recency calculations
  const now = new Date();
  const RECENT_THRESHOLD_DAYS = 30; // Consider activity within last 30 days
  
  // Trending plugins favor recent engagement and growth
  const trendingFactors: RankingFactors = {
    viewWeight: 2,        // Recent views are important for trending
    starsWeight: 1.5,     // Stars matter but less than for popular
    forksWeight: 1,       // Forks matter less for trending
    upvotesWeight: 2.5,   // Recent upvotes significantly impact trending
    commentsWeight: 2,    // Recent comments show active discussion
    ageWeight: -0.5,      // Negative weight gives newer plugins a boost
    updateRecencyWeight: 3, // Strong boost for recently updated plugins
  };
  
  return [...plugins]
    .map(plugin => {
      // Base score from general metrics
      const baseScore = calculatePluginScore(plugin, trendingFactors);
      
      // Additional recency bonuses for very recent activity
      let recencyScore = 0;
      
      // Bonus for recent comments (within last 30 days)
      if (plugin.comments?.length) {
        const recentComments = plugin.comments.filter(comment => {
          if (!comment.createdAt) return false;
          const commentDate = new Date(comment.createdAt);
          const daysSinceComment = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceComment <= RECENT_THRESHOLD_DAYS;
        });
        
        // Significant boost for recent comments
        recencyScore += recentComments.length * 5;
      }
      
      // Significant boost for very recent updates
      if (plugin.githubData?.lastUpdated) {
        const updateDate = new Date(plugin.githubData.lastUpdated);
        const daysSinceUpdate = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceUpdate <= 7) {
          // Updated within last week (major boost)
          recencyScore += 20;
        } else if (daysSinceUpdate <= 30) {
          // Updated within last month (moderate boost)
          recencyScore += 10;
        }
      }
      
      return {
        plugin,
        score: baseScore + recencyScore
      };
    })
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit)
    .map(item => item.plugin);
}; 
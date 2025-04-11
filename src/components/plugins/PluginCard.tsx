'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { Plugin } from '@/payload-types';
import { Tooltip } from '@heroui/react';

import { PayloadIcon } from '../Icons/PayloadIcon';
// Define a type that represents both real plugins and mock plugins
type PluginCardData = Plugin | (Omit<Plugin, 'id'> & { id: string });

// Format date in a human-readable way
const formatDate = (dateString?: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If less than 30 days, show relative time
  if (diffDays < 30) {
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Otherwise, show the date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface PluginCardProps {
  plugin: PluginCardData;
  className?: string;
  featured?: boolean;
}

export const PluginCard = ({ plugin, className = '', featured = false }: PluginCardProps) => {
  return (
    <Link
      href={`/plugins/${plugin.slug}`}
      className={`flex flex-col rounded-lg bg-background/10 p-4 backdrop-blur-sm transition-all hover:shadow-sm ${className}`}
    >
      <div className="flex gap-4">
        {/* Icon/Logo */}
        <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
          {plugin.mainImage &&
          typeof plugin.mainImage === 'object' &&
          'url' in plugin.mainImage &&
          plugin.mainImage.url ? (
            <Image
              src={plugin.mainImage.url}
              alt={plugin.name || 'Plugin icon'}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <Icon icon="heroicons:puzzle-piece" className="text-primary h-6 w-6" />
          )}
        </div>

        <div className="flex-1">
          {/* Name and verification badge */}
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={`line-clamp-1 font-medium ${
                featured ? 'fl-text-step-1' : 'fl-text-step-0'
              }`}
            >
              {plugin.name}
            </h3>

            {/* Show verification badge if verified */}
            {plugin.verification?.isVerified && (
              <span className="flex-shrink-0">
                <Icon icon="heroicons:check-badge" className="h-4 w-4 text-green-600" />
              </span>
            )}

            {/* Show official badge if official */}
            {plugin.isOfficial && (
              <span className="flex-shrink-0">
                <Icon icon="heroicons:star" className="h-4 w-4 text-amber-500" />
              </span>
            )}
          </div>

          {/* Stats line */}
          <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-3">
            {plugin.githubData?.stars && (
              <span className="inline-flex items-center text-xs">
                <Icon
                  icon="heroicons:star"
                  className={`mr-1 h-3.5 w-3.5 ${featured ? 'text-amber-500' : ''}`}
                />
                {plugin.githubData.stars}
              </span>
            )}
            {plugin.githubData?.forks && (
              <span className="inline-flex items-center text-xs">
                <Icon icon="meteor-icons:git-fork" className="mr-1 h-3.5 w-3.5" />
                {plugin.githubData.forks}
              </span>
            )}
            {/* Show vote score instead of just upvotes */}
            {plugin.rating?.score !== undefined &&
              plugin.rating.score !== null &&
              plugin.rating.score > 0 && (
                <span className="inline-flex items-center text-xs">
                  <Icon icon="heroicons:arrow-trending-up" className="mr-1 h-3.5 w-3.5" />
                  {plugin.rating.score}
                </span>
              )}
            {/* Last updated date */}
            {plugin.githubData?.lastCommit && (
              <span className="inline-flex items-center text-xs">
                <Icon icon="heroicons:clock" className="mr-1 h-3.5 w-3.5" />
                {formatDate(plugin.githubData.lastCommit)}
              </span>
            )}
          </div>

          {/* Description - truncated to 2 lines */}
          <p
            className={`text-muted-foreground mb-2 line-clamp-2 ${
              featured ? 'text-sm' : 'fl-text-step--1'
            }`}
          >
            {plugin.shortDescription}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Official badge - now with transparent background */}
            {plugin.isOfficial && (
              <span className="inline-flex items-center rounded-sm border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                <PayloadIcon className="mr-0.5 h-2.5 w-2.5" />
                Official
              </span>
            )}

            {/* Category badge if available - now with transparent background */}
            {plugin.category && typeof plugin.category === 'object' && plugin.category.name && (
              <span className="inline-flex items-center rounded-sm border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                {plugin.category.name}
              </span>
            )}

            {/* Tags - show up to 3 tags */}
            {plugin.tags &&
              Array.isArray(plugin.tags) &&
              plugin.tags.slice(0, 3).map(tag => {
                // Tag could be a string or an object with name
                const tagName =
                  typeof tag === 'string'
                    ? tag
                    : typeof tag === 'object' && tag !== null && 'name' in tag
                      ? tag.name
                      : null;

                return tagName ? (
                  <span
                    key={tagName}
                    className="inline-flex items-center rounded-sm border border-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground/70"
                  >
                    {tagName}
                  </span>
                ) : null;
              })}
          </div>

          {/* Featured plugin may have additional elements */}
          {featured && (
            <div className="mt-4 flex items-center justify-between">
              <div className="bg-primary hover:bg-primary/90 inline-flex h-10 w-fit items-center justify-center rounded-md px-4 py-2 font-medium text-white shadow-sm transition-all">
                View Plugin
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

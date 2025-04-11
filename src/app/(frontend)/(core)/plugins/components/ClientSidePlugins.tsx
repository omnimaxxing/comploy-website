'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PluginCard } from '@/components/plugins/PluginCard';
import type { Plugin } from '@/payload-types';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, cn, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import classNames from 'classnames';

// Sort options that match the ones in your page.tsx
const SORT_OPTIONS = [
  { label: 'Most Popular', value: '-views' },
  { label: 'Newest', value: '-createdAt' },
  { label: 'Oldest', value: 'createdAt' },
  { label: 'A-Z', value: 'name' },
  { label: 'Z-A', value: '-name' },
];

// Custom debounce function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export interface ClientSidePluginsProps {
  initialPlugins: Plugin[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  searchQuery?: string;
  params: {
    category?: string;
    tag?: string;
    search?: string;
    limit: number;
  };
  isAllPluginsView?: boolean;
  allTags: string[];
}

// Helper function to sort plugins
const sortPlugins = (plugins: Plugin[], sortOption: string): Plugin[] => {
  const isDesc = sortOption.startsWith('-');
  const field = isDesc ? sortOption.substring(1) : sortOption;

  return [...plugins].sort((a, b) => {
    let aValue: any = a[field as keyof Plugin];
    let bValue: any = b[field as keyof Plugin];

    // Handle special cases
    if (field === 'createdAt' || field === 'updatedAt') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }

    // Handle nullish values
    if (aValue == null) return isDesc ? -1 : 1;
    if (bValue == null) return isDesc ? 1 : -1;

    // Regular comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return isDesc ? -comparison : comparison;
    }

    // Number comparison
    return isDesc ? bValue - aValue : aValue - bValue;
  });
};

export function ClientSidePlugins({
  initialPlugins,
  totalDocs,
  totalPages,
  currentPage,
  searchQuery,
  params,
  isAllPluginsView = false,
  allTags = [],
}: ClientSidePluginsProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [sortOption, setSortOption] = useState<string>(initialPlugins.length > 0 ? '-views' : '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visiblePlugins, setVisiblePlugins] = useState<Plugin[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(24); // Initial count to show
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false); // New state for verified filter
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery || '');
  const [searchQueryState, setSearchQuery] = useState<string>(searchQuery || '');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fix useCallback with inline function and proper dependencies
  const debouncedUpdateURL = useDebounce((newSearchParams: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    // First, copy all existing params except those we'll be updating
    const keysToUpdate = Object.keys(newSearchParams);
    // Skip page when updating other params
    if (!keysToUpdate.includes('page')) {
      params.delete('page');
    }

    // Then update with new values, or delete if value is null/undefined
    Object.entries(newSearchParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Always ensure view=all is set for client-side filtering
    if (!params.has('view') || params.get('view') !== 'all') {
      params.set('view', 'all');
    }

    const newUrl = `/plugins?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, 300);

  // Get current category info for context-aware search
  const currentCategory = params.category;
  const isInCategory = Boolean(currentCategory);

  // Handle search parameter updates
  useEffect(() => {
    // Get sort from URL or default to newest
    const urlSort = searchParams.get('sort') || '-createdAt';
    setSortOption(urlSort);

    // Initialize local search from URL parameter
    setLocalSearchQuery(searchQuery || '');
  }, [searchParams, searchQuery]);

  // Apply filters and sorting
  useEffect(() => {
    // Start with all plugins - ALWAYS search through the complete set received from server
    let filtered = [...initialPlugins];

    // Apply tag filtering if any tags are selected
    if (selectedTags.length > 0) {
      filtered = filtered.filter(plugin => {
        // Check if plugin has tags
        if (!plugin.tags || !Array.isArray(plugin.tags) || plugin.tags.length === 0) {
          return false;
        }

        // Handle tags which might be stored as objects with name property
        const pluginTagNames = plugin.tags
          .map(tag => {
            // Tag might be a string (name) or an object with a name property
            if (typeof tag === 'string') {
              return tag;
            } else if (typeof tag === 'object' && tag !== null) {
              // Handle case where tag is an object with name
              return tag.name || '';
            }
            return '';
          })
          .filter(Boolean);

        // Check if any selected tag is in the plugin's tags
        return selectedTags.some(selectedTag => pluginTagNames.includes(selectedTag));
      });
    }

    // Apply verified filter if enabled
    if (verifiedOnly) {
      filtered = filtered.filter(plugin => plugin.verification?.isVerified === true);
    }

    // Apply client-side search if needed
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(plugin => {
        const name = (typeof plugin.name === 'string' ? plugin.name : '').toLowerCase();
        const desc = (
          typeof plugin.shortDescription === 'string' ? plugin.shortDescription : ''
        ).toLowerCase();
        return name.includes(query) || desc.includes(query);
      });
    }

    // Apply sorting
    if (sortOption) {
      filtered = sortPlugins(filtered, sortOption);
    }

    // Set the filtered plugins
    setPlugins(filtered);

    // Reset visible count on filter change
    setVisibleCount(24);

    // Update visible plugins
    setVisiblePlugins(filtered.slice(0, 24));

    // Add console logging for debugging
    console.log(`Filtering results: ${filtered.length} plugins match filters`);
    if (selectedTags.length > 0) {
      console.log(`Selected tags:`, selectedTags);
    }
  }, [initialPlugins, selectedTags, sortOption, localSearchQuery, verifiedOnly]);

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Handle verified toggle
  const toggleVerified = () => {
    setVerifiedOnly(prev => !prev);
  };

  // Clear all filters - clears both tags and verified
  const clearAllFilters = () => {
    setSelectedTags([]);
    setVerifiedOnly(false);
  };

  // Update the URL and apply client-side filtering when the sort changes
  const handleSortChange = (value: string) => {
    setSortOption(value);

    // Apply immediate client-side sorting
    const filtered = sortPlugins(initialPlugins, value);
    setPlugins(filtered);
    setVisiblePlugins(filtered.slice(0, 24));

    // Update URL
    debouncedUpdateURL({ sort: value });
  };

  // Handle search text submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the searchQuery state and URL
    setSearchQuery(localSearchQuery);

    // Always update the URL with the new search query and view=all
    debouncedUpdateURL({
      search: localSearchQuery || null,
      view: 'all', // Always ensure view=all for search
    });
  };

  // Handle load more
  const handleLoadMore = () => {
    const newCount = visibleCount + 24;
    setVisibleCount(newCount);
    setVisiblePlugins(plugins.slice(0, newCount));
  };

  // No results found
  if (plugins.length === 0) {
    return (
      <div className="py-16 text-center">
        {/* Full-width search bar */}
        <div className="mb-10">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={e => setLocalSearchQuery(e.target.value)}
                placeholder={
                  isInCategory ? `Search within ${currentCategory}...` : 'Search for plugins...'
                }
                className="h-14 w-full rounded-lg border border-foreground/10 bg-background px-5 pl-12 shadow-sm transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
              />
              <Icon
                icon="heroicons:magnifying-glass"
                className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform"
              />
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLocalSearchQuery('')}
                  className="text-muted-foreground absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:text-foreground"
                >
                  <Icon icon="heroicons:x-mark" className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-accent-500 hover:text-accent-600"
              >
                <Icon icon="heroicons:arrow-right" className="h-5 w-5" />
              </button>
            </div>
            {/* Persistent search indicator */}
            {(searchQuery || localSearchQuery) && (
              <div className="text-muted-foreground mt-2 flex items-center text-xs">
                <Icon icon="heroicons:information-circle" className="mr-1 h-3.5 w-3.5" />
                {searchQuery ? (
                  <>
                    Currently showing results for &ldquo;
                    <span className="font-semibold">{searchQuery}</span>&rdquo;.
                    {searchQuery !== localSearchQuery && (
                      <span className="ml-1 italic">
                        Press enter to search for &ldquo;{localSearchQuery || 'all plugins'}&rdquo;
                      </span>
                    )}
                    <Link href="/plugins?view=all" className="ml-1 text-accent-500 hover:underline">
                      View all plugins instead
                    </Link>
                  </>
                ) : (
                  <>
                    Press enter to search for &ldquo;
                    <span className="font-semibold">{localSearchQuery}</span>&rdquo;.
                  </>
                )}
              </div>
            )}
            {isInCategory && !searchQuery && (
              <div className="text-muted-foreground mt-2 flex items-center text-xs">
                <Icon icon="heroicons:information-circle" className="mr-1 h-3.5 w-3.5" />
                Searching within {currentCategory} category.
                <Link href="/plugins?view=all" className="ml-1 text-accent-500 hover:underline">
                  Search all plugins instead
                </Link>
              </div>
            )}
          </form>
        </div>

        <h3 className="mb-4 text-xl font-medium">No plugins found</h3>
        <p className="text-muted-foreground mx-auto mb-8 max-w-md">
          {localSearchQuery
            ? `We couldn't find any plugins matching "${localSearchQuery}"`
            : params.category
              ? "We couldn't find any plugins in this category."
              : isAllPluginsView
                ? "We couldn't find any plugins."
                : verifiedOnly
                  ? 'No verified plugins match your criteria.'
                  : `No plugins match the selected filters`}
        </p>
        <Link
          href="/plugins?view=all"
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-600"
        >
          View all plugins
        </Link>
      </div>
    );
  }

  // Count verified plugins
  const verifiedCount = initialPlugins.filter(p => p.verification?.isVerified === true).length;

  return (
    <div>
      {/* Full-width search bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={e => setLocalSearchQuery(e.target.value)}
              placeholder={
                isInCategory ? `Search within ${currentCategory}...` : 'Search for plugins...'
              }
              className="h-14 w-full rounded-lg border border-foreground/10 bg-background px-5 pl-12 shadow-sm transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
            />
            <Icon
              icon="heroicons:magnifying-glass"
              className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform"
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={() => setLocalSearchQuery('')}
                className="text-muted-foreground absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:text-foreground"
              >
                <Icon icon="heroicons:x-mark" className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 transform text-accent-500 hover:text-accent-600"
            >
              <Icon icon="heroicons:arrow-right" className="h-5 w-5" />
            </button>
          </div>
          {/* Persistent search indicator */}
          {(searchQuery || localSearchQuery) && (
            <div className="text-muted-foreground mt-2 flex items-center text-xs">
              <Icon icon="heroicons:information-circle" className="mr-1 h-3.5 w-3.5" />
              {searchQuery ? (
                <>
                  Currently showing results for &ldquo;
                  <span className="font-semibold">{searchQuery}</span>&rdquo;.
                  {searchQuery !== localSearchQuery && (
                    <span className="ml-1 italic">
                      Press enter to search for &ldquo;{localSearchQuery || 'all plugins'}&rdquo;
                    </span>
                  )}
                  <Link href="/plugins?view=all" className="ml-1 text-accent-500 hover:underline">
                    View all plugins instead
                  </Link>
                </>
              ) : (
                <>
                  Press enter to search for &ldquo;
                  <span className="font-semibold">{localSearchQuery}</span>&rdquo;.
                </>
              )}
            </div>
          )}
          {isInCategory && !searchQuery && (
            <div className="text-muted-foreground mt-2 flex items-center text-xs">
              <Icon icon="heroicons:information-circle" className="mr-1 h-3.5 w-3.5" />
              Searching within {currentCategory} category.
              <Link href="/plugins?view=all" className="ml-1 text-accent-500 hover:underline">
                Search all plugins instead
              </Link>
            </div>
          )}
        </form>
      </div>

      {/* Header with filter options, tag selector, and counters */}
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-muted-foreground text-sm">
            {/* Plugin count - Now always shows total count of filtered plugins, not just visible ones */}
            <span>
              {plugins.length === initialPlugins.length
                ? `${plugins.length} plugins`
                : `Showing ${plugins.length} of ${initialPlugins.length} plugins`}
            </span>

            {/* Selected tags indicator */}
            {selectedTags.length > 0 && (
              <span className="ml-2 text-accent-500">
                (Filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''})
              </span>
            )}

            {/* Verified filter indicator */}
            {verifiedOnly && <span className="ml-2 text-green-500">(Verified only)</span>}

            {/* Search indicator */}
            {localSearchQuery && (
              <span className="ml-2 text-accent-500">(Search: &quot;{localSearchQuery}&quot;)</span>
            )}
          </div>

          {/* Sorting control */}
          <div className="flex items-center">
            <label htmlFor="sort-select" className="text-muted-foreground mr-2 text-sm">
              Sort:
            </label>
            <Select
              id="sort-select"
              aria-label="Sort plugins"
              placeholder="Sort by"
              className="w-48 bg-background text-foreground"
              selectedKeys={[sortOption]}
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0]?.toString() || '-views';
                handleSortChange(selectedKey);
              }}
              variant="bordered"
              radius="none"
              classNames={{
                popoverContent:
                  'bg-background/95 rounded-none backdrop-blur-md border border-foreground/20',
                listbox: 'p-0 text-foreground rounded-none bg-background/0',
                base: 'text-foreground',
                trigger: 'data-[open=true]:border-primary',
                value: 'text-sm',
              }}
            >
              {SORT_OPTIONS.map(option => (
                <SelectItem
                  key={option.value}
                  className="data-[selected=true]:bg-primary/20 rounded-none text-foreground data-[hover=true]:bg-foreground/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Filter options in a single row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Clear all filters button */}
          <Button
            onPress={clearAllFilters}
            aria-label="Clear all filters"
            isIconOnly
            variant="bordered"
            disabled={selectedTags.length === 0 && !verifiedOnly}
            className={cn(
              'rounded-none transition-colors',
              selectedTags.length > 0 || verifiedOnly
                ? 'text-danger'
                : 'cursor-default text-foreground/50'
            )}
          >
            <Icon icon="heroicons:x-mark" className="h-5 w-5" />
          </Button>

          {/* Verified filter toggle */}
          <Button
            onPress={toggleVerified}
            variant="bordered"
            className={cn(
              'inline-flex items-center rounded-none border px-3 py-1.5 text-xs font-medium transition-colors',
              verifiedOnly
                ? 'border-success-500 bg-success-500/50 text-white'
                : 'border-success-500/20 bg-transparent text-success-500 hover:bg-success-500/10'
            )}
          >
            <Icon icon="heroicons:check-badge" className="mr-1.5 h-4 w-4" />
            Verified only
            <span
              className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                verifiedOnly ? 'bg-white/20' : 'bg-green-500/20'
              )}
            >
              {verifiedCount}
            </span>
          </Button>

          {/* Tag buttons - use the allTags array passed from DynamicSearchResults */}
          {allTags.map(tag => (
            <Button
              key={tag}
              onPress={() => toggleTag(tag)}
              className={cn(
                'inline-flex items-center rounded-none px-2 py-1 text-xs font-medium transition-colors',
                selectedTags.includes(tag)
                  ? 'border border-foreground/40 bg-accent-900 text-white'
                  : 'border border-foreground/20 bg-transparent hover:bg-foreground/5'
              )}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div className="u-grid mb-8 gap-4">
        {visiblePlugins.map(plugin => (
          <div key={plugin.id} className="col-span-12 md:col-span-6 xl:col-span-4">
            <PluginCard
              plugin={plugin}
              className="h-full bg-background/30 hover:bg-background/50"
            />
          </div>
        ))}
      </div>

      {/* Load more button instead of pagination - only show if we have more plugins to display */}
      {visiblePlugins.length < plugins.length && (
        <div className="mt-8 flex justify-center">
          <Button
            className="rounded-none"
            endContent={<Icon icon="heroicons:arrow-down" />}
            onPress={handleLoadMore}
            variant="ghost"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

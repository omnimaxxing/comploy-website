'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';

// Custom debounce hook
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

interface SearchBarProps {
  initialQuery?: string;
  currentCategory?: string;
}

export function SearchBar({ initialQuery = '', currentCategory }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInCategory = Boolean(currentCategory);

  // Create debounced update function
  const debouncedNavigate = useDebounce((url: string) => {
    router.push(url);
  }, 300);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only trigger search for non-empty queries
    if (searchQuery.length >= 2) {
      const params = new URLSearchParams();
      
      // Always add search parameter
      params.set('search', searchQuery);
      
      // Always add view=all to ensure consistent search experience
      params.set('view', 'all');
      
      // Keep category if present - allows searching within category
      if (currentCategory) {
        params.set('category', currentCategory);
      }
      
      // Keep sort parameter if present
      const sortParam = searchParams.get('sort');
      if (sortParam) {
        params.set('sort', sortParam);
      }
      
      // Use debounced navigation
      debouncedNavigate(`/plugins?${params.toString()}`);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              isInCategory ? `Search within ${currentCategory}...` : 'Search for plugins...'
            }
            className="h-14 w-full rounded-lg border border-foreground/10 bg-background px-5 pl-12 shadow-sm transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
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
        {isInCategory && (
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
  );
}

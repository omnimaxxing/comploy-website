'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';

// Custom debounce hook for consistent behavior
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

export function HeroSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

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
      
      // Use debounced navigation
      debouncedNavigate(`/plugins?${params.toString()}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for plugins..."
            className="h-14 w-full rounded-lg border border-white/20 bg-background/30 backdrop-blur-sm px-5 pl-12 text-white
              shadow-[0_0_15px_rgba(125,90,255,0.15)] transition-all 
              focus:border-accent-500/60 focus:shadow-[0_0_20px_rgba(125,90,255,0.3)] focus:ring-2 focus:ring-accent-500/30"
          />
          <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/70">
            <Icon icon="heroicons:magnifying-glass" className="h-5 w-5" />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/70 hover:text-white"
            >
              <Icon icon="heroicons:x-mark" className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 transform text-accent-500 hover:text-accent-400"
          >
            <Icon icon="heroicons:arrow-right" className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

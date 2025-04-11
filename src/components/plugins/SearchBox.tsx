'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

interface SearchBoxProps {
  initialQuery?: string;
  darkMode?: boolean;
}

export default function SearchBox({ initialQuery = '', darkMode = false }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get current URL parameters to preserve filters and view
    const params = new URLSearchParams(window.location.search);

    if (query) {
      params.set('search', query);
      // When searching, switch to "all" view
      params.set('view', 'all');
    } else {
      params.delete('search');
    }

    // Use router for navigation to /plugins
    window.location.href = `/plugins?${params.toString()}`;
  };

  const clearSearch = () => {
    setQuery('');

    // Get current URL parameters to preserve filters
    const params = new URLSearchParams(window.location.search);

    params.delete('search');

    // Use window.location for direct navigation
    window.location.href = `/plugins?${params.toString()}`;
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          isFocused ? 'ring-1 ring-accent-500/50' : ''
        } ${
          darkMode
            ? 'border border-foreground/20 bg-background/80 backdrop-blur-sm hover:border-foreground/30'
            : 'border border-foreground/10 bg-foreground/5 hover:border-foreground/20'
        } overflow-hidden rounded-lg`}
      >
        <input
          type="text"
          placeholder="Search plugins..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`flex-grow bg-transparent px-4 py-2.5 outline-none ${
            darkMode
              ? 'text-white placeholder:text-foreground/60'
              : 'text-foreground placeholder:text-foreground/60'
          } text-sm`}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className={`p-2 ${
              darkMode
                ? 'text-foreground/60 hover:text-foreground/90'
                : 'text-foreground/50 hover:text-foreground/80'
            }`}
            aria-label="Clear search"
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className={`p-2.5 ${
            darkMode
              ? 'bg-indigo-500/80 text-white hover:bg-indigo-500/90'
              : 'bg-indigo-500/90 text-white hover:bg-indigo-500'
          } transition-colors`}
          aria-label="Search"
        >
          <Icon icon="heroicons:magnifying-glass" className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

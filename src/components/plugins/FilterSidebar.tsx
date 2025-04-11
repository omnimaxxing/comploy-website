'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';
import Link from 'next/link';

interface FilterSidebarProps {
  categories: any[];
  selectedCategory?: string;
  totalCount?: number;
  className?: string;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  totalCount = 0,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
  });

  const toggleSection = (section: 'categories') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if we're on the all plugins view
  const view = searchParams.get('view');
  const isAllPluginsView = view === 'all';
  const isAllSelected = !selectedCategory && isAllPluginsView;

  const getFilterUrl = (type: 'category', slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (type === 'category') {
      if (selectedCategory === slug) {
        params.delete('category');
      } else {
        params.set('category', slug);
      }
    }

    const search = params.get('search');
    const sort = params.get('sort');

    params.delete('page');

    return `${pathname}?${params.toString()}`;
  };

  // Create URL for all plugins view
  const getAllPluginsUrl = () => {
    const params = new URLSearchParams();
    params.set('view', 'all');

    // Preserve sort parameter if it exists
    const sort = searchParams.get('sort');
    if (sort) {
      params.set('sort', sort);
    }

    return `${pathname}?${params.toString()}`;
  };

  const hasActiveFilters = !!selectedCategory || isAllPluginsView;

  // Helper function to format count with better handling
  const formatCount = (count: number | undefined) => {
    // Check if count is a valid number
    if (typeof count === 'number' && !isNaN(count)) {
      return <span className="text-muted-foreground ml-auto text-sm">{count}</span>;
    }

    // Default state for undefined or invalid counts
    return <span className="text-muted-foreground/50 ml-auto text-xs">0</span>;
  };

  return (
    <aside
      className={cn(
        'sticky top-24 rounded-none border border-foreground/10 bg-background/5 p-6 shadow-sm backdrop-blur-2xl lg:block lg:border-y-0 lg:border-l-0',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">Categories</h3>
        {hasActiveFilters && (
          <Link href={pathname} className="text-xs text-accent-500 hover:text-accent-400">
            Reset
          </Link>
        )}
      </div>

      <div className="mb-4 border-b border-foreground/10 pb-3">
        <p className="text-muted-foreground flex items-center text-sm">
          <span>Plugins available</span>
          <span
            className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              typeof totalCount === 'number' && totalCount > 0
                ? 'bg-accent-500/10 text-accent-500'
                : 'text-muted-foreground/50 bg-foreground/5'
            )}
          >
            {typeof totalCount === 'number' && totalCount > 0 ? totalCount : '0'}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <div className="space-y-1">
          {/* All Plugins option */}
          <Link
            href={getAllPluginsUrl()}
            className={cn(
              'flex w-full items-center rounded-none p-1.5 text-sm transition-colors hover:bg-foreground/5',
              isAllSelected ? 'bg-foreground/5 text-accent-500' : ''
            )}
          >
            {isAllSelected && (
              <Icon icon="heroicons:check" className="mr-1.5 h-4 w-4 text-accent-500" />
            )}
            <span>All Plugins</span>
            {formatCount(totalCount)}
          </Link>

          {/* Category list */}
          {categories.map(category => (
            <Link
              key={category.id}
              href={getFilterUrl('category', category.slug)}
              className={cn(
                'flex w-full items-center rounded-none p-1.5 text-sm transition-colors hover:bg-foreground/5',
                selectedCategory === category.slug ? 'bg-foreground/5 text-accent-500' : ''
              )}
            >
              {selectedCategory === category.slug && (
                <Icon icon="heroicons:check" className="mr-1.5 h-4 w-4 text-accent-500" />
              )}
              <span>{category.name}</span>
              {formatCount(category.pluginCount)}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

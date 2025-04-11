'use client';

import { Icon } from '@iconify/react';
import React from 'react';

interface SortSelectorProps {
  value: string;
  options: { label: string; value: string }[];
  category?: string;
  tag?: string;
  search?: string;
}

export default function SortSelector({ value, options, category, tag, search }: SortSelectorProps) {
  // Create URL with current filters but new sort
  const createUrlWithParams = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return `/plugins?${urlParams.toString()}`;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Create URL with current filters but new sort
    const url = createUrlWithParams({
      category,
      tag,
      search,
      sort: e.target.value,
    });
    window.location.href = url;
  };

  return (
    <div className="relative">
      <select
        className="appearance-none bg-background/50 border border-foreground/10 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-accent-500/50"
        value={value}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-foreground/70" />
      </div>
    </div>
  );
}

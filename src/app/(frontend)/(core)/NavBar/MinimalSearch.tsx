'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

// Custom debounce hook for consistent behavior across search components
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

interface MinimalSearchProps {
	initialQuery?: string
	onSubmit?: () => void
}

export default function MinimalSearch({ initialQuery = '', onSubmit }: MinimalSearchProps) {
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [isClient, setIsClient] = useState(false)

	// Set isClient to true on mount
	useEffect(() => {
		setIsClient(true)
		setQuery(initialQuery)
	}, [initialQuery])

	// Create debounced navigation function
	const debouncedNavigate = useDebounce((url: string) => {
		router.push(url);
		if (onSubmit) onSubmit();
	}, 300);

	// Handle input change - just update the state, no auto-search
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	// Handle form submission - only search when user presses enter
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (query && query.length >= 2) {
			// Create a search URL that matches our unified search pattern
			const params = new URLSearchParams();
      
			// Always add search parameter with our unified naming
			params.set('search', query);
      
			// Always use view=all for consistent search experience
			params.set('view', 'all');
      
			// Use the unified URL format for consistency across the site
			debouncedNavigate(`/plugins?${params.toString()}`);
		}
	}

	// Clear search query
	const clearSearch = () => {
		setQuery('')
		// Don't navigate when clearing the search box
	}

	return (
		<div className="relative w-full max-w-sm">
			<form onSubmit={handleSubmit} className="mix-blend-difference">
				<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<Icon icon="heroicons:magnifying-glass" className="w-4 h-4 text-white/80" />
				</div>

				<input
					type="search"
					suppressHydrationWarning
					className="block w-full p-1.5 pl-10 pr-8 text-sm text-white border border-white/30 rounded-md bg-transparent 
                    placeholder:text-white/60 focus:border-white/50 focus:ring-0 focus:outline-none transition-colors
                    [&::-webkit-search-cancel-button]:hidden"
					placeholder="Search plugins..."
					value={isClient ? query : ''}
					onChange={handleInputChange}
					aria-label="Search plugins"
				/>

				{query && isClient && (
					<button
						type="button"
						onClick={clearSearch}
						className="absolute inset-y-0 right-0 flex items-center pr-3"
						aria-label="Clear search"
					>
						<Icon
							icon="heroicons:x-mark"
							className="w-4 h-4 text-white/70 hover:text-white transition-colors"
						/>
					</button>
				)}
			</form>
		</div>
	)
}

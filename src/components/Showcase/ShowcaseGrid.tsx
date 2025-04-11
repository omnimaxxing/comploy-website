'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/utilities/cn';
import { RingLoader } from 'react-spinners';
import { Button, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tag, type TagColor } from '@/components/ui/tag';

interface ShowcaseItem {
  imageUrl: string;
  title: string;
  views: number;
  blurDataURL?: string;
  imageUrls?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  tags?: Array<{
    id: string;
    name?: string;
    slug?: string;
    color?: string;
  }>;
  websiteUrl?: string;
  githubUrl?: string;
  description?: string;
}

interface ShowcaseGridProps {
  items: ShowcaseItem[];
  className?: string;
  onImageClick?: (imageUrl: string) => void;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
}

export const ShowcaseGrid = ({
  items,
  className,
  onImageClick,
  onLoadMore,
  isLoading = false,
  hasMore = false,
}: ShowcaseGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const lastScrollPosRef = useRef<number>(0);
  const lastItemsLengthRef = useRef<number>(items.length);
  const preloadTriggeredRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(isLoading);
  const scrollRestorationScheduled = useRef<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
  }, []);

  // Update loading ref when prop changes
  useEffect(() => {
    loadingRef.current = isLoading;

    // Reset preload trigger when loading completes
    if (!isLoading && preloadTriggeredRef.current) {
      console.log('Loading complete, resetting preload trigger');
      preloadTriggeredRef.current = false;
    }
  }, [isLoading]);

  // Reset preload trigger when new items are loaded
  useEffect(() => {
    if (items.length > lastItemsLengthRef.current) {
      console.log(`Items updated from ${lastItemsLengthRef.current} to ${items.length}`);
      preloadTriggeredRef.current = false;
    }
  }, [items.length]);

  // Preload detection using Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    console.log('Setting up intersection observer for infinite scroll');

    // Create a sentinel element for intersection observer if it doesn't exist
    if (!sentinelRef.current && gridRef.current) {
      sentinelRef.current = document.createElement('div');
      sentinelRef.current.className = 'sentinel-element';
      sentinelRef.current.style.height = '1px';
      sentinelRef.current.style.width = '100%';
      sentinelRef.current.style.position = 'absolute';
      sentinelRef.current.style.bottom = '500px'; // Increased from 800px to trigger earlier
      sentinelRef.current.style.left = '0';
      sentinelRef.current.style.zIndex = '-1';
      gridRef.current.style.position = 'relative';
      gridRef.current.appendChild(sentinelRef.current);
    }

    const options = {
      root: null,
      rootMargin: '800px', // Start loading 800px before reaching the end
      threshold: 0,
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // If the sentinel is becoming visible and we haven't triggered preload
        if (entry.isIntersecting && !loadingRef.current && !preloadTriggeredRef.current) {
          console.log('Sentinel intersecting, loading more items');
          preloadTriggeredRef.current = true;
          lastScrollPosRef.current = window.scrollY;

          // Set a fixed document height before loading to prevent layout shifts
          if (gridRef.current && gridRef.current.parentElement) {
            const currentHeight = document.documentElement.scrollHeight;
            gridRef.current.parentElement.style.minHeight = `${currentHeight}px`;
          }

          onLoadMore();
        }
      });
    }, options);

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
      console.log('Observer attached to sentinel element');
    }

    return () => {
      observer.disconnect();
      console.log('Observer disconnected');
    };
  }, [onLoadMore, isLoading, hasMore, items.length]);

  // Backup scroll handler for safety
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    console.log('Setting up scroll handler for infinite scroll backup');

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Only trigger if we're closer to the bottom and haven't preloaded
        if (
          documentHeight - scrollPosition - windowHeight < 300 &&
          !loadingRef.current &&
          !preloadTriggeredRef.current
        ) {
          console.log('Bottom of page detected via scroll, loading more items');
          console.log(`Distance from bottom: ${documentHeight - scrollPosition - windowHeight}px`);
          preloadTriggeredRef.current = true;
          lastScrollPosRef.current = scrollPosition;

          // Set a fixed document height before loading to prevent layout shifts
          if (gridRef.current && gridRef.current.parentElement) {
            const currentHeight = document.documentElement.scrollHeight;
            gridRef.current.parentElement.style.minHeight = `${currentHeight}px`;
          }

          onLoadMore();
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onLoadMore, isLoading, hasMore]);

  // Keep track of items length changes and maintain scroll position
  useEffect(() => {
    if (items.length > lastItemsLengthRef.current && !scrollRestorationScheduled.current) {
      scrollRestorationScheduled.current = true;

      // Use requestAnimationFrame for more precise scroll restoration after layout is complete
      requestAnimationFrame(() => {
        const lastKnownPosition = lastScrollPosRef.current;
        if (lastKnownPosition > 0) {
          window.scrollTo({
            top: lastKnownPosition,
            behavior: 'auto', // Use 'auto' instead of 'smooth' to prevent additional jumps
          });

          // Double-check scroll position after a short delay
          setTimeout(() => {
            const currentPosition = window.scrollY;
            // If we drifted more than 5px, try one more adjustment
            if (Math.abs(currentPosition - lastKnownPosition) > 5) {
              window.scrollTo({
                top: lastKnownPosition,
                behavior: 'auto',
              });
            }

            // Reset the min-height constraint
            if (gridRef.current && gridRef.current.parentElement) {
              gridRef.current.parentElement.style.minHeight = '';
            }

            scrollRestorationScheduled.current = false;
          }, 50);
        } else {
          scrollRestorationScheduled.current = false;
        }
      });
    }

    lastItemsLengthRef.current = items.length;
  }, [items.length]);

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  // Manual load more button handler
  const handleLoadMoreClick = () => {
    if (!isLoading && hasMore && onLoadMore) {
      console.log('Manual load more button clicked');
      lastScrollPosRef.current = window.scrollY;
      onLoadMore();
    }
  };

  return (
    <div className={cn('relative w-full', className)} ref={gridRef}>
      <div className="grid grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={`showcase-item-${index}-${item.imageUrl}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(0.1 * (index % 6), 0.5),
            }}
            className={cn('flex flex-col overflow-hidden rounded-lg will-change-transform')}
            style={{
              contain: 'layout paint style',
            }}
          >
            {/* Image container with overlay */}
            <div
              className="group relative aspect-[4/3] w-full cursor-pointer bg-white/5"
              onClick={() => onImageClick && onImageClick(item.imageUrl)}
            >
              {/* Placeholder while image loads */}
              <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-white/5 to-white/10" />

              {/* Main image */}
              <Image
                src={item.imageUrls?.medium || item.imageUrl}
                className="object-cover transition-all duration-300 hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={
                  item.blurDataURL ||
                  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU1RUVHSkdKTUtLR0pHRkpLRktLR0v/2wBDAR'
                }
                alt={item.title}
                priority={index < 6}
                loading={index < 6 ? 'eager' : 'lazy'}
                onLoad={e => {
                  const img = e.currentTarget;
                  img.style.animation = 'fadeIn 0.3s ease-in-out';
                  const parent = img.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('.image-placeholder');
                    if (placeholder) {
                      (placeholder as HTMLElement).style.opacity = '0';
                    }
                  }
                }}
                style={{
                  transform: 'translateZ(0)',
                  objectFit: 'cover',
                  contain: 'paint',
                }}
              />

              {/* Content overlay - only for title and views */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white">{item.title}</h3>

                  <div className="flex items-center gap-1">
                    <div className="rounded-full bg-white/10 p-1 backdrop-blur-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-white"
                      >
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-white">{item.views}</span>
                  </div>
                </div>
              </div>

              {/* Description overlay - only shown on hover when description exists */}
              {isClient && item.description && (
                <div className="pointer-events-none absolute inset-0 flex items-start justify-center bg-gradient-to-b from-black/90 via-black/80 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="max-h-full overflow-y-auto text-sm leading-relaxed text-white/90">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Tags section with action buttons */}
            <div className="flex items-center justify-between border-t border-white/5 p-3">
              {/* Tags */}
              {isClient && item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Tag
                      key={`tag-${item.title}-${tagIndex}`}
                      tag={{
                        id: String(tag.id || ''),
                        name: tag.name || '',
                        slug: tag.slug || undefined,
                        color: tag.color as TagColor,
                      }}
                      showHash={true}
                      className="text-[10px]"
                    />
                  ))}
                  {item.tags.length > 3 && (
                    <span className="inline-flex items-center border border-gray-500/20 bg-black px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="ml-auto flex gap-1">
                {isClient && item.websiteUrl && (
                  <Button
                    as={Link}
                    href={
                      item.websiteUrl.startsWith('http')
                        ? item.websiteUrl
                        : `https://${item.websiteUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px] text-white/70 hover:text-white"
                  >
                    <Icon icon="heroicons:globe-alt" className="mr-1 h-3 w-3" />
                    Visit
                  </Button>
                )}

                {isClient && item.githubUrl && (
                  <Button
                    as={Link}
                    href={
                      item.githubUrl.startsWith('http')
                        ? item.githubUrl
                        : `https://${item.githubUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px] text-white/70 hover:text-white"
                  >
                    <Icon icon="heroicons:code-bracket-square" className="mr-1 h-3 w-3" />
                    Repo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reserve space for new items to prevent layout shift - improved with exact spacers */}
      {isLoading && (
        <div className="pointer-events-none grid grid-cols-1 gap-8 px-4 opacity-0 md:grid-cols-2 md:px-8 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="relative aspect-[4/3] w-full rounded-lg bg-white/5"
              style={{ contain: 'layout paint style' }}
            />
          ))}
        </div>
      )}

      {/* Loading indicator - Always visible when loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform"
        >
          <div className="flex items-center gap-3 rounded-full bg-black/80 px-6 py-3 backdrop-blur-md">
            <RingLoader size={20} color="#ffffff" speedMultiplier={1.5} />
            <span className="text-sm font-medium text-white">Loading more items</span>
          </div>
        </motion.div>
      )}

      {/* End of content message */}
      {!isLoading && !hasMore && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center text-white/60"
        >
          No more items to load
        </motion.div>
      )}

      {/* Manual load more button for better user experience */}
      {!isLoading && hasMore && items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
          <button
            onClick={handleLoadMoreClick}
            className="rounded-lg bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20"
          >
            Load more
          </button>
        </motion.div>
      )}

      {/* Add global CSS for the fade-in animation */}
      {isMounted && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            
            .sentinel-element {
              pointer-events: none;
            }
          `,
          }}
        />
      )}
    </div>
  );
};

"use client";
import { useScroll, useTransform } from "motion/react";
import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/utilities/cn";

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
}

interface ParallaxScrollProps {
  items: ShowcaseItem[];
  className?: string;
  onImageClick?: (imageUrl: string) => void;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
}

export const ParallaxScroll = ({
  items,
  className,
  onImageClick,
  onLoadMore,
  isLoading = false,
  hasMore = false,
}: ParallaxScrollProps) => {
  const gridRef = useRef<any>(null);
  const lastScrollPosRef = useRef<number>(0);
  const lastItemsLengthRef = useRef<number>(items.length);
  const preloadTriggeredRef = useRef<boolean>(false);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });

  // Reduce the parallax amount significantly
  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Animation variants - simplified to just fade
  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Reset preload trigger when new items are loaded
  useEffect(() => {
    preloadTriggeredRef.current = false;
  }, [items.length]);

  // Preload detection using Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '800px', // Start loading 800px before reaching the end
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If the sentinel is becoming visible and we haven't triggered preload
        if (entry.isIntersecting && !isLoading && !preloadTriggeredRef.current) {
          preloadTriggeredRef.current = true;
          lastScrollPosRef.current = window.scrollY;
          onLoadMore();
        }
      });
    }, options);

    // Create and observe a sentinel element
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.bottom = '800px'; // Position it 800px from the bottom
    sentinel.style.left = '0';
    
    if (gridRef.current) {
      gridRef.current.appendChild(sentinel);
      observer.observe(sentinel);
    }

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [onLoadMore, isLoading, hasMore]);

  // Backup scroll handler for safety
  useEffect(() => {
    if (!onLoadMore || isLoading || !hasMore) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Only trigger if we're closer to the bottom and haven't preloaded
        if (documentHeight - scrollPosition - windowHeight < 500 && !preloadTriggeredRef.current) {
          preloadTriggeredRef.current = true;
          lastScrollPosRef.current = scrollPosition;
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

  // Keep track of items length changes
  useEffect(() => {
    if (items.length > lastItemsLengthRef.current) {
      const lastKnownPosition = lastScrollPosRef.current;
      if (lastKnownPosition > 0) {
        window.scrollTo(0, lastKnownPosition);
      }
    }
    lastItemsLengthRef.current = items.length;
  }, [items.length]);

  const third = Math.ceil(items.length / 3);
  const firstPart = items.slice(0, third);
  const secondPart = items.slice(third, 2 * third);
  const thirdPart = items.slice(2 * third);

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  const ShowcaseImage = ({ item, index }: { item: ShowcaseItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-lg bg-white/5"
    >
      {/* Wrapper div that maintains aspect ratio */}
      <div className="relative w-full aspect-[4/3]">
        {/* Main image */}
        <Image
          src={item.imageUrls?.medium || item.imageUrl}
          className="object-cover transition-opacity duration-300"
          fill
          sizes="(max-width: 768px) 600px, (max-width: 1200px) 900px, 1400px"
          placeholder="blur"
          blurDataURL={item.blurDataURL || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU1RUVHSkdKTUtLR0pHRkpLRktLR0v/2wBDAR"}
          alt={item.title}
          priority={index < 6}
          loading={index < 6 ? "eager" : "lazy"}
          onLoad={(img) => {
            img.currentTarget.classList.remove('opacity-0');
          }}
        />
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4 text-white"
              >
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white font-medium">{item.views}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      className={cn("w-full relative", className)}
      ref={gridRef}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start w-full gap-10 py-40 px-10"
      >
        <motion.div layout className="grid gap-10 auto-rows-max">
          {firstPart.map((item, idx) => (
            <motion.div
              layout
              style={{ y: translateFirst }}
              key={"grid-1" + idx}
              className={cn(
                onImageClick ? "cursor-pointer" : "",
                "transform-gpu"
              )}
              onClick={() => handleImageClick(item.imageUrl)}
            >
              <ShowcaseImage item={item} index={idx} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div layout className="grid gap-10 auto-rows-max">
          {secondPart.map((item, idx) => (
            <motion.div 
              layout
              style={{ y: translateSecond }} 
              key={"grid-2" + idx}
              className={cn(
                onImageClick ? "cursor-pointer" : "",
                "transform-gpu"
              )}
              onClick={() => handleImageClick(item.imageUrl)}
            >
              <ShowcaseImage item={item} index={idx + third} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div layout className="grid gap-10 auto-rows-max">
          {thirdPart.map((item, idx) => (
            <motion.div 
              layout
              style={{ y: translateThird }} 
              key={"grid-3" + idx}
              className={cn(
                onImageClick ? "cursor-pointer" : "",
                "transform-gpu"
              )}
              onClick={() => handleImageClick(item.imageUrl)}
            >
              <ShowcaseImage item={item} index={idx + (2 * third)} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </motion.div>
      )}

      {/* End of content message */}
      {!isLoading && !hasMore && items.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-white/60"
        >
          No more showcases to load
        </motion.div>
      )}
    </div>
  );
};

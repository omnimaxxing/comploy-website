import { getCachedShowcases } from '@/utilities/getShowcases';
import { ShowcaseWrapper } from './ShowcaseWrapper';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import Link from 'next/link';
import { cn } from '@/utilities/cn';

interface DynamicShowcaseItemsProps {
  initialLimit?: number;
}

export async function DynamicShowcaseItems({ initialLimit = 12 }: DynamicShowcaseItemsProps) {
  // Fetch showcase items without caching to ensure fresh data
  const showcasesData = await getCachedShowcases({ page: 1, limit: initialLimit });

  // If no items, show empty state
  if (!showcasesData.docs || showcasesData.docs.length === 0) {
    // Get showcase global for empty state content
    const payload = await getPayload({ config: configPromise });
    const showcaseGlobal = await payload.findGlobal({
      slug: 'showcase-global',
    });

    return (
      <div className="py-12 text-center">
        <h2 className="fl-mb-m">{showcaseGlobal.emptyState.title}</h2>
        <p className="mx-auto max-w-3xl fl-mb-l">{showcaseGlobal.emptyState.message}</p>
        <Link
          href={showcaseGlobal.hero.submitButton.url}
          className={cn(
            'focus-visible:ring-ring inline-flex h-12 items-center justify-center rounded-md px-6 py-3 font-medium shadow-md transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-1',
            {
              'bg-white text-black hover:bg-white/90':
                showcaseGlobal.hero.submitButton.variant === 'primary',
              'bg-black text-white hover:bg-black/90':
                showcaseGlobal.hero.submitButton.variant === 'secondary',
              'border border-white text-white hover:bg-white/10':
                showcaseGlobal.hero.submitButton.variant === 'outline',
            }
          )}
        >
          {showcaseGlobal.hero.submitButton.label}
        </Link>
      </div>
    );
  }

  // Otherwise, render the showcase wrapper with items
  return (
    <ShowcaseWrapper initialShowcases={showcasesData.docs} totalPages={showcasesData.totalPages} />
  );
}

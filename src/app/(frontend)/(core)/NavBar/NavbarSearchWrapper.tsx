'use client';

import { usePathname } from 'next/navigation';
import MinimalSearch from './MinimalSearch';
import { Button } from '@heroui/react';
import Link from 'next/link';

export default function NavbarSearchWrapper() {
  const pathname = usePathname();
  const isPluginsPage =
    pathname === '/plugins' ||
    pathname.startsWith('/plugins/') ||
    pathname.startsWith('/submit') ||
    pathname === '/';

  if (isPluginsPage) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      {/* Full search bar on larger screens only */}
      <div className="hidden w-full max-w-md lg:block">
        <MinimalSearch />
      </div>

      {/* Search icon linking to plugins page on medium screens (and hiding on mobile) */}
      <div className="hidden md:block lg:hidden">
        <Button
          as={Link}
          href="/plugins/all"
          variant="light"
          isIconOnly
          className="text-white transition-colors hover:text-primary-400"
          aria-label="Search plugins"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

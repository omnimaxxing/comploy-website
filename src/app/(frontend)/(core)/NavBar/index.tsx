import { Link } from '@heroui/react';
import { getCachedGlobal } from '@/utilities/getGlobals';
import type { Nav as NavType } from '@/payload-types';
import { cn } from '@/utilities/cn';
import MobileMenu from './MobileMenu';
import Logo from '@/graphics/Logo';
import NavbarSearchWrapper from './NavbarSearchWrapper';
import { Button } from '@heroui/react';
import SignInGitHub from '@/components/sign-in';

export async function NavBar() {
  // Fetch navigation data
  const navData = (await getCachedGlobal('nav', 4)()) as NavType;

  // Default navigation items if none are provided
  const defaultNavItems = [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Contact', url: '/contact' },
  ];

  // Use links from Payload if available, otherwise use defaults
  const navItems = navData?.navLinks?.length ? navData.navLinks : defaultNavItems;

  // Get site name
  const siteName = navData?.siteName || 'Payload Plugins';

  // Get contact button settings
  const showContactButton = navData?.contactButton?.enabled !== false;
  const contactButtonLabel = navData?.contactButton?.label || 'Contact Us';
  const contactButtonUrl = navData?.contactButton?.url || '/contact';

  return (
    <header className="sticky top-0 z-50 w-full bg-background will-change-transform">
      <div className="u-container relative flex h-16 items-center">
        <div className="flex flex-row items-center space-x-2">
          <Link href="/" className="group flex items-center space-x-2 whitespace-nowrap">
            <div className="relative z-10 h-8 w-8 transform overflow-visible transition-all duration-300 ease-out [perspective:800px] group-hover:scale-110">
              <div className="absolute inset-0 animate-pulse-subtle rounded-full bg-primary-400/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="relative transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-style:preserve-3d] group-hover:rotate-x-12 group-hover:rotate-y-12 group-hover:shadow-lg">
                <Logo />
              </div>
            </div>
            <span className="font-medium tracking-[-0.01em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors fl-text-step-0 group-hover:text-primary-400">
              {siteName}
            </span>
          </Link>
        </div>

        {/* Search bar - centered */}
        <NavbarSearchWrapper />

        <nav className="flex flex-1 items-center justify-end space-x-1">
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.url}
                className={cn(
                  'font-medium tracking-[-0.003em] text-white transition-colors fl-text-step--1 fl-px-s hover:text-primary-400',
                  'relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] backdrop-blur-none',
                  'after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-black/0 after:transition-colors after:hover:bg-black/10'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {showContactButton && (
            <Button
              as={Link}
              variant="bordered"
              href={contactButtonUrl}
              className="hidden rounded-none transition-colors fl-mr-m hover:bg-foreground hover:text-background md:inline-flex"
            >
              {contactButtonLabel}
            </Button>
          )}

          <SignInGitHub />

          {/* Mobile menu - client component */}
          <MobileMenu
            navItems={navItems}
            contactButton={{
              show: showContactButton,
              label: contactButtonLabel,
              url: contactButtonUrl,
            }}
          />
        </nav>
      </div>
    </header>
  );
}

export default NavBar;

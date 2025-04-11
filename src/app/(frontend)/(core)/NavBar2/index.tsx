import { Link } from '@heroui/react';
import { getCachedGlobal } from '@/utilities/getGlobals';
import type { Nav as NavType } from '@/payload-types';
import { NavBar2Client } from './index.client';

// Define interfaces for our data structure
interface NavItemChild {
  title?: string;
  url?: string;
  description?: string | null;
  icon?: string;
}

interface NavItem {
  label?: string;
  url?: string;
  hasChildren?: boolean | null;
  children?: NavItemChild[] | null;
}

// Icon mapping function to convert icon names from database to component references
const getIconNameForMapping = (iconName: string) => {
  switch (iconName) {
    case 'book':
      return 'heroicons:book-open';
    case 'trees':
      return 'heroicons:cube-transparent';
    case 'sunset':
      return 'heroicons:sun';
    case 'zap':
      return 'heroicons:bolt';
    case 'code':
      return 'heroicons:code-bracket';
    case 'globe':
      return 'heroicons:globe-alt';
    case 'plugin':
      return 'heroicons:puzzle-piece';
    case 'user':
      return 'heroicons:user';
    default:
      return 'heroicons:bolt'; // Default icon
  }
};

export async function NavBar2() {
  // Fetch navigation data
  const navData = (await getCachedGlobal('nav', 4)()) as NavType;

  // Default navigation items if none are provided
  const defaultNavItems = [
    { title: 'Home', url: '/' },
    { title: 'Plugins', url: '/plugins' },
    { title: 'Showcase', url: '/showcase' },
    { title: 'Payload Releases', url: '/releases' },
    { title: 'About', url: '/about' },
  ];

  // Process nav links to match the client component's expected format
  const menuItems = navData?.navLinks?.length
    ? navData.navLinks.map(link => {
        const menuItem: any = {
          title: link.label,
          url: link.url,
        };

        // Add children if the link has dropdown items
        if (link.hasChildren && Array.isArray(link.children) && link.children.length > 0) {
          menuItem.items = link.children.map(child => ({
            title: child.title,
            url: child.url,
            description: child.description,
            iconName: getIconNameForMapping(child.icon || ''), // Store icon name for client-side mapping
          }));
        }

        return menuItem;
      })
    : defaultNavItems;

  // Get site name
  const siteName = navData?.siteName || 'Payload Plugins';

  // Get submit button settings
  const showSubmitButton = navData?.contactButton?.enabled !== false;
  const submitButtonLabel = navData?.contactButton?.label || 'Submit';
  const submitButtonUrl = navData?.contactButton?.url || '/submit';

  return (
    <NavBar2Client
      menu={menuItems}
      siteName={siteName}
      submitButton={{
        show: showSubmitButton,
        label: submitButtonLabel,
        url: submitButtonUrl,
      }}
    />
  );
}

export default NavBar2;

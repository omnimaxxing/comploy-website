import { Menu } from 'lucide-react';
import { Icon } from '@iconify/react';

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/graphics/Logo';
import SignInGitHub from '@/components/sign-in';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  items?: MenuItem[];
}

interface SubmitButtonProps {
  show: boolean;
  label: string;
  url: string;
}

interface NavbarProps {
  menu?: MenuItem[];
  siteName?: string;
  submitButton?: SubmitButtonProps;
}

export function NavBar2Client({
  menu = [
    { title: 'Home', url: '/' },
    { title: 'Plugins', url: '/plugins' },
    { title: 'Showcase', url: '/showcase' },
    { title: 'About', url: '/about' },
    { title: 'Payload Releases', url: '/releases' },
  ],
  siteName = 'Payload Plugins',
  submitButton = {
    show: true,
    label: 'Submit',
    url: '/submit',
  },
}: NavbarProps) {
  return (
    <section className="sticky top-0 z-50 w-full bg-background py-4">
      <div className="u-container w-full">
        {/* Combined Navbar for both Desktop and Mobile using HeroUI */}
        <Navbar
          isBlurred
          maxWidth="full"
          className="w-full"
          classNames={{
            base: 'w-full',
            wrapper: 'w-full',
            content: 'w-full',
          }}
        >
          <NavbarContent className="lg:hidden">
            <NavbarMenuToggle aria-label="Open menu" className="text-foreground" />
            <NavbarBrand
              as={Link}
              href="/"
              className="group flex items-center space-x-2 whitespace-nowrap px-0"
            >
              <div className="relative z-10 h-8 w-8 transform overflow-visible transition-all duration-300 ease-out [perspective:800px] group-hover:scale-110">
                <div className="absolute inset-0 animate-pulse-subtle rounded-full bg-primary-400/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-style:preserve-3d] group-hover:rotate-y-12 group-hover:shadow-lg">
                  <Logo />
                </div>
              </div>
              <span className="font-medium tracking-[-0.01em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors fl-text-step-0 group-hover:text-primary-400">
                {siteName}
              </span>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden justify-start lg:flex">
            <NavbarBrand
              as={Link}
              href="/"
              className="group flex items-center space-x-2 whitespace-nowrap"
            >
              <div className="relative z-10 h-8 w-8 transform overflow-visible transition-all duration-300 ease-out [perspective:800px] group-hover:scale-110">
                <div className="absolute inset-0 animate-pulse-subtle rounded-full bg-primary-400/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-style:preserve-3d] group-hover:rotate-y-12 group-hover:shadow-lg">
                  <Logo />
                </div>
              </div>
              <span className="font-medium tracking-[-0.01em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors fl-text-step-0 group-hover:text-primary-400">
                {siteName}
              </span>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden gap-4 lg:flex">
            {menu.map(item =>
              item.items && item.items.length > 0 ? (
                <Dropdown key={item.title}>
                  <NavbarItem>
                    <DropdownTrigger>
                      <Button variant="light" className="text-muted-foreground">
                        {item.title}
                      </Button>
                    </DropdownTrigger>
                  </NavbarItem>
                  <DropdownMenu aria-label={`${item.title} dropdown`} className="w-80">
                    {item.items.map(subItem => (
                      <DropdownItem
                        key={subItem.title}
                        startContent={
                          subItem.iconName ? (
                            <Icon icon={subItem.iconName} className="size-5 shrink-0" />
                          ) : null
                        }
                        description={subItem.description}
                        as={Link}
                        href={subItem.url}
                        className="py-2"
                      >
                        {subItem.title}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <NavbarItem key={item.title}>
                  <Link
                    href={item.url}
                    className="text-muted-foreground hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {item.title}
                  </Link>
                </NavbarItem>
              )
            )}
          </NavbarContent>

          <NavbarContent className="justify-end" justify="end">
            {submitButton.show && (
              <NavbarItem className="hidden lg:flex">
                <Button
                  href={submitButton.url}
                  as={Link}
                  variant="bordered"
                  className="rounded-none border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background"
                  size="sm"
                >
                  {submitButton.label}
                </Button>
              </NavbarItem>
            )}
            <NavbarItem className="hidden lg:flex">
              <div className="flex items-center">
                <SignInGitHub />
              </div>
            </NavbarItem>
          </NavbarContent>

          {/* Mobile Navigation Menu */}
          <NavbarMenu className="overflow-y-auto bg-background pt-6">
            <div className="flex flex-col gap-6">
              {/* Menu items */}
              {menu.map(item =>
                item.items && item.items.length > 0 ? (
                  <div key={item.title} className="flex flex-col gap-2">
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="ml-2 flex flex-col gap-2">
                      {item.items.map(subItem => (
                        <NavbarMenuItem key={subItem.title}>
                          <Link
                            className="hover:bg-muted hover:text-accent-foreground flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors"
                            href={subItem.url}
                          >
                            {subItem.iconName ? (
                              <Icon icon={subItem.iconName} className="size-5 shrink-0" />
                            ) : null}
                            <div>
                              <div className="text-sm font-semibold">{subItem.title}</div>
                              {subItem.description && (
                                <p className="text-muted-foreground text-sm leading-snug">
                                  {subItem.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        </NavbarMenuItem>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavbarMenuItem key={item.title}>
                    <Link
                      href={item.url}
                      className="hover:text-accent-foreground inline-flex h-10 items-center font-semibold"
                    >
                      {item.title}
                    </Link>
                  </NavbarMenuItem>
                )
              )}
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <SignInGitHub />
                </div>
                {submitButton.show && (
                  <Button
                    as={Link}
                    href={submitButton.url}
                    variant="bordered"
                    className="rounded-none border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    {submitButton.label}
                  </Button>
                )}
              </div>
            </div>
          </NavbarMenu>
        </Navbar>
      </div>
    </section>
  );
}

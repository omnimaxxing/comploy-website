'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/cn'
import MinimalSearch from './MinimalSearch'
import { usePathname } from 'next/navigation'
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button } from '@heroui/react'

type NavItem = {
  label: string
  url: string
}

type ContactButton = {
  show: boolean
  label: string
  url: string
}

type MobileMenuProps = {
  navItems: NavItem[]
  contactButton: ContactButton
}

export default function MobileMenu({ navItems, contactButton }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isPluginsPage = pathname === '/plugins' || pathname.startsWith('/plugins/')
  
  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <Button 
        onPress={() => setIsOpen(true)}
        className="ml-2 flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 transition-colors mix-blend-difference"
        variant="light"
        isIconOnly
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </Button>

      {/* HeroUI Drawer */}
      <Drawer 
        isOpen={isOpen} 
        onOpenChange={handleOpenChange}
        placement="bottom"
        size="full"
        shouldBlockScroll
        classNames={{
          base: "bg-black/95 backdrop-blur-md max-h-[80vh] rounded-t-xl",
          backdrop: "bg-black/60 backdrop-blur-sm",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10"
        }}
      >
        <DrawerContent>
          <DrawerHeader className="flex justify-between items-center">
            <span className="text-lg font-medium text-white">Menu</span>
          </DrawerHeader>
          <DrawerBody>
            <nav className="flex flex-col h-full">
              {/* Search box - only on non-plugins pages */}
              {!isPluginsPage && (
                <div className="mb-6 px-1">
                  <MinimalSearch 
                    onSubmit={() => setIsOpen(false)} 
                  />
                </div>
              )}
              
              <div className="flex flex-col space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-3 text-lg font-medium text-white transition-colors hover:text-primary-400 border-b border-white/10",
                      "mix-blend-difference"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </DrawerBody>
          
          {contactButton.show && (
            <DrawerFooter>
              <Button
                as={Link}
                href={contactButton.url}
                onPress={() => setIsOpen(false)}
                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                radius="none"
              >
                {contactButton.label}
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
} 
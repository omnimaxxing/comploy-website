'use client'

import { Button, Spinner } from '@heroui/react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { PluginCard } from '@/components/plugins/PluginCard'
import type { Plugin } from '@/payload-types'
import type { Session } from 'next-auth'

interface MyPluginsClientProps {
  session: Session | null
  verifiedPlugins: Plugin[]
  unclaimedPlugins: Plugin[]
  error: string | null
}

export function MyPluginsClient({ session, verifiedPlugins, unclaimedPlugins, error }: MyPluginsClientProps) {
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Icon icon="heroicons:exclamation-circle" className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-foreground/70 mb-6">{error}</p>
          <Button as={Link} href="/" color="primary" radius="none">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      {/* User profile header */}
      <div className="mb-12 border-b border-foreground/10 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-foreground/10 flex items-center justify-center">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'GitHub User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon icon="mdi:github" className="w-8 h-8 text-foreground/70" />
            )}
          </div>
          <div>
            <h1 className="fl-text-step-3 font-medium">{session?.user?.name || 'GitHub User'}</h1>
            <p className="text-foreground/70">@{session?.user?.username}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            as={Link} 
            href="/submit/plugin" 
            color="primary" 
            radius="none"
            startContent={<Icon icon="heroicons:plus" />}
          >
            Submit New Plugin
          </Button>
        </div>
      </div>

      {/* Verified Plugins section */}
      <div className="mb-16">
        <h2 className="fl-text-step-2 font-medium mb-6">Your Verified Plugins</h2>
        
        {verifiedPlugins.length === 0 ? (
          <div className="bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-lg p-8 text-center">
            <Icon icon="heroicons:puzzle-piece" className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No verified plugins found</h3>
            <p className="text-foreground/70 mb-6">
              You haven't submitted any plugins yet, or your plugins haven't been verified.
            </p>
            <Button 
              as={Link} 
              href="/submit/plugin" 
              color="primary" 
              radius="none"
              startContent={<Icon icon="heroicons:plus" />}
            >
              Submit Your First Plugin
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedPlugins.map((plugin) => (
              <div key={plugin.id} className="bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors">
                <PluginCard plugin={plugin} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unclaimed Plugins section - only show if there are unclaimed plugins */}
      {unclaimedPlugins.length > 0 && (
        <div>
          <h2 className="fl-text-step-2 font-medium mb-6 flex items-center">
            <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-amber-500 mr-2" />
            Plugins You May Own
          </h2>
          
          <div className="bg-amber-950/20 border border-amber-500/20 p-4 mb-6 rounded-none">
            <p className="text-foreground/80">
              These plugins appear to be from GitHub repositories you own, but they haven't been verified by you yet.
              Verify ownership to manage these plugins and receive a verification badge.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unclaimedPlugins.map((plugin) => (
              <div key={plugin.id} className="bg-foreground/5 backdrop-blur-sm border border-amber-500/30 rounded-lg hover:border-amber-500/50 transition-colors">
                <div className="absolute top-2 right-2 z-10">
                  <Button 
                    as={Link}
                    href={`/submit/plugin?verify=${plugin.slug}`}
                    size="sm"
                    color="warning"
                    className="text-xs"
                    radius="none"
                    startContent={<Icon icon="heroicons:shield-check" className="w-3 h-3" />}
                  >
                    Verify
                  </Button>
                </div>
                <PluginCard plugin={plugin} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

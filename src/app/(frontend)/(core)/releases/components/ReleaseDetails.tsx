'use client'

import React from 'react'
import { Card, Badge } from '@heroui/react'
import type { Release } from '@/payload-types'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ReleaseDetailsProps {
  release: Release
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const ReleaseDetails: React.FC<ReleaseDetailsProps> = ({ release }) => {
  return (
    <Card className="fl-mb-m p-6 bg-card/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
      <div className="fl-mb-s">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="fl-text-step-0 font-bold text-primary">
              <a 
                href={`https://github.com/payloadcms/payload/releases/tag/${release.version}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {release.version}
              </a>
              <span className="ml-2 text-sm text-muted-foreground">
                ({formatDate(release.releaseDate)})
              </span>
            </h2>
          </div>
          
          {release.isBreaking && (
            <Badge variant="solid" className="bg-red-600">
              BREAKING
            </Badge>
          )}
        </div>
      </div>
      
      {/* Always show the rendered markdown content */}
      <MarkdownRenderer content={release.content} />
    </Card>
  )
}

export default ReleaseDetails 
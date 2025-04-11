'use client'

import { cn } from '@/utilities/cn'
import type React from 'react'
import { serializeLexical } from './serialize'

type Props = {
  className?: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  content: Record<string, any>
  enableGutter?: boolean
  enableProse?: boolean
}

const RichText: React.FC<Props> = ({
  className,
  content,
  enableGutter = true,
  enableProse = true,
}) => {
  if (!content) {
    return null
  }

  return (
    <div
      className={cn(
        {
          'container ': enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose dark:prose-invert ': enableProse,
        },
        className,
      )}
    >
      {content &&
        !Array.isArray(content) &&
        typeof content === 'object' &&
        'root' in content &&
        serializeLexical({ nodes: content?.root?.children, addHeaderIds: true })}
    </div>
  )
}

export default RichText

import { cn } from '@/app/utilities/cn'
import { Button, type ButtonProps } from '@/components/ui/Button'
import type { Link as PayloadLink } from '@/payload-types'
import NextLink from 'next/link'
import type React from 'react'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  className?: string
  link?: PayloadLink
  size?: ButtonProps['size']
  children?: React.ReactNode
  newTab?: boolean // Added this prop
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    appearance = 'inline',
    className,
    link,
    size: sizeFromProps,
    children,
    newTab, // Added this prop
  } = props

  if (!link?.url) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  if (appearance === 'inline') {
    return (
      <NextLink className={cn(className)} href={link.url} {...newTabProps}>
        {link.name || children}
      </NextLink>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <NextLink href={link.url} {...newTabProps}>
        {link.name || children}
      </NextLink>
    </Button>
  )
}

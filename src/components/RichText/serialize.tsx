'use client'
import type { Link } from '@/payload-types'

import type { SerializedListItemNode, SerializedListNode } from '@payloadcms/richtext-lexical'
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import type { LinkFields, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedLexicalNode, SerializedTextNode } from 'lexical'
import type { SerializedElementNode } from 'lexical'
import React, { Fragment, type JSX } from 'react'
import { CMSLink } from '../CMSLink'
import {
	IS_BOLD,
	IS_CODE,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
	IS_UNDERLINE,
} from './nodeFormat'

interface Props {
	nodes: SerializedLexicalNode[]
	addHeaderIds?: boolean
}

export function serializeLexical({ nodes, addHeaderIds = false }: Props): JSX.Element {
	return (
		<Fragment>
			{nodes?.map((_node, index): JSX.Element | null => {
				if (_node.type === 'text') {
					const node = _node as SerializedTextNode
					let text = <React.Fragment key={index}>{node.text}</React.Fragment>
					if (node.format & IS_BOLD) {
						text = (
							<strong key={index} className="font-bold">
								{text}
							</strong>
						)
					}
					if (node.format & IS_ITALIC) {
						text = (
							<em key={index} className="italic">
								{text}
							</em>
						)
					}
					if (node.format & IS_STRIKETHROUGH) {
						text = (
							<span key={index} className="line-through">
								{text}
							</span>
						)
					}
					if (node.format & IS_UNDERLINE) {
						text = (
							<span key={index} className="underline">
								{text}
							</span>
						)
					}
					if (node.format & IS_CODE) {
						text = (
							<code
								key={index}
								className="bg-primary-100 text-primary-900 fl-px-2xs fl-py-2xs rounded"
							>
								{node.text}
							</code>
						)
					}
					if (node.format & IS_SUBSCRIPT) {
						text = <sub key={index}>{text}</sub>
					}
					if (node.format & IS_SUPERSCRIPT) {
						text = <sup key={index}>{text}</sup>
					}
					return text
				}

				if (_node == null) {
					return null
				}

				const serializedChildrenFn = (node: SerializedElementNode): JSX.Element | null => {
					if (node.children == null) {
						return null
					}
					if (node?.type === 'list' && (node as SerializedListNode)?.listType === 'check') {
						for (const item of node.children) {
							if ('checked' in item) {
								if (!item?.checked) {
									item.checked = false
								}
							}
						}
						return serializeLexical({ nodes: node.children, addHeaderIds })
					}
					return serializeLexical({ nodes: node.children, addHeaderIds })
				}

				const serializedChildren =
					'children' in _node ? serializedChildrenFn(_node as SerializedElementNode) : ''

				if (_node.type === 'block') {
					//@ts-expect-error
					const block = _node.fields

					//@ts-expect-error
					const blockType = _node.fields?.blockType

					if (!block || !blockType) {
						return null
					}

					switch (blockType) {
						default:
							return null
					}
				}
				switch (_node.type) {
					case 'linebreak': {
						return <br className="fl-my-s" key={index} />
					}
					case 'paragraph': {
						return (
							<p className="fl-mb-m text-primary-800" key={index}>
								{serializedChildren}
							</p>
						)
					}
					case 'heading': {
						const node = _node as SerializedHeadingNode
						type Heading = Extract<keyof JSX.IntrinsicElements, 'h1' | 'h2' | 'h3' | 'h4' | 'h5'>
						const Tag = node?.tag as Heading
						const headingClasses = {
							h1: 'fl-mb-l text-primary-900',
							h2: 'fl-mb-m text-primary-800',
							h3: 'fl-mb-s text-primary-700',
							h4: 'fl-mb-xs text-primary-600',
							h5: 'fl-mb-2xs text-primary-500',
						}
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						const headingText = node.children.map((child: any) => child.text).join('')
						const headingId = addHeaderIds
							? headingText.toLowerCase().replace(/\s+/g, '-')
							: undefined
						return (
							<Tag className={`${headingClasses[Tag]} font-bold`} key={index} id={headingId}>
								{serializedChildren}
							</Tag>
						)
					}
					case 'list': {
						const node = _node as SerializedListNode
						type List = Extract<keyof JSX.IntrinsicElements, 'ol' | 'ul'>
						const Tag = node?.tag as List
						return (
							<Tag className="fl-mb-m fl-pl-m text-primary-800" key={index}>
								{serializedChildren}
							</Tag>
						)
					}
					case 'listitem': {
						const node = _node as SerializedListItemNode
						if (node?.checked != null) {
							return (
								<li
									aria-checked={node.checked ? 'true' : 'false'}
									className={`fl-mb-2xs ${node.checked ? 'text-primary-600' : 'text-primary-800'}`}
									key={index}
									// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <explanation>
									role="checkbox"
									tabIndex={-1}
									value={node?.value}
								>
									{serializedChildren}
								</li>
							)
						}
						return (
							<li key={index} value={node?.value} className="fl-mb-2xs">
								{serializedChildren}
							</li>
						)
					}
					case 'quote': {
						return (
							<blockquote
								className="fl-my-m fl-pl-m border-l-4 border-primary-300 italic text-primary-700"
								key={index}
							>
								{serializedChildren}
							</blockquote>
						)
					}
					case 'link': {
						const node = _node as SerializedLexicalNode & { fields: LinkFields }
						const fields = node.fields
						const link: Link = {
							id: `link-${index}`, // Generate a unique ID
							url:
								fields.linkType === 'internal' ? fields.doc?.value?.slug || '' : fields.url || '',
							label: serializedChildren?.toString() || '',
							newTab: Boolean(fields?.newTab),
							updatedAt: new Date().toISOString(), // Use current date as a placeholder
							createdAt: new Date().toISOString(), // Use current date as a placeholder
						}
						return (
							<CMSLink
								key={index}
								link={link}
								className="text-primary-600 hover:text-primary-800 underline"
							>
								{serializedChildren}
							</CMSLink>
						)
					}

					default:
						return null
				}
			})}
		</Fragment>
	)
}

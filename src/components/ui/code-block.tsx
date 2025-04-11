'use client'

import { IconClipboard, IconCheck } from '@tabler/icons-react'
import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
	nightOwl,
	atomDark,
	dracula,
	vscDarkPlus,
	oneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { cn } from '@/utilities/cn'

// Create a customized theme based on oneDark with transparent backgrounds
const customTheme = {
	...oneDark,
	'pre[class*="language-"]': {
		...oneDark['pre[class*="language-"]'],
		background: 'transparent',
	},
	'code[class*="language-"]': {
		...oneDark['code[class*="language-"]'],
		background: 'transparent',
	},
	// Override token backgrounds to ensure no highlighting
	token: {
		background: 'transparent !important',
	},
	span: {
		background: 'transparent !important',
	},
}

const themes = {
	nightOwl,
	atomDark,
	dracula,
	vscDarkPlus,
	oneDark,
	custom: customTheme,
}

export type ThemeKey = keyof typeof themes

export type TabType = {
	label: string
	code: string
	language?: string
	highlightLines?: number[]
}

export interface CodeBlockProps {
	className?: string
	theme?: ThemeKey
	showLineNumbers?: boolean
	wrapLines?: boolean
	wrapLongLines?: boolean
	tabs?: TabType[]
	defaultLanguage?: string
}

export interface SingleCodeBlockProps extends CodeBlockProps {
	code: string
	language?: string
	highlightLines?: number[]
	tabs?: never
}

export interface TabsCodeBlockProps extends CodeBlockProps {
	code?: never
	language?: never
	highlightLines?: never
	tabs: TabType[]
}

export default function CodeBlock(props: SingleCodeBlockProps | TabsCodeBlockProps) {
	const {
		theme = 'custom',
		showLineNumbers = false,
		wrapLines = false,
		wrapLongLines = false,
		className,
		defaultLanguage = 'bash',
		tabs,
	} = props

	const [activeTab, setActiveTab] = useState(0)
	const [copied, setCopied] = useState(false)

	// Determine if we're using tabs or a single code block
	const hasTabs = tabs && tabs.length > 0

	// Get the current code to display
	const currentCode = hasTabs ? tabs[activeTab].code : (props as SingleCodeBlockProps).code
	const currentLanguage = hasTabs
		? tabs[activeTab].language || defaultLanguage
		: (props as SingleCodeBlockProps).language || defaultLanguage
	const currentHighlightLines = hasTabs
		? tabs[activeTab].highlightLines || []
		: (props as SingleCodeBlockProps).highlightLines || []

	const copyToClipboard = () => {
		navigator.clipboard.writeText(currentCode).then(() => {
			setCopied(true)
			setTimeout(() => {
				setCopied(false)
			}, 3000)
		})
	}

	return (
		<div className={cn('relative group', className)}>
			<div className="relative rounded-none bg-background border border-border shadow-xl">
				{/* Tabs header with copy button */}
				<div className="flex items-center justify-between border-b border-border">
					<div className="flex">
						{hasTabs ? (
							tabs.map((tab, index) => (
								<button
									key={index}
									onClick={() => setActiveTab(index)}
									className={cn(
										'px-4 py-2 text-xs font-medium transition-colors focus:outline-none',
										activeTab === index
											? 'text-white border-b-2 border-primary -mb-px'
											: 'text-muted-foreground hover:text-foreground',
									)}
								>
									{tab.label}
								</button>
							))
						) : (
							<div className="px-4 py-2 text-xs font-medium text-zinc-400">{currentLanguage}</div>
						)}
					</div>

					<button
						onClick={copyToClipboard}
						className="px-4 py-2 text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
					>
						{copied ? (
							<>
								<IconCheck className="w-4 h-4 text-green-500" />
								<span className="text-green-500">Copied!</span>
							</>
						) : (
							<>
								<IconClipboard className="w-4 h-4" />
								<span>Copy code</span>
							</>
						)}
					</button>
				</div>

				{/* Code content */}
				<div className="p-4 overflow-auto">
					<SyntaxHighlighter
						language={currentLanguage}
						style={themes[theme]}
						showLineNumbers={showLineNumbers}
						wrapLines={wrapLines}
						wrapLongLines={wrapLongLines}
						lineProps={(lineNumber) => {
							const style: React.CSSProperties = {
								display: 'block',
								width: '100%',
							}
							if (currentHighlightLines.includes(lineNumber)) {
								style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
								style.borderLeft = '3px solid #60A5FA'
								style.paddingLeft = '16px'
							}
							return { style }
						}}
						customStyle={{
							margin: 0,
							backgroundColor: 'transparent',
							padding: 0,
							fontSize: '14px',
						}}
						codeTagProps={{
							style: {
								backgroundColor: 'transparent',
							},
						}}
						// Override inline styles to remove backgrounds
						useInlineStyles={true}
					>
						{currentCode.trim()}
					</SyntaxHighlighter>
				</div>
			</div>
		</div>
	)
}

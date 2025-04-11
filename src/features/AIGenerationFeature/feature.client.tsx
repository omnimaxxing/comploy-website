'use client'

import React, { useEffect } from 'react'
import {
	createClientFeature,
	toolbarFeatureButtonsGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import type { ToolbarGroupItem } from '@payloadcms/richtext-lexical'
import {
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_LOW,
	COPY_COMMAND,
	PASTE_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'

import type { AIGenerationFeatureProps } from './feature.server'
import AIGenerationToolbarButton from './components/AIGenerationToolbarButton'
import { AI_GENERATION_COMMAND, AI_SHOW_REVIEW_CONTROLS, AI_HIDE_REVIEW_CONTROLS } from './commands'
import { AIHighlightNode } from './nodes/AIHighlightNode'
import { OriginalContentNode } from './nodes/OriginalContentNode'

export type AIGenerationItem = ToolbarGroupItem & {
	key: string
}

// Custom clipboard handler component
function ClipboardHandler(): null {
	const [editor] = useLexicalComposerContext()

	// Register a handler for the copy command
	useEffect(() => {
		return editor.registerCommand(
			COPY_COMMAND,
			(event: ClipboardEvent) => {
				// Get the current editor state
				const editorState = editor.getEditorState()

				// Read the editor state to find highlighted nodes in the selection
				editorState.read(() => {
					const selection = window.getSelection()
					if (!selection || selection.rangeCount === 0) return false

					// Check if the selection contains any highlighted nodes
					const range = selection.getRangeAt(0)
					const fragment = range.cloneContents()

					// Check if the fragment contains any highlighted nodes
					const hasHighlightedNodes =
						fragment.querySelectorAll('.ai-highlight-node, .original-content-node').length > 0

					if (hasHighlightedNodes && event.clipboardData) {
						// Get the plain text content of the selection
						const plainText = selection.toString()

						// Prevent the default copy behavior
						event.preventDefault()

						// Set the plain text to the clipboard
						event.clipboardData.setData('text/plain', plainText)

						// Also set HTML data but without the highlight classes
						const tempDiv = document.createElement('div')
						tempDiv.appendChild(fragment.cloneNode(true))

						// Remove highlight classes from the HTML
						tempDiv
							.querySelectorAll('.ai-highlight-node, .original-content-node')
							.forEach((node) => {
								if (node instanceof HTMLElement) {
									// Create a new span without the highlight class
									const newSpan = document.createElement('span')
									newSpan.textContent = node.textContent
									node.parentNode?.replaceChild(newSpan, node)
								}
							})

						// Set the cleaned HTML to the clipboard
						event.clipboardData.setData('text/html', tempDiv.innerHTML)

						return true
					}

					return false
				})

				// Let the default copy handler run if we didn't handle it
				return false
			},
			COMMAND_PRIORITY_EDITOR,
		)
	}, [editor])

	// Register a handler for the paste command
	useEffect(() => {
		return editor.registerCommand(
			PASTE_COMMAND,
			(event: ClipboardEvent) => {
				// Check if we have clipboard data
				if (!event.clipboardData) return false

				// Get the HTML content from the clipboard
				const htmlContent = event.clipboardData.getData('text/html')

				// If there's no HTML content, let the default paste handler run
				if (!htmlContent) return false

				// Check if the HTML content contains any highlighted nodes
				const tempDiv = document.createElement('div')
				tempDiv.innerHTML = htmlContent

				const hasHighlightedNodes =
					tempDiv.querySelectorAll('.ai-highlight-node, .original-content-node').length > 0 ||
					tempDiv.innerHTML.includes('data-ai-highlight') ||
					tempDiv.innerHTML.includes('data-original-content')

				if (hasHighlightedNodes) {
					// Prevent the default paste behavior
					event.preventDefault()

					// Clean the HTML content by removing highlight classes and data attributes
					tempDiv.querySelectorAll('.ai-highlight-node, .original-content-node').forEach((node) => {
						if (node instanceof HTMLElement) {
							// Remove the highlight classes
							node.classList.remove('ai-highlight-node', 'original-content-node')
							// Remove the data attributes
							node.removeAttribute('data-ai-highlight')
							node.removeAttribute('data-original-content')
							// If the node is now just a plain span with no classes or attributes, unwrap it
							if (
								node.tagName.toLowerCase() === 'span' &&
								node.attributes.length === 0 &&
								node.className === ''
							) {
								const parent = node.parentNode
								if (parent) {
									while (node.firstChild) {
										parent.insertBefore(node.firstChild, node)
									}
									parent.removeChild(node)
								}
							}
						}
					})

					// Get the cleaned HTML content
					const cleanedHtml = tempDiv.innerHTML
					const plainText = tempDiv.textContent || ''

					// Instead of creating a new paste event, use the editor's insertFromClipboard method
					// which is more reliable across browsers
					editor.update(() => {
						// Insert the cleaned content at the current selection
						editor.dispatchCommand(PASTE_COMMAND, {
							text: plainText,
							html: cleanedHtml,
						} as any)
					})

					return true
				}

				return false
			},
			COMMAND_PRIORITY_EDITOR,
		)
	}, [editor])

	return null
}

// Create the client feature
export const AIGenerationClientFeature = createClientFeature<
	AIGenerationFeatureProps,
	AIGenerationItem
>(({ props }) => {
	const aiGenerationItems = [
		{
			key: 'aiGeneration',
			label: 'AI Generation',
			ChildComponent: AIGenerationToolbarButton,
			// This is needed to prevent the toolbar from wrapping our component in a button
			shouldInsertWithoutWrapper: true,
			isActive: () => false,
			onSelect: () => {
				// This is intentionally empty as the component handles its own click events
				return false
			},
		},
	]

	const toolbarGroup = toolbarFeatureButtonsGroupWithItems(aiGenerationItems)

	return {
		nodes: [AIHighlightNode, OriginalContentNode],
		plugins: [
			{
				Component: ClipboardHandler,
				position: 'normal',
			},
		],
		commands: [
			{
				command: AI_GENERATION_COMMAND,
				priority: COMMAND_PRIORITY_EDITOR,
				// The command handler is implemented in the AIGenerationToolbarButton component
				// This is just a placeholder to register the command
				handler: (payload, editor) => {
					console.log('AI_GENERATION_COMMAND handler called with payload:', payload)
					// Allow the callback to execute
					if (typeof payload === 'function') {
						payload()
					}
					return true
				},
			},
			{
				command: AI_SHOW_REVIEW_CONTROLS,
				priority: COMMAND_PRIORITY_EDITOR,
				handler: (payload) => {
					console.log('AI_SHOW_REVIEW_CONTROLS handler called with payload:', payload)
					return false
				},
			},
			{
				command: AI_HIDE_REVIEW_CONTROLS,
				priority: COMMAND_PRIORITY_LOW,
				handler: () => {
					console.log('AI_HIDE_REVIEW_CONTROLS handler called')
					return false
				},
			},
		],
		toolbarFixed: {
			groups: [
				{
					...toolbarGroup,
					key: 'aiGenerationGroup',
				},
			],
		},
		toolbarInline: {
			groups: [
				{
					...toolbarGroup,
					key: 'aiGenerationGroup',
				},
			],
		},
	}
})

export default AIGenerationClientFeature

'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import {
	$getSelection,
	$isRangeSelection,
	$isNodeSelection,
	$setSelection,
	TextNode,
	$createTextNode,
	$getNodeByKey,
	$getRoot,
	$isTextNode,
	ElementNode,
} from '@payloadcms/richtext-lexical/lexical'
import { $isAIHighlightNode } from '../nodes/AIHighlightNode'
import { $isOriginalContentNode } from '../nodes/OriginalContentNode'
import { AI_HIDE_REVIEW_CONTROLS, AI_SHOW_REVIEW_CONTROLS } from '../commands'
import './AIGenerationToolbarButton.scss'

type AIReviewControlsProps = {
	nodeKey: string
}

// Helper function to check if a node has children
function hasChildren(node: any): boolean {
	return node && typeof node.getChildren === 'function'
}

export function AIReviewControls({ nodeKey }: AIReviewControlsProps): React.ReactElement | null {
	const [editor] = useLexicalComposerContext()
	const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
	const controlsRef = useRef<HTMLDivElement>(null)
	const targetRef = useRef<{ element: HTMLElement | null; rect: DOMRect | null }>({
		element: null,
		rect: null,
	})
	const [editorElement, setEditorElement] = useState<HTMLElement | null>(null)
	const [isVisible, setIsVisible] = useState(true)
	const positionUpdateTimerRef = useRef<NodeJS.Timeout | null>(null)

	// Find the editor root element
	useEffect(() => {
		// Get the editor root element
		const rootElement = editor.getRootElement()
		if (rootElement) {
			setEditorElement(rootElement)
		}
	}, [editor])

	// Update position based on the current target element's position
	const updatePositionFromTarget = useCallback(() => {
		const targetElement = targetRef.current.element
		if (!targetElement) return

		// Get the current bounding rectangle
		const rect = targetElement.getBoundingClientRect()
		targetRef.current.rect = rect

		// Get the editor's position
		const editorRect = editorElement?.getBoundingClientRect() || { top: 0, left: 0 }

		// Position the controls above the target element
		// Using client coordinates (viewport-relative) for fixed positioning
		const top = rect.top - 28
		const left = rect.left

		setPosition({ top, left })
	}, [editorElement])

	const updatePosition = useCallback(() => {
		editor.getEditorState().read(() => {
			const node = $getNodeByKey(nodeKey)
			if (!node) {
				// Try to find an AI highlight node if the specific node is not found
				// This helps with undo operations where the node key might have changed
				const root = $getRoot()
				let foundNode: any = null

				// Helper function to recursively search for AI highlight nodes
				const findAINodes = (currentNode: any) => {
					if ($isAIHighlightNode(currentNode)) {
						foundNode = currentNode
						return true
					}

					// Check children if they exist
					if (hasChildren(currentNode)) {
						const children = currentNode.getChildren()
						for (const child of children) {
							if (findAINodes(child)) {
								return true
							}
						}
					}

					return false
				}

				// Start the search from the root
				findAINodes(root)

				if (!foundNode) {
					// No AI highlight node found, hide the controls
					setIsVisible(false)
					return
				}

				// Use the found node instead
				const element = editor.getElementByKey(foundNode.getKey())
				if (!element) {
					console.log('Could not find element for AI node')
					setIsVisible(false)
					return
				}

				// Store the element reference for scroll updates
				targetRef.current.element = element
			} else if ($isAIHighlightNode(node)) {
				// Get the DOM element for the AI node
				const element = editor.getElementByKey(nodeKey)
				if (!element) {
					console.log('Could not find element for AI node')
					setIsVisible(false)
					return
				}

				// Store the element reference for scroll updates
				targetRef.current.element = element

				// Find the separator element (it should be right before the AI node)
				let separatorElement: HTMLElement | null = null
				const prevSibling = element.previousSibling

				if (prevSibling && prevSibling.textContent && prevSibling.textContent.includes('⟶')) {
					separatorElement = prevSibling as HTMLElement
					// If we found a separator, use it as our target instead
					targetRef.current.element = separatorElement
				}
			} else {
				// Not an AI highlight node, hide the controls
				setIsVisible(false)
				return
			}

			// Make sure the controls are visible
			setIsVisible(true)

			// Calculate position based on current viewport position
			updatePositionFromTarget()
		})
	}, [editor, nodeKey, updatePositionFromTarget])

	// Function to recursively collect nodes
	const collectNodes = useCallback(
		(node: any, aiNodes: string[], originalNodes: string[], separatorNodes: string[]) => {
			if ($isAIHighlightNode(node)) {
				aiNodes.push(node.getKey())
			} else if ($isOriginalContentNode(node)) {
				originalNodes.push(node.getKey())
			} else if ($isTextNode(node) && node.getTextContent().includes('⟶')) {
				separatorNodes.push(node.getKey())
			}

			// Process children if they exist
			if (hasChildren(node)) {
				const children = node.getChildren()
				children.forEach((child: any) => {
					collectNodes(child, aiNodes, originalNodes, separatorNodes)
				})
			}
		},
		[],
	)

	// Handle accepting the AI-generated content
	const handleAccept = useCallback(() => {
		editor.update(() => {
			// Find all AI highlight nodes, original content nodes, and separators
			const root = $getRoot()
			const aiNodes: string[] = []
			const originalNodes: string[] = []
			const separatorNodes: string[] = []

			// Traverse the editor to find all relevant nodes
			root.getChildren().forEach((node) => {
				collectNodes(node, aiNodes, originalNodes, separatorNodes)
			})

			// Process AI nodes - replace them with regular text nodes
			for (const key of aiNodes) {
				const node = $getNodeByKey(key)
				if (node && $isAIHighlightNode(node)) {
					const textContent = node.getTextContent()
					const textNode = $createTextNode(textContent)
					node.replace(textNode)
				}
			}

			// Remove original nodes and separators
			for (const key of [...originalNodes, ...separatorNodes]) {
				const node = $getNodeByKey(key)
				if (node) {
					node.remove()
				}
			}

			// Hide the review controls
			editor.dispatchCommand(AI_HIDE_REVIEW_CONTROLS, null)
		})
	}, [editor, collectNodes])

	// Handle rejecting the AI-generated content
	const handleReject = useCallback(() => {
		editor.update(() => {
			// Find all AI highlight nodes, original content nodes, and separators
			const root = $getRoot()
			const aiNodes: string[] = []
			const originalNodes: string[] = []
			const separatorNodes: string[] = []

			// Traverse the editor to find all relevant nodes
			root.getChildren().forEach((node) => {
				collectNodes(node, aiNodes, originalNodes, separatorNodes)
			})

			// Remove AI nodes and separators, keep original content
			for (const key of [...aiNodes, ...separatorNodes]) {
				const node = $getNodeByKey(key)
				if (node) {
					node.remove()
				}
			}

			// Convert original content nodes to regular text nodes
			for (const key of originalNodes) {
				const node = $getNodeByKey(key)
				if (node && $isOriginalContentNode(node)) {
					const textContent = node.getTextContent()
					const textNode = $createTextNode(textContent)
					node.replace(textNode)
				}
			}

			// Hide the review controls
			editor.dispatchCommand(AI_HIDE_REVIEW_CONTROLS, null)
		})
	}, [editor, collectNodes])

	// Update position when the component mounts
	useEffect(() => {
		updatePosition()

		// Set up a timer to periodically check and update position
		// This helps with undo operations where the node might reappear
		const intervalId = setInterval(() => {
			updatePosition()
		}, 500)

		return () => {
			clearInterval(intervalId)
		}
	}, [updatePosition])

	// Update position when the window scrolls or resizes
	useEffect(() => {
		const handleScroll = () => {
			// Use a debounce mechanism to avoid too many updates
			if (positionUpdateTimerRef.current) {
				clearTimeout(positionUpdateTimerRef.current)
			}

			positionUpdateTimerRef.current = setTimeout(() => {
				updatePosition()
			}, 10)
		}

		const handleResize = () => {
			updatePosition()
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)

			if (positionUpdateTimerRef.current) {
				clearTimeout(positionUpdateTimerRef.current)
			}
		}
	}, [updatePosition])

	// Register a command listener to handle undo/redo operations
	useEffect(() => {
		// When editor state changes, check if we need to update the position
		const removeUpdateListener = editor.registerUpdateListener(() => {
			// Check if there was an undo/redo operation
			setTimeout(() => {
				updatePosition()
			}, 0)
		})

		return () => {
			removeUpdateListener()
		}
	}, [editor, updatePosition])

	// If we don't have a position yet or the controls shouldn't be visible, don't render anything
	if (!position || !isVisible) {
		return null
	}

	// Render the controls using a portal to avoid z-index issues
	return createPortal(
		<div
			ref={controlsRef}
			className="ai-review-controls-inline"
			style={{
				position: 'fixed', // Use fixed positioning to stay in place during scrolling
				top: `${position.top}px`,
				left: `${position.left}px`,
				transform: 'translateX(-50%)',
			}}
		>
			<div className="ai-review-buttons">
				<button
					className="ai-review-accept"
					onClick={handleAccept}
					title="Accept AI suggestion"
					aria-label="Accept AI suggestion"
				>
					✓
				</button>
				<button
					className="ai-review-reject"
					onClick={handleReject}
					title="Reject AI suggestion"
					aria-label="Reject AI suggestion"
				>
					✕
				</button>
			</div>
		</div>,
		document.body,
	)
}

export default AIReviewControls

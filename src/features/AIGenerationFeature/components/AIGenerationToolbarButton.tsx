'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import {
	$getSelection,
	$isRangeSelection,
	$getRoot,
	$createTextNode,
	$createParagraphNode,
	$isNodeSelection,
	COMMAND_PRIORITY_LOW,
	COMMAND_PRIORITY_EDITOR,
} from '@payloadcms/richtext-lexical/lexical'
import { Icon } from '@iconify/react'
import { generateAIContent } from '../actions'
import './AIGenerationToolbarButton.scss'
import { $createAIHighlightNode, $isAIHighlightNode } from '../nodes/AIHighlightNode'
import { $createOriginalContentNode, $isOriginalContentNode } from '../nodes/OriginalContentNode'
import AIReviewControls from './AIReviewControls'
import {
	AI_GENERATION_COMMAND,
	AI_SHOW_REVIEW_CONTROLS,
	AI_HIDE_REVIEW_CONTROLS,
} from '../commands'
import AIStatusMessage from './AIStatusMessage'
import ReactDOM from 'react-dom/client'
import { Tooltip } from '@heroui/react'

interface MLResponse {
	content: string
	originalContent: string
}

const AIGenerationToolbarButton: React.FC = () => {
	const [editor] = useLexicalComposerContext()
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedText, setSelectedText] = useState<string | null>(null)
	const [currentAction, setCurrentAction] = useState<'proofread' | 'enhance' | 'generate' | null>(
		null,
	)
	const [statusMessage, setStatusMessage] = useState<{
		message: string
		type: 'loading' | 'success' | 'error'
	} | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [showReviewControls, setShowReviewControls] = useState(false)
	const [lastAINodeKey, setLastAINodeKey] = useState<string | null>(null)
	const mutationObserverRef = useRef<MutationObserver | null>(null)
	const buttonRef = useRef<HTMLDivElement>(null)
	const [isRightAligned, setIsRightAligned] = useState(false)
	const [isMobileView, setIsMobileView] = useState(false)

	// Check for mobile view
	useEffect(() => {
		const checkMobileView = () => {
			setIsMobileView(window.innerWidth < 768)
		}

		checkMobileView()
		window.addEventListener('resize', checkMobileView)

		return () => {
			window.removeEventListener('resize', checkMobileView)
		}
	}, [])

	// Register command listener for showing review controls
	useEffect(() => {
		return editor.registerCommand(
			AI_SHOW_REVIEW_CONTROLS,
			(nodeKey: string) => {
				console.log('AI_SHOW_REVIEW_CONTROLS command received with nodeKey:', nodeKey)
				setLastAINodeKey(nodeKey)
				setShowReviewControls(true)

				// Add the ai-review-mode class to the body
				document.body.classList.add('ai-review-mode')

				return false
			},
			COMMAND_PRIORITY_LOW,
		)
	}, [editor])

	// Register command listener for hiding review controls
	useEffect(() => {
		return editor.registerCommand(
			AI_HIDE_REVIEW_CONTROLS,
			() => {
				console.log('AI_HIDE_REVIEW_CONTROLS command received')
				setLastAINodeKey(null)
				setShowReviewControls(false)

				// Remove the ai-review-mode class from the body
				document.body.classList.remove('ai-review-mode')

				return false
			},
			COMMAND_PRIORITY_LOW,
		)
	}, [editor])

	// Force a re-render after the AI content is inserted to ensure the review controls are displayed
	useEffect(() => {
		if (lastAINodeKey) {
			// Small delay to ensure DOM is updated
			const timeoutId = setTimeout(() => {
				// Force a re-render by updating a state
				setShowReviewControls(false)
				setTimeout(() => {
					setShowReviewControls(true)
				}, 50)
			}, 100)

			return () => clearTimeout(timeoutId)
		}
	}, [lastAINodeKey])

	// Set up mutation observer to detect AI highlight nodes after undo operations
	useEffect(() => {
		const editorRoot = editor.getRootElement()
		if (!editorRoot) return

		// Function to find AI highlight nodes and show review controls
		const findAIHighlightNodes = () => {
			const aiHighlightNodes = editorRoot.querySelectorAll('.ai-highlight-node')

			if (aiHighlightNodes.length > 0) {
				// Find the node key from the data-lexical-node-key attribute
				editor.getEditorState().read(() => {
					// Find all nodes in the editor
					const root = $getRoot()
					let foundAINode = false

					// Helper function to recursively search for AI highlight nodes
					const findAINodes = (node: any) => {
						if ($isAIHighlightNode(node) && !foundAINode) {
							// Found an AI highlight node, show review controls for it
							const nodeKey = node.getKey()
							console.log('Found AI highlight node after undo with key:', nodeKey)
							setLastAINodeKey(nodeKey)
							setShowReviewControls(true)
							foundAINode = true

							// Add the ai-review-mode class to the body
							document.body.classList.add('ai-review-mode')

							// Add the "undone" class to the DOM element
							setTimeout(() => {
								const element = editor.getElementByKey(nodeKey)
								if (element && !element.classList.contains('undone')) {
									element.classList.add('undone')
								}
							}, 0)

							return true
						}

						// Check children if they exist
						if (node.getChildren && typeof node.getChildren === 'function') {
							const children = node.getChildren()
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

					// If no AI nodes were found, make sure the review mode is off
					if (!foundAINode) {
						document.body.classList.remove('ai-review-mode')
					}
				})
			} else {
				// No AI highlight nodes found, remove the review mode class
				document.body.classList.remove('ai-review-mode')
			}
		}

		// Create a mutation observer to watch for changes to the editor
		const observer = new MutationObserver((mutations) => {
			// Check if any of the mutations added AI highlight nodes
			const hasAIHighlightNodeAddition = mutations.some((mutation) => {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					// Check if any of the added nodes or their children have the ai-highlight-node class
					for (const node of Array.from(mutation.addedNodes)) {
						if (node instanceof HTMLElement) {
							if (
								node.classList.contains('ai-highlight-node') ||
								node.querySelector('.ai-highlight-node')
							) {
								return true
							}
						}
					}
				}
				return false
			})

			// If AI highlight nodes were added, find them and show review controls
			if (hasAIHighlightNodeAddition) {
				findAIHighlightNodes()
			}
		})

		// Start observing the editor for changes
		observer.observe(editorRoot, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false,
		})

		// Store the observer in the ref
		mutationObserverRef.current = observer

		// Initial check for AI highlight nodes (in case they're already there)
		findAIHighlightNodes()

		// Add keyboard event listener for Ctrl+Z (undo)
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check for Ctrl+Z or Command+Z (Mac)
			if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
				// Check multiple times with increasing delays to ensure we catch the undo
				// This is necessary because the undo operation may take some time to complete
				const checkTimes = [50, 150, 300, 500]

				checkTimes.forEach((delay) => {
					setTimeout(() => {
						findAIHighlightNodes()
					}, delay)
				})

				// Also mark all existing AI highlight nodes as undone
				setTimeout(() => {
					const aiNodes = editorRoot.querySelectorAll('.ai-highlight-node')
					aiNodes.forEach((node) => {
						if (node instanceof HTMLElement && !node.classList.contains('undone')) {
							node.classList.add('undone')
						}
					})
				}, 50)
			}
		}

		// Add clipboard event listener to handle copy events
		const handleCopy = (e: ClipboardEvent) => {
			// Check if the selection contains any highlighted nodes
			const selection = window.getSelection()
			if (!selection || selection.rangeCount === 0) return

			const range = selection.getRangeAt(0)
			const fragment = range.cloneContents()

			// Check if the fragment contains any highlighted nodes
			const hasHighlightedNodes =
				fragment.querySelectorAll('.ai-highlight-node, .original-content-node').length > 0

			if (hasHighlightedNodes) {
				// Get the plain text content of the selection
				const plainText = selection.toString()

				// If there's a clipboard event and we have plain text, override the clipboard data
				if (e.clipboardData) {
					e.preventDefault()
					e.clipboardData.setData('text/plain', plainText)

					// Also set HTML data but without the highlight classes
					const tempDiv = document.createElement('div')
					tempDiv.appendChild(fragment.cloneNode(true))

					// Remove highlight classes from the HTML
					tempDiv.querySelectorAll('.ai-highlight-node, .original-content-node').forEach((node) => {
						if (node instanceof HTMLElement) {
							// Create a new span without the highlight class
							const newSpan = document.createElement('span')
							newSpan.textContent = node.textContent
							node.parentNode?.replaceChild(newSpan, node)
						}
					})

					// Set the cleaned HTML to the clipboard
					e.clipboardData.setData('text/html', tempDiv.innerHTML)
				}
			}
		}

		// Add a direct paste event listener to the editor element
		const handlePaste = (e: ClipboardEvent) => {
			// Only process if we have clipboard data
			if (!e.clipboardData) return

			// Check if the clipboard data contains HTML
			const html = e.clipboardData.getData('text/html')
			if (!html) return

			// Check if the HTML contains any highlighted nodes
			if (
				html.includes('ai-highlight-node') ||
				html.includes('original-content-node') ||
				html.includes('data-ai-highlight') ||
				html.includes('data-original-content')
			) {
				// Prevent the default paste behavior
				e.preventDefault()

				// Create a temporary div to clean the HTML
				const tempDiv = document.createElement('div')
				tempDiv.innerHTML = html

				// Remove all highlight classes and data attributes
				const highlightNodes = tempDiv.querySelectorAll(
					'.ai-highlight-node, .original-content-node',
				)
				highlightNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						// Create a new text node with the same content
						const textNode = document.createTextNode(node.textContent || '')
						// Replace the highlighted node with the text node
						node.parentNode?.replaceChild(textNode, node)
					}
				})

				// Also find any spans with data attributes and clean them
				const dataNodes = tempDiv.querySelectorAll('[data-ai-highlight], [data-original-content]')
				dataNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						// Create a new text node with the same content
						const textNode = document.createTextNode(node.textContent || '')
						// Replace the node with the text node
						node.parentNode?.replaceChild(textNode, node)
					}
				})

				// Get the cleaned HTML and plain text
				const cleanedHtml = tempDiv.innerHTML
				const plainText = tempDiv.textContent || ''

				// Insert the cleaned content at the current selection
				editor.update(() => {
					// Get the current selection
					const selection = $getSelection()

					// If we have a valid selection, insert the text
					if (selection && $isRangeSelection(selection)) {
						// Delete any selected content first
						selection.insertText(plainText)
					}
				})
			}
		}

		// Add the paste event listener directly to the editor element
		editorRoot.addEventListener('paste', handlePaste)

		// Add the copy event listener to the document
		document.addEventListener('copy', handleCopy)
		document.addEventListener('keydown', handleKeyDown)

		// Clean up the observer and event listeners when the component unmounts
		return () => {
			if (mutationObserverRef.current) {
				mutationObserverRef.current.disconnect()
			}
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('copy', handleCopy)
			editorRoot.removeEventListener('paste', handlePaste)

			// Remove the ai-review-mode class from the body
			document.body.classList.remove('ai-review-mode')
		}
	}, [editor])

	// Check for text selection when the popup opens
	useEffect(() => {
		if (isPopupOpen) {
			checkForSelection()
		}
	}, [isPopupOpen])

	// Function to check if there's a text selection
	const checkForSelection = () => {
		editor.getEditorState().read(() => {
			const selection = $getSelection()
			if ($isRangeSelection(selection) && !selection.isCollapsed()) {
				const selectedText = selection.getTextContent()
				if (selectedText.trim()) {
					setSelectedText(selectedText)
				} else {
					setSelectedText(null)
				}
			} else {
				setSelectedText(null)
			}
		})
	}

	// Function to get content from the Lexical editor
	const getEditorContent = (): string => {
		let content = ''

		editor.getEditorState().read(() => {
			// If there's selected text, use that instead of the whole document
			if (selectedText) {
				content = selectedText
			} else {
				const root = $getRoot()
				content = root.getTextContent()
			}
		})

		return content
	}

	// Function to update the Lexical editor with inline comparison
	const updateEditorWithInlineComparison = (originalContent: string, aiContent: string) => {
		let lastNode

		editor.update(() => {
			// If we're working with a selection, we need to handle it specially
			const selection = $getSelection()

			if (selectedText && $isRangeSelection(selection) && !selection.isCollapsed()) {
				// Create nodes for original and AI content
				const originalNode = $createOriginalContentNode(originalContent)
				const aiNode = $createAIHighlightNode(aiContent)

				// Insert a separator between original and AI content
				const separatorNode = $createTextNode(' ⟶ ')

				// Delete the selected content
				selection.removeText()

				// Insert the original content, separator, and AI content
				selection.insertNodes([originalNode, separatorNode, aiNode])

				// Store the key of the last AI node for positioning the review controls
				lastNode = aiNode.getKey()

				// Add class to separator node via DOM after render
				setTimeout(() => {
					const separatorElement = editor.getElementByKey(separatorNode.getKey())
					if (separatorElement) {
						separatorElement.classList.add('ai-separator-text')
					}

					// Show review controls after a short delay to ensure DOM is updated
					setTimeout(() => {
						console.log('Dispatching AI_SHOW_REVIEW_CONTROLS with node key:', lastNode)
						editor.dispatchCommand(AI_SHOW_REVIEW_CONTROLS, lastNode)
					}, 50)
				}, 0)
			} else {
				// If no selection, replace the entire content
				const root = $getRoot()
				root.clear()

				// Split the content by newlines to create multiple paragraphs
				const originalParagraphs = originalContent.split('\n\n')
				const aiParagraphs = aiContent.split('\n\n')

				// Create paragraphs for each section with original and AI content
				const maxParagraphs = Math.max(originalParagraphs.length, aiParagraphs.length)

				for (let i = 0; i < maxParagraphs; i++) {
					const newParagraph = $createParagraphNode()

					if (i < originalParagraphs.length && originalParagraphs[i].trim()) {
						newParagraph.append($createOriginalContentNode(originalParagraphs[i].trim()))

						// Add separator
						const separatorNode = $createTextNode(' ⟶ ')
						newParagraph.append(separatorNode)

						// Add class to separator node via DOM after render
						setTimeout(() => {
							const separatorElement = editor.getElementByKey(separatorNode.getKey())
							if (separatorElement) {
								separatorElement.classList.add('ai-separator-text')
							}
						}, 0)
					}

					if (i < aiParagraphs.length && aiParagraphs[i].trim()) {
						const aiNode = $createAIHighlightNode(aiParagraphs[i].trim())
						newParagraph.append(aiNode)

						// Store the key of the last AI node
						lastNode = aiNode.getKey()
					}

					root.append(newParagraph)
				}

				// If no paragraphs were created (e.g., empty content), create an empty paragraph
				if (root.getChildrenSize() === 0) {
					const emptyParagraph = $createParagraphNode()
					root.append(emptyParagraph)
				}

				// Show review controls after a short delay to ensure DOM is updated
				if (lastNode) {
					setTimeout(() => {
						console.log('Dispatching AI_SHOW_REVIEW_CONTROLS with node key:', lastNode)
						editor.dispatchCommand(AI_SHOW_REVIEW_CONTROLS, lastNode)
					}, 50)
				}
			}
		})
	}

	// Function to handle AI actions
	const handleAIAction = async (action: 'proofread' | 'enhance' | 'generate') => {
		setIsLoading(true)
		setError(null)
		setSuccessMessage(null)
		setCurrentAction(action)

		// Set appropriate status message
		switch (action) {
			case 'proofread':
				setStatusMessage({ message: 'Proofreading your text...', type: 'loading' })
				break
			case 'enhance':
				setStatusMessage({ message: 'Enhancing your content...', type: 'loading' })
				break
			case 'generate':
				setStatusMessage({ message: 'Generating content...', type: 'loading' })
				break
		}

		try {
			// Get content from the Lexical editor
			const originalContent = getEditorContent()

			// Validate content length
			if (!originalContent.trim()) {
				throw new Error('Please provide some text to work with')
			}

			// Call the server action
			const result = await generateAIContent(originalContent, action)

			if (result.error) {
				// Log the error for debugging purposes
				console.error('AI generation error from server:', result.error)

				// Check if error contains JSON parse error or validation error
				if (result.error.includes('validate_failed') || result.error.includes('JSON')) {
					throw new Error(
						'API response format issue. The content may still have been processed. Please check if valid content was generated.',
					)
				} else {
					throw new Error(result.error)
				}
			}

			if (result.content) {
				// Insert the content with inline comparison
				updateEditorWithInlineComparison(originalContent, result.content)

				// Show a toast message that content was added
				setSuccessMessage('AI content inserted. Compare and accept or reject the changes.')

				// Hide success message after 5 seconds
				setTimeout(() => {
					setSuccessMessage(null)
				}, 5000)

				// Close the popup
				setIsPopupOpen(false)

				// Reset status message
				setStatusMessage(null)
			} else {
				throw new Error('No content was generated. Please try again.')
			}
		} catch (err) {
			console.error('Error in AI generation:', err)

			// Provide more specific error messages
			if (err instanceof Error) {
				if (err.message.includes('API response format') || err.message.includes('JSON')) {
					setError(err.message)
				} else if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
					setError('Rate limit reached. Please wait a few minutes and try again.')
				} else if (err.message.includes('401') || err.message.includes('403')) {
					setError('Authentication error. Please check API credentials.')
				} else if (
					err.message.includes('500') ||
					err.message.includes('502') ||
					err.message.includes('503')
				) {
					setError('AI service is currently unavailable. Please try again later.')
				} else if (err.message.includes('timeout') || err.message.includes('timed out')) {
					setError('Request timed out. The AI service may be overloaded. Please try again.')
				} else {
					setError(err.message)
				}
			} else {
				setError('Failed to generate content')
			}

			// Reset status message
			setStatusMessage(null)
		} finally {
			setIsLoading(false)
		}
	}

	// Reset the state after an action is completed or popup is closed
	const resetState = () => {
		setIsPopupOpen(false)
		setCurrentAction(null)
		setSelectedText(null)
		setStatusMessage(null)
	}

	// Function to handle outside clicks to close the popup
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			if (isPopupOpen && e.target instanceof Node) {
				const popupElement = document.querySelector('.ai-generation-feature .popup')
				const buttonElement = document.querySelector('.ai-generation-feature .toolbar-button')

				// If clicked outside of popup and not on the button, close the popup
				if (
					popupElement &&
					buttonElement &&
					!popupElement.contains(e.target) &&
					!buttonElement.contains(e.target)
				) {
					resetState()
				}
			}
		}

		document.addEventListener('mousedown', handleOutsideClick)
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [isPopupOpen])

	// Function to hide review controls
	const handleHideReviewControls = () => {
		setShowReviewControls(false)
		setLastAINodeKey(null)
	}

	// Add this effect to check popup positioning
	useEffect(() => {
		if (isPopupOpen && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const viewportWidth = window.innerWidth
			const popupWidth = 320 // Same as in CSS

			// Check if popup would overflow right edge
			if (buttonRect.left + popupWidth > viewportWidth - 20) {
				setIsRightAligned(true)
			} else {
				setIsRightAligned(false)
			}
		}
	}, [isPopupOpen])

	return (
		<>
			<div className="ai-generation-feature">
				<div
					ref={buttonRef}
					className="toolbar-button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						setIsPopupOpen(!isPopupOpen)
					}}
					title="MeerLogic"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.stopPropagation()
							e.preventDefault()
							setIsPopupOpen(!isPopupOpen)
						}
					}}
				>
					<span>AI</span>
				</div>

				{successMessage && !isPopupOpen && (
					<div className="success-toast">
						<Icon icon="heroicons:check-circle" className="success-icon" />
						<span>{successMessage}</span>
					</div>
				)}

				{isPopupOpen && (
					<div
						className={`popup ${isRightAligned ? 'right-aligned' : ''}`}
						onKeyDown={(e) => {
							// Prevent space key from closing the popup when interacting with any elements inside
							if (e.key === ' ' && e.target !== e.currentTarget) {
								e.stopPropagation()
							}
						}}
					>
						<div className="popup-header">
							<h3>{selectedText ? 'MeerLogic Actions (Selection)' : 'MeerLogic Generation'}</h3>
							<div
								className="close-button"
								onClick={() => resetState()}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										resetState()
										// Only prevent default for space to avoid scrolling
										if (e.key === ' ') {
											e.preventDefault()
										}
									}
								}}
							>
								<Icon icon="heroicons:x-mark" />
							</div>
						</div>

						<div
							className="popup-content"
							onClick={(e) => {
								// Keep the event from closing the popup
								e.stopPropagation()
							}}
						>
							{error && (
								<div className="error-message">
									<Icon icon="heroicons:exclamation-circle" className="error-icon" />
									<span>{error}</span>
								</div>
							)}

							{statusMessage && isLoading && (
								<div className="status-message">
									<div className="loading-spinner"></div>
									<span>{statusMessage.message}</span>
								</div>
							)}

							{selectedText && (
								<div className="selection-info">
									<Icon icon="heroicons:information-circle" className="info-icon" />
									<span>Actions will apply to your selected text only.</span>
								</div>
							)}

							<div className="action-buttons">
								<Tooltip
									content="Corrects grammar, spelling, and punctuation."
									placement={isMobileView ? 'bottom' : isRightAligned ? 'left' : 'right'}
									showArrow
									color="foreground"
									delay={300}
								>
									<div
										className={`action-button ${isLoading ? 'loading' : ''}`}
										onClick={() => !isLoading && handleAIAction('proofread')}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
												handleAIAction('proofread')
												// Only prevent default for space to avoid scrolling
												if (e.key === ' ') {
													e.preventDefault()
												}
											}
										}}
									>
										<Icon icon="heroicons:check-circle" className="action-icon" />
										<span className="action-text">
											{isLoading && currentAction === 'proofread' ? 'Proofreading...' : 'Proofread'}
										</span>
										{isLoading && currentAction === 'proofread' && (
											<div className="loading-spinner"></div>
										)}
									</div>
								</Tooltip>

								<Tooltip
									content="Makes your text more professional and engaging."
									placement={isMobileView ? 'bottom' : isRightAligned ? 'left' : 'right'}
									showArrow
									color="foreground"
									delay={300}
								>
									<div
										className={`action-button ${isLoading ? 'loading' : ''}`}
										onClick={() => !isLoading && handleAIAction('enhance')}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
												handleAIAction('enhance')
												// Only prevent default for space to avoid scrolling
												if (e.key === ' ') {
													e.preventDefault()
												}
											}
										}}
									>
										<Icon icon="heroicons:star" className="action-icon" />
										<span className="action-text">
											{isLoading && currentAction === 'enhance' ? 'Enhancing...' : 'Enhance'}
										</span>
										{isLoading && currentAction === 'enhance' && (
											<div className="loading-spinner"></div>
										)}
									</div>
								</Tooltip>

								<Tooltip
									content={
										selectedText
											? 'Creates new content based on your selection.'
											: 'Creates new content based on your text prompt.'
									}
									placement={isMobileView ? 'bottom' : isRightAligned ? 'left' : 'right'}
									showArrow
									color="foreground"
									delay={300}
								>
									<div
										className={`action-button ${isLoading ? 'loading' : ''}`}
										onClick={() => !isLoading && handleAIAction('generate')}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
												handleAIAction('generate')
												// Only prevent default for space to avoid scrolling
												if (e.key === ' ') {
													e.preventDefault()
												}
											}
										}}
									>
										<Icon icon="heroicons:document-plus" className="action-icon" />
										<span className="action-text">
											{isLoading && currentAction === 'generate'
												? 'Generating...'
												: selectedText
												  ? 'Generate from Selection'
												  : 'Generate Content'}
										</span>
										{isLoading && currentAction === 'generate' && (
											<div className="loading-spinner"></div>
										)}
									</div>
								</Tooltip>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Debug button to manually show review controls - remove in production 
			{process.env.NODE_ENV !== 'production' && (
				<button
					onClick={() => {
						// Find the first AI highlight node in the editor
						editor.getEditorState().read(() => {
							const root = $getRoot()
							let aiNodeKey: string | null = null

							// Function to process a node and its descendants
							const processNode = (node: any) => {
								if ($isAIHighlightNode(node)) {
									aiNodeKey = node.getKey()
									return true
								}

								// Process children
								const children = node.getChildren ? node.getChildren() : []
								for (const child of children) {
									if (processNode(child)) {
										return true
									}
								}

								return false
							}

							// Start processing from the root's children
							root.getChildren().forEach(processNode)

							if (aiNodeKey) {
								console.log('Debug: Found AI node key:', aiNodeKey)
								setLastAINodeKey(aiNodeKey)
								setShowReviewControls(true)
							} else {
								console.log('Debug: No AI nodes found in the editor')
								// Create a test AI node
								editor.update(() => {
									const selection = $getSelection()
									if ($isRangeSelection(selection)) {
										const aiNode = $createAIHighlightNode('Test AI content')
										selection.insertNodes([aiNode])
										setLastAINodeKey(aiNode.getKey())
										setShowReviewControls(true)
									}
								})
							}
						})
					}}
					style={{
						position: 'fixed',
						bottom: '20px',
						right: '20px',
						zIndex: 9999,
						padding: '8px 12px',
						backgroundColor: '#6366F1',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontWeight: 'bold',
					}}
				>
					Debug: Show Review Controls
				</button>
			)}*/}

			{/* Show review controls in the editor when AI content is added */}
			{showReviewControls && lastAINodeKey && (
				<>
					{console.log('Rendering AIReviewControls with nodeKey:', lastAINodeKey)}
					<AIReviewControls nodeKey={lastAINodeKey} />
				</>
			)}

			{statusMessage && (
				<AIStatusMessage
					message={statusMessage.message}
					type={statusMessage.type}
					onDismiss={() => setStatusMessage(null)}
				/>
			)}
		</>
	)
}

export default AIGenerationToolbarButton

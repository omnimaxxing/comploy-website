import {
	$applyNodeReplacement,
	$createTextNode,
	$isTextNode,
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	LexicalNode,
	NodeKey,
	SerializedTextNode,
	TextNode,
} from '@payloadcms/richtext-lexical/lexical'

export type SerializedAIHighlightNode = SerializedTextNode & {
	type: 'ai-highlight'
	version: 1
}

export class AIHighlightNode extends TextNode {
	static getType(): string {
		return 'ai-highlight'
	}

	static clone(node: AIHighlightNode): AIHighlightNode {
		return new AIHighlightNode(node.__text, node.__key)
	}

	constructor(text: string, key?: NodeKey) {
		super(text, key)
	}

	createDOM(): HTMLElement {
		const dom = document.createElement('span')
		dom.className = 'ai-highlight-node'
		dom.textContent = this.__text
		dom.setAttribute('data-ai-highlight', 'true')
		return dom
	}

	updateDOM(): boolean {
		// Returning false tells Lexical that this node does not need its
		// DOM element to be replaced when updating.
		return false
	}

	static importJSON(serializedNode: SerializedAIHighlightNode): AIHighlightNode {
		const node = $createAIHighlightNode(serializedNode.text)
		node.setFormat(serializedNode.format)
		node.setDetail(serializedNode.detail)
		node.setMode(serializedNode.mode)
		node.setStyle(serializedNode.style)
		return node
	}

	exportJSON(): SerializedAIHighlightNode {
		return {
			...super.exportJSON(),
			type: 'ai-highlight',
			version: 1,
		}
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: HTMLElement) => {
				if (
					domNode.classList.contains('ai-highlight-node') ||
					domNode.getAttribute('data-ai-highlight') === 'true'
				) {
					return {
						conversion: (domNode: HTMLElement) => ({
							node: $createTextNode(domNode.textContent || ''),
						}),
						priority: 1,
					}
				}
				return null
			},
		}
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement('span')
		element.classList.add('ai-highlight-node')
		element.setAttribute('data-ai-highlight', 'true')
		element.textContent = this.__text
		return { element }
	}

	isAIHighlight(): boolean {
		return true
	}

	extractWithChild(): boolean {
		return false
	}
}

function convertAIHighlightElement(domNode: HTMLElement): DOMConversionOutput {
	return {
		node: $createTextNode(domNode.textContent || ''),
	}
}

export function $createAIHighlightNode(text: string): AIHighlightNode {
	return $applyNodeReplacement(new AIHighlightNode(text))
}

export function $isAIHighlightNode(node: LexicalNode | null | undefined): node is AIHighlightNode {
	return node instanceof AIHighlightNode
}

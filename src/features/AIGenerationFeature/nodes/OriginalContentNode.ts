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

export type SerializedOriginalContentNode = SerializedTextNode & {
	type: 'original-content'
	version: 1
}

export class OriginalContentNode extends TextNode {
	static getType(): string {
		return 'original-content'
	}

	static clone(node: OriginalContentNode): OriginalContentNode {
		return new OriginalContentNode(node.__text, node.__key)
	}

	constructor(text: string, key?: NodeKey) {
		super(text, key)
	}

	createDOM(): HTMLElement {
		const dom = document.createElement('span')
		dom.className = 'original-content-node'
		dom.textContent = this.__text
		dom.setAttribute('data-original-content', 'true')
		return dom
	}

	updateDOM(): boolean {
		// Returning false tells Lexical that this node does not need its
		// DOM element to be replaced when updating.
		return false
	}

	static importJSON(serializedNode: SerializedOriginalContentNode): OriginalContentNode {
		const node = $createOriginalContentNode(serializedNode.text)
		node.setFormat(serializedNode.format)
		node.setDetail(serializedNode.detail)
		node.setMode(serializedNode.mode)
		node.setStyle(serializedNode.style)
		return node
	}

	exportJSON(): SerializedOriginalContentNode {
		return {
			...super.exportJSON(),
			type: 'original-content',
			version: 1,
		}
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: HTMLElement) => {
				if (
					domNode.classList.contains('original-content-node') ||
					domNode.getAttribute('data-original-content') === 'true'
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
		element.classList.add('original-content-node')
		element.setAttribute('data-original-content', 'true')
		element.textContent = this.__text
		return { element }
	}

	isOriginalContent(): boolean {
		return true
	}

	extractWithChild(): boolean {
		return false
	}
}

function convertOriginalContentElement(domNode: HTMLElement): DOMConversionOutput {
	return {
		node: $createTextNode(domNode.textContent || ''),
	}
}

export function $createOriginalContentNode(text: string): OriginalContentNode {
	return $applyNodeReplacement(new OriginalContentNode(text))
}

export function $isOriginalContentNode(
	node: LexicalNode | null | undefined,
): node is OriginalContentNode {
	return node instanceof OriginalContentNode
}

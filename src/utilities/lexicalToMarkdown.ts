export const lexicalToMarkdown = (content: any): string => {
	if (!content?.root?.children) return ''

	return content.root.children
		.map((node: any) => {
			if (node.type === 'paragraph') {
				return (
					node.children
						?.map((child: any) => {
							if (child.type === 'text') {
								let text = child.text
								if (child.bold) text = `**${text}**`
								if (child.italic) text = `*${text}*`
								if (child.underline) text = `_${text}_`
								if (child.strikethrough) text = `~~${text}~~`
								return text
							}
							return ''
						})
						.join('') + '\n\n'
				)
			}
			if (node.type === 'heading') {
				const hashes = '#'.repeat(node.tag.slice(1))
				return `${hashes} ${node.children?.[0]?.text || ''}\n\n`
			}
			if (node.type === 'horizontalrule') {
				return '---\n\n'
			}
			return ''
		})
		.join('')
}

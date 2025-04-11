import {
	BoldFeature,
	ItalicFeature,
	LinkFeature,
	ParagraphFeature,
	UnderlineFeature,
	HeadingFeature,
	AlignFeature,
	IndentFeature,
	UnorderedListFeature,
	OrderedListFeature,
	UploadFeature,
	BlocksFeature,
	BlockquoteFeature,
	StrikethroughFeature,
	lexicalEditor,
	HorizontalRuleFeature,
	InlineToolbarFeature,
	FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { Config } from 'payload'
// Import converters for use in components that render rich text
// import { TypographyHTMLConverters, TypographyJSXConverters } from '@/features/typography-converters'
import { AIGenerationFeature } from '@/features/AIGenerationFeature/feature.server'
// Remove the minimalLexicalEditor since we're not using it anymore
export const defaultLexical: Config['editor'] = lexicalEditor({
	features: ({ defaultFeatures, rootFeatures }) => {
		return [
			...defaultFeatures,
			ParagraphFeature(),
			HorizontalRuleFeature(),
			InlineToolbarFeature(),
			FixedToolbarFeature(),
			HeadingFeature({
				enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
			}),
			BoldFeature(),
			ItalicFeature(),
			UnderlineFeature(),
			StrikethroughFeature(),
			LinkFeature({
				fields: [
					{
						name: 'rel',
						label: 'Rel Attribute',
						type: 'select',
						hasMany: true,
						options: ['noopener', 'noreferrer', 'nofollow'],
						admin: {
							description:
								'The rel attribute defines the relationship between a linked resource and the current document.',
						},
					},
				],
			}),
			UnorderedListFeature(),
			OrderedListFeature(),
			BlockquoteFeature(),
			AlignFeature(),
			IndentFeature(),
			AIGenerationFeature() as any,
			// Remove UploadFeature and BlocksFeature
		]
	},
	admin: {
		placeholder: 'Begin typing your document content or press "/" for commands...',
	},
})

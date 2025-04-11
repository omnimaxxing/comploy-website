import { createServerFeature } from '@payloadcms/richtext-lexical'

export type AIGenerationFeatureProps = {
	// Add any props you need here
}

export const AIGenerationFeature = createServerFeature<
	AIGenerationFeatureProps,
	AIGenerationFeatureProps,
	AIGenerationFeatureProps
>({
	feature({ props }) {
		return {
			ClientFeature: '@/features/AIGenerationFeature/feature.client#AIGenerationClientFeature',
			clientFeatureProps: props || {},
		}
	},
	key: 'aiGeneration',
})

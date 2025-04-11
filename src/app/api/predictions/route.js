import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
})

const WEBHOOK_HOST = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: process.env.NGROK_HOST

export async function POST(request) {
	if (!process.env.REPLICATE_API_TOKEN) {
		throw new Error(
			'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.',
		)
	}

	const {
		prompt,
		go_fast = true,
		megapixels = '1',
		num_outputs = 1,
		aspect_ratio = '1:1',
		output_format = 'webp',
		output_quality = 100,
		disable_safety_checker = true,
		num_inference_steps = 4,
	} = await request.json()

	const input = {
		prompt,
		go_fast,
		megapixels,
		num_outputs,
		aspect_ratio,
		output_format,
		output_quality,
		//disable_safety_checker,
		num_inference_steps,
	}

	const options = {
		model: 'black-forest-labs/flux-schnell',
		input,
	}

	if (WEBHOOK_HOST) {
		options.webhook = `${WEBHOOK_HOST}/api/webhooks`
		options.webhook_events_filter = ['start', 'completed']
	}

	const prediction = await replicate.predictions.create(options)

	if (prediction?.error) {
		return NextResponse.json({ detail: prediction.error }, { status: 500 })
	}

	return NextResponse.json(prediction, { status: 201 })
}

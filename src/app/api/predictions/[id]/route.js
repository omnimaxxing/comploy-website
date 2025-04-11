import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
})

export async function GET(request, context) {
	const { id } = await context.params

	if (!id) {
		return NextResponse.json({ detail: 'Prediction ID is required.' }, { status: 400 })
	}

	// Check if client accepts server-sent events
	const headers = request.headers
	const acceptsSSE = headers.get('accept')?.includes('text/event-stream')

	if (!acceptsSSE) {
		// Fall back to regular JSON response for non-SSE requests
		try {
			const prediction = await replicate.predictions.get(id)
			if (prediction?.error) {
				return NextResponse.json({ detail: prediction.error }, { status: 500 })
			}
			return NextResponse.json(prediction)
		} catch (error) {
			return NextResponse.json({ detail: error.message }, { status: 500 })
		}
	}

	// Stream updates for SSE clients
	const encoder = new TextEncoder()
	const stream = new ReadableStream({
		async start(controller) {
			try {
				let prediction = await replicate.predictions.get(id)
				let attempts = 0
				const maxAttempts = 60 // 30 seconds max with 500ms intervals

				while (
					prediction.status !== 'succeeded' &&
					prediction.status !== 'failed' &&
					attempts < maxAttempts
				) {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(prediction)}\n\n`))
					await new Promise((resolve) => setTimeout(resolve, 500))
					prediction = await replicate.predictions.get(id)
					attempts++
				}

				// Send final state
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(prediction)}\n\n`))
			} catch (error) {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
			} finally {
				controller.close()
			}
		},
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	})
}

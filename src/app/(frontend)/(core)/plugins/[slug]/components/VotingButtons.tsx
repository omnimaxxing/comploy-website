'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { upvotePlugin, downvotePlugin } from '../actions'
import { toast } from 'sonner'
import { cn } from '@heroui/react'

interface VotingButtonsProps {
	slug: string
	initialVote: 'up' | 'down' | null
	initialUpvotes: number
	initialDownvotes: number
	initialScore: number
	minimal?: boolean
}

export function VotingButtons({
	slug,
	initialVote,
	initialUpvotes,
	initialDownvotes,
	initialScore,
	minimal = false,
}: VotingButtonsProps) {
	// Log the initial vote value for debugging
	console.log('Initial vote in VotingButtons:', initialVote)

	const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialVote)
	const [upvotes, setUpvotes] = useState<number>(initialUpvotes)
	const [downvotes, setDownvotes] = useState<number>(initialDownvotes)
	const [score, setScore] = useState<number>(initialScore)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	// Function to handle upvote
	const handleUpvote = async () => {
		if (isLoading) return
		setIsLoading(true)
		setError(null) // Clear any previous errors

		// Optimistic update
		const previousVote = userVote
		const previousUpvotes = upvotes
		const previousDownvotes = downvotes

		// Apply optimistic update
		if (userVote === 'up') {
			// Cancel upvote
			setUserVote(null)
			setUpvotes(upvotes - 1)
		} else {
			// Add upvote
			setUserVote('up')
			setUpvotes(upvotes + 1)

			// If previously downvoted, remove downvote
			if (userVote === 'down') {
				setDownvotes(downvotes - 1)
			}
		}

		// Recalculate score
		const newScore = userVote === 'up' ? score - 1 : userVote === 'down' ? score + 2 : score + 1

		setScore(newScore)

		try {
			const result = await upvotePlugin(slug)

			if (!result.success) {
				// Revert changes if the server request fails
				setUserVote(previousVote)
				setUpvotes(previousUpvotes)
				setDownvotes(previousDownvotes)
				setScore(initialScore)

				// Check if the error is a rate limit error
				if (result.message && result.message.includes('voting too frequently')) {
					setError(result.message)
					toast.error(result.message)
				} else {
					toast.error(result.message || 'Failed to vote')
				}
			}
		} catch (error) {
			// Revert changes on error
			setUserVote(previousVote)
			setUpvotes(previousUpvotes)
			setDownvotes(previousDownvotes)
			setScore(initialScore)
			toast.error('An error occurred while voting')
			console.error('Vote error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// Function to handle downvote
	const handleDownvote = async () => {
		if (isLoading) return
		setIsLoading(true)
		setError(null) // Clear any previous errors

		// Optimistic update
		const previousVote = userVote
		const previousUpvotes = upvotes
		const previousDownvotes = downvotes

		// Apply optimistic update
		if (userVote === 'down') {
			// Cancel downvote
			setUserVote(null)
			setDownvotes(downvotes - 1)
		} else {
			// Add downvote
			setUserVote('down')
			setDownvotes(downvotes + 1)

			// If previously upvoted, remove upvote
			if (userVote === 'up') {
				setUpvotes(upvotes - 1)
			}
		}

		// Recalculate score
		const newScore = userVote === 'down' ? score + 1 : userVote === 'up' ? score - 2 : score - 1

		setScore(newScore)

		try {
			const result = await downvotePlugin(slug)

			if (!result.success) {
				// Revert changes if the server request fails
				setUserVote(previousVote)
				setUpvotes(previousUpvotes)
				setDownvotes(previousDownvotes)
				setScore(initialScore)

				// Check if the error is a rate limit error
				if (result.message && result.message.includes('voting too frequently')) {
					setError(result.message)
					toast.error(result.message)
				} else {
					toast.error(result.message || 'Failed to vote')
				}
			}
		} catch (error) {
			// Revert changes on error
			setUserVote(previousVote)
			setUpvotes(previousUpvotes)
			setDownvotes(previousDownvotes)
			setScore(initialScore)
			toast.error('An error occurred while voting')
			console.error('Vote error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (minimal) {
		return (
			<div className="flex items-center space-x-1">
				<button
					onClick={handleUpvote}
					disabled={isLoading}
					className={cn(
						'inline-flex items-center p-1 rounded-none border border-transparent transition-colors',
						userVote === 'up'
							? 'bg-green-500/10 border-green-500/30 text-green-400'
							: 'hover:bg-white/10 text-white/70 hover:text-white',
					)}
					aria-label="Upvote"
				>
					<Icon icon="heroicons:arrow-up" className="w-4 h-4" />
				</button>

				<span
					className={cn(
						'font-medium text-sm',
						score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-white/70',
					)}
				>
					{score}
				</span>

				<button
					onClick={handleDownvote}
					disabled={isLoading}
					className={cn(
						'inline-flex items-center p-1 rounded-none border border-transparent transition-colors',
						userVote === 'down'
							? 'bg-red-500/10 border-red-500/30 text-red-400'
							: 'hover:bg-white/10 text-white/70 hover:text-white',
					)}
					aria-label="Downvote"
				>
					<Icon icon="heroicons:arrow-down" className="w-4 h-4" />
				</button>
			</div>
		)
	}

	return (
		<div className="inline-flex rounded-none border border-white/10 overflow-hidden">
			<button
				onClick={handleUpvote}
				disabled={isLoading}
				className={cn(
					'flex items-center gap-1 px-3 py-2 transition-colors',
					userVote === 'up'
						? 'bg-green-500/10 text-green-400 border-r border-green-500/30'
						: 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-r border-white/10',
				)}
				aria-label="Upvote"
			>
				<Icon icon="heroicons:arrow-up" className="w-4 h-4" />
				<span>{upvotes}</span>
			</button>

			<button
				onClick={handleDownvote}
				disabled={isLoading}
				className={cn(
					'flex items-center gap-1 px-3 py-2 transition-colors',
					userVote === 'down'
						? 'bg-red-500/10 text-red-400 border-r border-red-500/30'
						: 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-r border-white/10',
				)}
				aria-label="Downvote"
			>
				<Icon icon="heroicons:arrow-down" className="w-4 h-4" />
				<span>{downvotes}</span>
			</button>

			<div
				className={cn(
					'flex items-center justify-center px-3 py-2',
					score > 0
						? 'bg-green-500/5 text-green-400'
						: score < 0
						  ? 'bg-red-500/5 text-red-400'
						  : 'bg-white/5 text-white/80',
				)}
			>
				<span className="font-medium">{score}</span>
				<span className="text-xs ml-1 opacity-60">net</span>
			</div>

			{/* Display error message if rate limited */}
			{error && !minimal && (
				<div className="mt-1 text-xs text-red-400">
					<Icon icon="heroicons:exclamation-circle" className="inline-block w-3 h-3 mr-1" />
					{error}
				</div>
			)}
		</div>
	)
}

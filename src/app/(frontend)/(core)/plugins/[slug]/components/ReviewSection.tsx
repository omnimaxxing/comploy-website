'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { addReview } from '../actions';
import { Icon } from '@iconify/react';
import { cn, Spinner } from '@heroui/react';

interface ReviewProps {
  author: string;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  slug: string;
  initialReviews: ReviewProps[];
}

export function ReviewSection({ slug, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewProps[]>(initialReviews);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);

  // Clear success message after a delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const result = await addReview(slug, { author, comment, honeypot });

      if (result.success && result.review) {
        // Add the new review
        setReviews([...reviews, result.review as ReviewProps]);
        // Clear form
        setAuthor('');
        setComment('');
        setHoneypot('');
        setSuccess(true);
        // Hide form after successful submission
        setShowForm(false);
      } else {
        setError(result.message || 'Error adding comment');
      }
    } catch (error) {
      setError('Error adding comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    // If less than an hour ago, show minutes
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    // If less than a day ago, show hours
    else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    // If less than 7 days ago, show days
    else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    // Otherwise show a readable date
    else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Generate avatar for a user based on their name
  const getAvatarInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get a deterministic color based on the user's name
  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-white/10';
    const colors = [
      'bg-indigo-900/30',
      'bg-violet-900/30',
      'bg-purple-900/30',
      'bg-rose-900/30',
      'bg-pink-900/30',
      'bg-blue-900/30',
      'bg-cyan-900/30',
      'bg-teal-900/30',
      'bg-green-900/30',
    ];
    // Simple hash function to get a consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div>
      {/* Discussion header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Community Discussion</h3>
          <p className="text-sm text-white/60">
            {reviews.length} {reviews.length === 1 ? 'comment' : 'comments'}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'inline-flex items-center gap-2 rounded-none border px-4 py-2 text-sm',
            showForm
              ? 'border-white/30 bg-white/10 text-white'
              : 'border-transparent bg-white text-black hover:bg-white/90'
          )}
        >
          <Icon
            icon={showForm ? 'heroicons:x-mark' : 'heroicons:chat-bubble-left-ellipsis'}
            className="h-4 w-4"
          />
          {showForm ? 'Cancel' : 'Add Comment'}
        </button>
      </div>

      {/* Comments form */}
      {showForm && (
        <div className="relative mb-8 rounded-none border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 backdrop-blur-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-transparent"></div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from regular users but visible to bots */}
            <div style={{ display: 'none' }}>
              <input
                type="text"
                name="website"
                aria-hidden="true"
                tabIndex={-1}
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar placeholder - would be replaced with actual user avatar in a real auth system */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-white/20 bg-white/10 text-sm font-medium">
                {author ? getAvatarInitials(author) : '?'}
              </div>

              <div className="flex-1 space-y-4">
                {/* Author name */}
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                  className="w-full rounded-none border border-white/20 bg-black/30 p-3 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                  placeholder="Your name"
                  minLength={2}
                />

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                  className="w-full rounded-none border border-white/20 bg-black/30 p-3 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                  placeholder="Share your thoughts or questions about this plugin..."
                  rows={4}
                  minLength={10}
                  maxLength={1000}
                />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">
                    {1000 - comment.length} characters remaining
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-10 items-center rounded-none bg-white px-4 py-2 text-black transition-colors hover:bg-white/90 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner aria-label="Loading Auth State" color="white" variant="gradient" />
                        Posting...
                      </>
                    ) : (
                      'Post Comment'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-none border border-red-500/20 bg-red-900/30 p-3 text-red-400">
                <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-none border border-green-500/20 bg-green-900/30 p-3 text-green-400">
          <Icon icon="heroicons:check-circle" className="h-5 w-5 flex-shrink-0" />
          <span>Comment posted successfully!</span>
        </div>
      )}

      {/* Existing comments */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={cn(
                'rounded-none border p-6 backdrop-blur-sm',
                index % 2 === 0 ? 'border-white/10 bg-white/5' : 'border-white/5 bg-black/40'
              )}
            >
              <div className="flex gap-4">
                {/* User avatar */}
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-white/10 text-sm font-medium',
                    getAvatarColor(review.author)
                  )}
                >
                  {getAvatarInitials(review.author)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h4 className="text-sm font-medium">{review.author}</h4>
                    {review.createdAt && (
                      <span className="text-xs text-white/60">{formatDate(review.createdAt)}</span>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-white/80">{review.comment}</p>

                  {/* Comment actions */}
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
                      onClick={() => {
                        setShowForm(true);
                        // Scroll to form
                        setTimeout(() => {
                          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Icon icon="heroicons:chat-bubble-left" className="h-4 w-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-none border border-white/10 bg-black/30 p-10 text-center">
          <Icon
            icon="heroicons:chat-bubble-left-right"
            className="mx-auto mb-4 h-12 w-12 text-white/20"
          />
          <h3 className="mb-2 text-lg font-medium">No comments yet</h3>
          <p className="mb-6 text-white/60">
            Be the first to start the discussion about this plugin!
          </p>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-none bg-white px-4 py-2 text-black hover:bg-white/90"
            >
              <Icon icon="heroicons:chat-bubble-left-ellipsis" className="h-4 w-4" />
              Start the conversation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

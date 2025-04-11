'use client';

import { useEffect, useState } from 'react';
import { checkUserVote } from '../actions';
import { VotingButtons } from './VotingButtons';
import { PluginActionsMenu } from './PluginActionsMenu';
import { Button, Link } from '@heroui/react';
import { Icon } from '@iconify/react';

interface PluginActionsProps {
  slug: string;
  isVerified: boolean;
  isOfficial?: boolean;
  githubUrl: string;
  pluginName: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialScore: number;
  isAuthenticated?: boolean;
  isOwner?: boolean;
  currentUsername?: string | null;
}

export function PluginActions({
  slug,
  isVerified,
  isOfficial = false,
  githubUrl,
  pluginName,
  initialUpvotes,
  initialDownvotes,
  initialScore,
  isAuthenticated = false,
  isOwner = false,
  currentUsername = null,
}: PluginActionsProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [clientIsOwner, setClientIsOwner] = useState(isOwner);
  const [clientIsVerified, setClientIsVerified] = useState(isVerified);

  // Update local state when props change
  useEffect(() => {
    setClientIsOwner(isOwner);
    setClientIsVerified(isVerified);
  }, [isOwner, isVerified]);

  useEffect(() => {
    // Check user vote on client side
    const checkUserData = async () => {
      try {
        const vote = await checkUserVote(slug);
        setUserVote(vote);
      } catch (error) {
        console.error('Error checking user vote:', error);
      }
    };

    checkUserData();
  }, [slug]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <Button
        href={githubUrl}
        as={Link}
        isIconOnly
        aria-label="View on GitHub"
        target="_blank"
        rel="noopener noreferrer"
        variant="solid"
        className="border-none bg-white"
      >
        <Icon icon="logos:github-icon" className="h-5 w-5" />
      </Button>

      <PluginActionsMenu
        slug={slug}
        isOwner={clientIsOwner}
        isVerified={clientIsVerified}
        isOfficial={isOfficial}
        githubUrl={githubUrl}
        pluginName={pluginName}
      />

      <div className="ml-auto">
        <VotingButtons
          slug={slug}
          initialVote={userVote}
          initialUpvotes={initialUpvotes}
          initialDownvotes={initialDownvotes}
          initialScore={initialScore}
          minimal={false}
        />
      </div>
    </div>
  );
}

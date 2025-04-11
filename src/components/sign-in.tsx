'use client';

import {
  Button,
  Avatar,
  User,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
  Spinner,
  Tooltip,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithGitHub, signOutFromGitHub } from './github-actions';

export default function SignInGitHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Fetch the session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoadingSession(true);
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setSession(data);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      // The actual sign-in happens in the form action
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // The actual sign-out happens in the form action
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  // Show loading state
  if (isLoadingSession) {
    return (
      <Spinner aria-label="Loading Auth State" color="white" className="ml-4" variant="gradient" />
    );
  }

  // If logged in, show user button that opens a modal
  if (session && session.user) {
    const username =
      session.user.username ||
      (session.user.name && session.user.name.includes('@')
        ? session.user.name
        : session.user.name);

    return (
      <>
        <Button className="relative min-w-0 bg-transparent px-0" variant="light" onPress={onOpen}>
          <User
            name={`@${username}`}
            avatarProps={{
              src: session.user.image || '',
              size: 'sm',
              showFallback: true,
              fallback: <Icon icon="mdi:github" className="text-foreground" />,
            }}
            className="transition-transform"
            classNames={{
              name: 'text-foreground/90 text-sm',
              description: 'text-foreground/60',
            }}
          />
        </Button>

        {/* User Profile Modal */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          classNames={{
            base: 'bg-background border border-foreground/10',
            header: 'border-b border-foreground/10',
            footer: 'border-t border-foreground/10',
            closeButton: 'hover:bg-foreground/10',
          }}
          radius="none"
          backdrop="blur"
        >
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className="flex items-center gap-2">
                  <Avatar
                    src={session.user.image || ''}
                    showFallback
                    size="md"
                    fallback={<Icon icon="mdi:github" className="text-foreground" />}
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">{`@${username}`}</h3>
                    <p className="text-sm text-foreground/70">GitHub User</p>
                  </div>
                </ModalHeader>

                <Divider className="opacity-20" />

                <ModalBody className="py-6">
                  <div className="flex flex-col gap-4">
                    <Button
                      as={Link}
                      href="/my-plugins"
                      className="justify-start rounded-none border border-foreground/10 bg-transparent px-4 py-3 text-left hover:bg-foreground/5"
                      variant="bordered"
                      startContent={<Icon icon="heroicons:rectangle-stack" className="h-5 w-5" />}
                      onPress={onClose}
                    >
                      My Plugins
                    </Button>

                    <form id="signout-form" action={signOutFromGitHub}>
                      <input type="hidden" name="redirectUrl" value={window.location.pathname} />
                      <Button
                        type="submit"
                        className="w-full justify-start rounded-none border border-foreground/10 bg-transparent px-4 py-3 text-left text-danger hover:bg-foreground/5"
                        variant="bordered"
                        startContent={
                          <Icon icon="heroicons:arrow-right-on-rectangle" className="h-5 w-5" />
                        }
                        isLoading={isLoading}
                      >
                        Sign Out
                      </Button>
                    </form>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button variant="light" onPress={onClose} radius="none">
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }

  // If not logged in, show the direct sign-in button with tooltip
  return (
    <Tooltip
      content="Manage your contributions, verify plugins, and leave comments"
      color="primary"
      radius="sm"
    >
      <form action={signInWithGitHub} onSubmit={handleSignIn}>
        <input type="hidden" name="redirectUrl" value={window.location.pathname} />
        <Button
          type="submit"
          variant="bordered"
          className="relative z-50 rounded-none border-none bg-transparent hover:bg-foreground/10"
          startContent={<Icon className="h-5 w-5" icon="mdi:github" />}
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>
    </Tooltip>
  );
}

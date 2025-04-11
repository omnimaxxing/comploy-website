'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@heroui/react';
import { toast } from 'sonner';
import { submitPluginReport, checkGitHubOwnership } from '../actions';
import { getAuthSession } from '../../../submit/actions';
import { signInWithGitHub } from '@/components/github-actions';

interface PluginActionsMenuProps {
  slug: string;
  isOwner: boolean;
  isVerified: boolean;
  isOfficial?: boolean;
  githubUrl: string;
  pluginName?: string;
}

export function PluginActionsMenu({
  slug,
  isOwner: initialIsOwner,
  isVerified: initialIsVerified,
  isOfficial = false,
  githubUrl,
  pluginName = '',
}: PluginActionsMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGitHubAuthenticated, setIsGitHubAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Local state to track ownership and verification status
  const [isOwner, setIsOwner] = useState(initialIsOwner);
  const [isVerified, setIsVerified] = useState(initialIsVerified);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportType, setReportType] = useState<
    'deletion' | 'content-violation' | 'security' | 'copyright' | 'other'
  >(isOwner ? 'deletion' : 'content-violation');

  // Update local state when props change
  useEffect(() => {
    setIsOwner(initialIsOwner);
    setIsVerified(initialIsVerified);
  }, [initialIsOwner, initialIsVerified]);

  // Check if the user is authenticated with GitHub
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authResult = await getAuthSession();
        if (authResult.success && authResult.session?.accessToken) {
          setIsGitHubAuthenticated(true);
        } else {
          setIsGitHubAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsGitHubAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle delete request submission
  const handleDeleteSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await submitPluginReport(slug, {
        reportType: 'deletion',
        reporterName,
        reporterEmail,
        message:
          reportMessage ||
          `I am the owner of this plugin and I would like to request its deletion from the Payload Plugins directory.`,
      });

      if (result.success) {
        toast.success(result.message);
        setShowDeleteModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!reporterName || !reporterEmail || !reportMessage) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitPluginReport(slug, {
        reportType,
        reporterName,
        reporterEmail,
        message: reportMessage,
      });

      if (result.success) {
        toast.success(result.message);
        setShowReportModal(false);
        // Reset form
        setReportMessage('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle claim ownership
  const handleClaimOwnership = async () => {
    setIsOpen(false);

    if (isGitHubAuthenticated) {
      // Show verification modal
      setShowVerificationModal(true);
    } else {
      // User needs to authenticate first - use the direct GitHub sign-in instead of the intermediary page
      setIsAuthenticating(true);
      try {
        // Create FormData with the current URL as redirect target
        const formData = new FormData();
        formData.append('redirectUrl', window.location.pathname);
        
        // Call the server action directly
        await signInWithGitHub(formData);
      } catch (error) {
        console.error('Error signing in with GitHub:', error);
        toast.error('Failed to authenticate with GitHub. Please try again.');
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  // Handle verification after authentication
  const verifyOwnership = async () => {
    console.log(`[verifyOwnership] Starting ownership verification process for plugin: ${slug}`);
    setIsVerifying(true);

    try {
      console.log(`[verifyOwnership] Calling checkGitHubOwnership server action`);
      const result = await checkGitHubOwnership(slug);
      console.log(`[verifyOwnership] checkGitHubOwnership result:`, result);

      if (result.success) {
        if (result.isOwner) {
          console.log(`[verifyOwnership] Verification successful, user is owner`);
          toast.success('Verification successful! You are now the verified owner of this plugin.');
          setIsOwner(true);
          setIsVerified(true);
          setShowVerificationModal(false);

          // Use hard navigation to reload the page with updated ownership data
          console.log(`[verifyOwnership] Reloading page to update ownership status`);
          window.location.href = `/plugins/${slug}`;
        } else {
          console.log(`[verifyOwnership] Verification failed, user is not owner:`, result.message);
          toast.error(
            result.message ||
              'Verification failed. You do not have write access to this repository.'
          );
        }
      } else {
        console.error(`[verifyOwnership] Verification error:`, result.message);
        toast.error(result.message || 'An error occurred during verification.');
      }
    } catch (error) {
      console.error(`[verifyOwnership] Unexpected error during verification:`, error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            variant="bordered"
            radius="none"
            className="h-10 w-10 border border-white/10 bg-white/5 p-0 hover:bg-white/10"
            aria-label="Plugin actions"
          >
            <Icon icon="heroicons:ellipsis-vertical" className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 border border-white/10 bg-black/80 p-0 shadow-xl backdrop-blur-md">
          <div className="py-1">
            {/* Edit option - only for owners */}
            {isOwner && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/plugins/${slug}/edit`);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-white"
              >
                <Icon icon="heroicons:pencil-square" className="h-4 w-4" />
                <span>Edit Plugin</span>
              </button>
            )}

            {/* Claim ownership - only for unverified plugins and non-owners */}
            {!isOwner && githubUrl && !isVerified && !isOfficial && (
              <button
                onClick={handleClaimOwnership}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-white"
              >
                <Icon icon="heroicons:identification" className="h-4 w-4" />
                <span>
                  {isGitHubAuthenticated ? 'Claim Ownership' : 'Sign in to Claim Ownership'}
                </span>
              </button>
            )}

            {/* Reclaim ownership - for verified plugins when not recognized as owner */}
            {!isOwner && githubUrl && isVerified && !isOfficial && (
              <button
                onClick={handleClaimOwnership}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-white"
              >
                <Icon icon="heroicons:key" className="h-4 w-4" />
                <span>
                  {isGitHubAuthenticated ? 'Verify Ownership' : 'Sign in to Verify Ownership'}
                </span>
              </button>
            )}

            {/* Delete option - only for owners */}
            {isOwner && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <Icon icon="heroicons:trash" className="h-4 w-4" />
                <span>Request Deletion</span>
              </button>
            )}

            <Divider className="my-1 opacity-20" />

            {/* Report option - for everyone */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowReportModal(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-white"
            >
              <Icon icon="heroicons:flag" className="h-4 w-4" />
              <span>Report Plugin</span>
            </button>

            {/* Share option - for everyone */}
            <button
              onClick={() => {
                // Copy the current URL to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-white"
            >
              <Icon icon="heroicons:share" className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Deletion Request Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal} backdrop="blur">
        <ModalContent className="border border-white/10 bg-black/90 text-white">
          <ModalHeader className="border-b border-white/10">
            <h3 className="text-xl font-bold">Request Plugin Deletion</h3>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="mb-4 text-white/80">
              Are you sure you want to request the deletion of this plugin? This action cannot be
              undone. Our administrators will review your request.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/60">Your Name *</label>
                <Input
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Your Email *</label>
                <Input
                  type="email"
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Reason (Optional)</label>
                <Textarea
                  value={reportMessage}
                  onChange={e => setReportMessage(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="Reason for deletion request"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-white/10">
            <Button
              variant="bordered"
              onClick={() => setShowDeleteModal(false)}
              className="border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteSubmit}
              isLoading={isSubmitting}
              isDisabled={!reporterName || !reporterEmail}
            >
              Request Deletion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Report Plugin Modal */}
      <Modal
        radius="none"
        isOpen={showReportModal}
        onOpenChange={setShowReportModal}
        backdrop="blur"
      >
        <ModalContent className="border border-white/10 bg-black/90 text-white">
          <ModalHeader className="border-b border-white/10">
            <h3 className="text-xl font-bold">Report Plugin</h3>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="mb-4 text-white/80">
              Please provide details about your concern with this plugin. Our team will review your
              report and take appropriate action.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/60">Report Type *</label>
                <Select
                  aria-label="Report Type"
                  selectedKeys={new Set([reportType])}
                  onSelectionChange={keys => {
                    const selected = Array.from(keys)[0]?.toString();
                    if (selected) {
                      setReportType(selected as any);
                    }
                  }}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    base: 'text-white',
                    trigger:
                      'bg-white/5 border-white/10 hover:border-white/20 data-[open=true]:border-primary',
                    value: 'text-white',
                    listbox: 'bg-black/95 backdrop-blur-md text-white',
                    popoverContent: 'bg-black/95 backdrop-blur-md border border-white/10',
                  }}
                >
                  <SelectItem key="content-violation">Content Violation</SelectItem>
                  <SelectItem key="security">Security Concern</SelectItem>
                  <SelectItem key="copyright">Copyright Infringement</SelectItem>
                  <SelectItem key="other">Other Issue</SelectItem>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Your Name *</label>
                <Input
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Your Email *</label>
                <Input
                  type="email"
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Details of Report *</label>
                <Textarea
                  value={reportMessage}
                  onChange={e => setReportMessage(e.target.value)}
                  className="w-full"
                  variant="bordered"
                  radius="none"
                  classNames={{
                    input: 'text-white',
                    inputWrapper: 'bg-white/5 border-white/10 hover:border-white/20',
                  }}
                  placeholder="Please describe the issue in detail"
                  minRows={4}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-white/10">
            <Button
              variant="bordered"
              onPress={() => setShowReportModal(false)}
              className="border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleReportSubmit}
              isLoading={isSubmitting}
              isDisabled={!reporterName || !reporterEmail || !reportMessage}
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Verification Modal */}
      <Modal
        radius="none"
        isOpen={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        backdrop="blur"
      >
        <ModalContent className="border border-white/10 bg-black/90 text-white">
          <ModalHeader className="border-b border-white/10">
            <h3 className="text-xl font-bold">Verify Plugin Ownership</h3>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="mb-4">
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900/30">
                  <Icon icon="heroicons:identification" className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium">GitHub Repository Verification</h4>
                  <p className="text-sm text-white/70">
                    {`We'll verify you have write access to the repository`}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-none bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Icon icon="heroicons:code-bracket-square" className="h-5 w-5" />
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {githubUrl}
                  </a>
                </div>
              </div>

              <p className="text-sm text-white/70">
                {`When you click "Verify Ownership", we'll check if your GitHub account has write
								access to this repository. If successful, you'll be registered as the owner of this
								plugin.`}
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => setShowVerificationModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={verifyOwnership}
              isLoading={isVerifying}
              startContent={<Icon icon="heroicons:shield-check" className="h-5 w-5" />}
            >
              Verify Ownership
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

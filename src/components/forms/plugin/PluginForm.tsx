'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Spinner,
  Chip,
  Form,
  Select,
  SelectItem,
  Switch,
  Tabs,
  Tab,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

// Import shared components and actions
import {
  TerminalInput,
  MultiPackageManagerInput,
  GitHubRepoCard,
  ImageUploader,
} from './FormComponents';
import {
  fetchGitHubRepo,
  extractInstallCommand,
  getAuthSession,
  verifyGitHubOwnership,
  submitPlugin,
  updatePlugin,
  getTags,
  getCategories,
  getPluginForEdit,
  GitHubRepoResult,
  InstallCommand,
  fetchUserRepositories,
} from './actions';

// Form variant type
export type PluginFormVariant = 'submit' | 'edit';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  githubToken?: string;
}

// Error state interface
export interface ErrorState {
  hasError: boolean;
  isUnauthorized?: boolean;
  message?: string;
}

// Props for the form component
interface PluginFormProps {
  variant: PluginFormVariant;
  slug?: string; // Required for edit variant
  initialData?: any; // For edit variant
  authState?: AuthState; // Authentication state
  errorState?: ErrorState; // Error state
}

export function PluginForm({ variant, slug, initialData, authState, errorState }: PluginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // References
  const formRef = useRef<HTMLFormElement>(null);

  // State hooks for transition
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Form states
  const [showRepoForm, setShowRepoForm] = useState(variant === 'submit');
  const [showMainForm, setShowMainForm] = useState(variant === 'edit');
  const [showVerification, setShowVerification] = useState(false);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);
  const [submittedPluginSlug, setSubmittedPluginSlug] = useState('');

  // GitHub and repo data states
  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isGithubAuthenticated, setIsGithubAuthenticated] = useState(false);

  // Form data states
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Default form data
  const defaultFormData = {
    name: '',
    shortDescription: '',
    description: '',
    githubUrl: '',
    category: '',
    tags: [] as string[],
    installCommands: [] as InstallCommand[],
    relatedLinks: {
      npmUrl: '',
      demoUrl: '',
      videoUrl: '',
    },
    images: [] as File[],
    githubData: null as null | {
      stars: number;
      forks: number;
      updatedAt: string;
      pushedAt: string;
    },
  };

  // Form data state
  const [formData, setFormData] = useState(defaultFormData);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string; alt?: string }>
  >([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  // Effect to initialize form
  useEffect(() => {
    if (variant === 'submit') {
      // Check for GitHub URL in search params (for submission variant)
      const githubUrl = searchParams.get('githubUrl');
      if (githubUrl) {
        setRepoUrl(githubUrl);
      }
    }

    // Initialize form data
    if (variant === 'edit' && initialData) {
      // Convert initial data to form data format (edit variant)
      initializeEditFormData(initialData);
    }

    // Fetch categories and tags
    fetchCategoriesAndTags();

    // Check auth session in both variants
    if (!authState) {
      checkAuthSession();
    } else {
      // If auth state is provided as a prop, use it
      setIsGithubAuthenticated(authState.isAuthenticated);
      if (authState.username) {
        setGithubUsername(authState.username);
      }

      // For submit variant with authenticated user, fetch their repos
      if (variant === 'submit' && authState.isAuthenticated && authState.githubToken) {
        fetchUserRepos(authState.username || '', authState.githubToken);
      }
    }
  }, [variant, initialData, searchParams, authState]);

  // Function to initialize edit form data
  const initializeEditFormData = (data: any) => {
    // Extract images if available
    let images: Array<{ id: number; url: string; alt?: string }> = [];
    if (data.images && Array.isArray(data.images)) {
      images = data.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      }));
      setExistingImages(images);
    }

    // Extract installation commands
    let installCommands: InstallCommand[] = [];
    if (data.installCommands && Array.isArray(data.installCommands)) {
      installCommands = data.installCommands;
    } else if (data.installCommand) {
      // Legacy format
      installCommands = [
        {
          packageManager: 'npm',
          command: `npm install ${data.installCommand}`,
        } as InstallCommand,
      ];
    }

    // Extract related links
    const relatedLinks = {
      npmUrl: data.relatedLinks?.npm || '',
      demoUrl: data.relatedLinks?.demo || '',
      videoUrl: data.relatedLinks?.video || '',
    };

    // Set form data
    setFormData({
      name: data.name || '',
      shortDescription: data.shortDescription || '',
      description: data.fullDescription || '',
      githubUrl: data.githubUrl || '',
      category: data.category?.id || '',
      tags: data.tags?.map((tag: any) => tag.id.toString()) || [],
      installCommands,
      relatedLinks,
      images: [],
      githubData: data.githubData || null,
    });

    // If GitHub URL exists, fetch repo data (in case we need it)
    if (data.githubUrl) {
      setRepoUrl(data.githubUrl);
    }
  };

  // Function to check authentication session
  const checkAuthSession = async () => {
    try {
      const response = await getAuthSession();

      if (response.success && response.session) {
        setIsGithubAuthenticated(true);
        if (response.session.user?.name) {
          setGithubUsername(response.session.user.name);
        }
      } else {
        setIsGithubAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
      setIsGithubAuthenticated(false);
    }
  };

  // Function to fetch categories and tags
  const fetchCategoriesAndTags = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories || []);
      }

      // Fetch tags
      const tagsResponse = await getTags();
      if (tagsResponse.success) {
        setTags(tagsResponse.tags || []);
      }
    } catch (error) {
      console.error('Error fetching categories and tags:', error);
    }
  };

  // Function to handle GitHub verification
  const handleVerificationChange = (isVerified: boolean, data?: any) => {
    setVerificationData(isVerified ? { verified: true, data } : null);

    if (isVerified) {
      toast.success('GitHub verification successful!');
    }
  };

  // Function to handle repo selection
  const handleSelectRepo = async (repoUrl: string) => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    // Show loading state
    setLoading(true);
    setError('');

    try {
      // Fetch repository data
      const result = await fetchGitHubRepo(repoUrl);

      if ('success' in result && result.success) {
        // Set repository data
        setRepoData(result);
        setLoading(false);

        // Pre-fill form data with repository info
        setFormData(prev => ({
          ...prev,
          name: result.repo.name || '',
          shortDescription: result.repo.description || '',
          description: result.readme || '',
          githubUrl: repoUrl,
          installCommands: prev.installCommands.length
            ? prev.installCommands
            : [
                {
                  packageManager: 'npm',
                  command: `npm install ${extractInstallCommand(result.readme || '')}`,
                } as InstallCommand,
              ],
          githubData: {
            stars: result.repo.stars,
            forks: result.repo.forks,
            updatedAt: result.repo.updatedAt,
            pushedAt: result.repo.pushedAt,
          },
        }));

        // Verify GitHub repository ownership
        if (isGithubAuthenticated) {
          const verificationResult = await verifyGitHubOwnership(repoUrl);

          if (verificationResult.verified) {
            handleVerificationChange(true, verificationResult.data);
          } else {
            handleVerificationChange(false);
          }
        }

        // Show main form
        setShowRepoForm(false);
        setShowMainForm(true);
      } else {
        // Handle error
        setError(result.error || 'Failed to fetch repository');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error selecting repository:', error);
      setError('An error occurred while fetching the repository');
      setLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Form validation
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Show loading state
    startTransition(async () => {
      setLoading(true);

      try {
        // Create FormData object
        const formDataObj = new FormData();

        // Add form data as JSON string
        formDataObj.append(
          'formData',
          JSON.stringify({
            ...formData,
            removedImageIds,
          })
        );

        // Add verification data if available
        if (verificationData) {
          formDataObj.append('verificationData', JSON.stringify(verificationData));
        }

        // Add images (handled separately due to binary nature)
        formData.images.forEach((image: File) => {
          formDataObj.append('images', image);
        });

        // Add slug and ID for edit variant
        if (variant === 'edit' && slug && initialData) {
          formDataObj.append('slug', slug);
          formDataObj.append('pluginId', initialData.id);
        }

        // Submit form using appropriate action based on variant
        const response =
          variant === 'submit' ? await submitPlugin(formDataObj) : await updatePlugin(formDataObj);

        // Handle response
        if (response.success) {
          if (variant === 'submit') {
            setShowMainForm(false);
            setShowSubmissionSuccess(true);
            // Check if slug exists before using it
            if ('slug' in response && response.slug) {
              setSubmittedPluginSlug(response.slug);

              // Redirect after a delay
              setTimeout(() => {
                router.push(`/plugins/${response.slug}`);
              }, 3000);
            }
          } else {
            // Handle edit success
            toast.success('Plugin updated successfully');

            // Redirect if slug changed
            if ('newSlug' in response && response.newSlug) {
              router.push(`/plugins/${response.newSlug}/edit`);
            } else if (slug) {
              router.push(`/plugins/${slug}`);
            }
          }
        } else {
          // Handle error
          toast.error(response.error || 'An error occurred');
          setError(response.error || 'An error occurred');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setError('An error occurred while submitting the form');
      } finally {
        setLoading(false);
      }
    });
  };

  // Function to fetch user repositories
  const fetchUserRepos = async (username: string, token?: string) => {
    if (!username) return;

    try {
      setLoadingRepos(true);

      // If token is provided, use it to fetch user repos
      if (token) {
        const response = await fetchUserRepositories(token);

        if (response.success && response.repos) {
          setGithubRepos(response.repos);
        } else {
          console.error('Failed to fetch repositories:', response.error);
        }
      }
    } catch (error) {
      console.error('Error fetching user repositories:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Handle removing existing images
  const handleRemoveExistingImage = (id: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setRemovedImageIds(prev => [...prev, id]);
  };

  // Handle adding new images
  const handleImagesChange = (newImages: File[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // Function to check if form is valid
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.shortDescription.trim() !== '' &&
      (variant === 'edit' || formData.githubUrl.trim() !== '')
    );
  };

  // Determine if user has verified ownership
  const isVerified = !!verificationData?.verified;

  // Function to validate GitHub URL format
  const isValidGithubUrl = (url: string) => {
    return /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/.test(url);
  };

  // Simple component to display a GitHub repository item
  const RepoListItem = ({ repo, onSelect }: { repo: any; onSelect: () => void }) => {
    return (
      <div
        className="cursor-pointer rounded-lg border border-foreground/10 p-4 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
        onClick={onSelect}
      >
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0">
            <Image
              src={repo.owner.avatarUrl}
              alt={repo.owner.login}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground">{repo.name}</h3>
            <p className="text-sm text-foreground/60">{repo.fullName}</p>
          </div>
          <div className="flex flex-shrink-0 items-center space-x-3 text-foreground/60">
            <div className="flex items-center">
              <Icon icon="heroicons:star" className="mr-1 h-4 w-4" />
              <span className="text-sm">{repo.stars}</span>
            </div>
            <div className="flex items-center">
              <Icon icon="heroicons:code-bracket-fork" className="mr-1 h-4 w-4" />
              <span className="text-sm">{repo.forks}</span>
            </div>
          </div>
        </div>
        {repo.description && (
          <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{repo.description}</p>
        )}
      </div>
    );
  };

  // Error state component
  const ErrorMessage = ({ title, message }: { title: string; message: string }) => {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-start">
          <div className="mr-4">
            <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold">{title}</h2>
            <p className="text-foreground/80">{message}</p>
          </div>
        </div>
      </div>
    );
  };

  // Check for error states
  if (errorState?.hasError) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorMessage
          title={errorState.isUnauthorized ? 'Unauthorized Access' : 'Error'}
          message={
            errorState.message || errorState.isUnauthorized
              ? "You don't have permission to access this resource."
              : 'An error occurred while loading the data.'
          }
        />

        {variant === 'edit' && slug && (
          <div className="mt-6">
            <Link
              href={`/plugins/${slug}`}
              className="flex items-center text-foreground/70 transition-colors hover:text-foreground"
            >
              <Icon icon="heroicons:arrow-left" className="mr-1 h-4 w-4" />
              Back to Plugin
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* GitHub Repository Selection Form (Submit variant only) */}
      {variant === 'submit' && showRepoForm && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold">Submit Your Plugin</h1>
            <p className="text-foreground/70">
              Start by entering the GitHub repository URL of your plugin
            </p>
          </div>

          <Card className="mb-8 border-foreground/10 shadow-none">
            <CardBody className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="githubUrl" className="mb-1 block text-sm font-medium">
                    GitHub Repository URL
                  </label>
                  <div className="flex">
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="flex-grow"
                      startContent={<Icon icon="bi:github" />}
                      disabled={loading}
                      variant="bordered"
                      radius="none"
                    />
                    <Button
                      color="primary"
                      onPress={() => handleSelectRepo(repoUrl)}
                      disabled={loading || !isValidGithubUrl(repoUrl)}
                      className="ml-2"
                      radius="none"
                    >
                      {loading ? <Spinner size="sm" color="current" /> : 'Continue'}
                    </Button>
                  </div>
                  {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* GitHub Repository List (Submit variant only) */}
      {variant === 'submit' && githubRepos.length > 0 && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold">Your GitHub Repositories</h1>
            <p className="text-foreground/70">Select a repository to submit as a plugin</p>
          </div>

          <div className="space-y-4">
            {githubRepos.map(repo => (
              <RepoListItem
                key={repo.id}
                repo={repo}
                onSelect={() => handleSelectRepo(repo.html_url)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Plugin Form */}
      {showMainForm && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold">
              {variant === 'submit' ? 'Submit Your Plugin' : 'Edit Plugin'}
            </h1>
            <p className="text-foreground/70">
              {variant === 'submit'
                ? 'Complete the form below to submit your plugin'
                : 'Update your plugin information'}
            </p>
          </div>

          {/* GitHub Repository Info (if repo data is available) */}
          {repoData && variant === 'submit' && (
            <div className="mb-6">
              <Card className="border-foreground/10 shadow-none">
                <CardBody>
                  <div className="flex items-center space-x-4">
                    {/* Repository avatar */}
                    <div className="flex-shrink-0">
                      <Image
                        src={repoData.repo.owner.avatarUrl}
                        alt={repoData.repo.owner.login}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>

                    {/* Repository info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold">{repoData.repo.name}</h3>
                      <p className="text-sm text-foreground/60">{repoData.repo.fullName}</p>
                      {repoData.repo.description && (
                        <p className="mt-1 text-foreground/80">{repoData.repo.description}</p>
                      )}
                    </div>

                    {/* Verification badge */}
                    <div className="flex-shrink-0">
                      {isVerified ? (
                        <Chip
                          color="success"
                          startContent={<Icon icon="heroicons:check-badge" className="text-lg" />}
                        >
                          Verified Owner
                        </Chip>
                      ) : (
                        <Chip
                          color="warning"
                          variant="flat"
                          startContent={
                            <Icon icon="heroicons:shield-exclamation" className="text-lg" />
                          }
                        >
                          Unverified
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
            {/* Basic Information */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Basic Information</h2>
                <p className="text-foreground/70">Provide essential details about your plugin</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Plugin Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Plugin"
                    className="w-full"
                    disabled={isPending}
                    variant="bordered"
                    radius="none"
                    isRequired
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="mb-1 block text-sm font-medium">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="A brief description of your plugin (max 150 characters)"
                    className="w-full"
                    disabled={isPending}
                    variant="bordered"
                    radius="none"
                    maxRows={2}
                    isRequired
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-1 block text-sm font-medium">
                    Category
                  </label>
                  <Select
                    id="category"
                    name="category"
                    selectedKeys={formData.category ? [formData.category.toString()] : []}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Select a category"
                    className="w-full"
                    disabled={isPending}
                    variant="bordered"
                    radius="none"
                  >
                    {categories.map(category => (
                      <SelectItem key={category.id}>{category.name}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="tags" className="mb-1 block text-sm font-medium">
                    Tags
                  </label>
                  <Select
                    id="tags"
                    name="tags"
                    selectedKeys={formData.tags.map(tag => tag.toString())}
                    onChange={e => {
                      // Handle multi-select tags
                      setFormData({
                        ...formData,
                        tags: Array.from(
                          (e.target as HTMLSelectElement).selectedOptions,
                          option => option.value
                        ),
                      });
                    }}
                    placeholder="Select tags"
                    className="w-full"
                    disabled={isPending}
                    variant="bordered"
                    radius="none"
                    multiple
                  >
                    {tags.map(tag => (
                      <SelectItem key={tag.id}>{tag.name}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* In the edit variant, don't show this field */}
                {variant === 'submit' && (
                  <div>
                    <label htmlFor="description" className="mb-1 block text-sm font-medium">
                      Full Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A detailed description of your plugin"
                      className="w-full"
                      disabled={isPending}
                      variant="bordered"
                      radius="none"
                      minRows={8}
                    />
                    <p className="mt-1 text-xs text-foreground/60">
                      This will be pre-filled with your repository README content, but you can
                      modify it as needed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Installation Commands */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Installation Commands</h2>
                <p className="text-foreground/70">
                  Provide commands for different package managers
                </p>
              </div>

              <MultiPackageManagerInput
                commands={formData.installCommands}
                onChange={commands => setFormData({ ...formData, installCommands: commands })}
                disabled={isPending}
              />
            </div>

            {/* Related Links */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Related Links</h2>
                <p className="text-foreground/70">
                  Add optional links to help users learn more about your plugin
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="npmUrl" className="mb-1 block text-sm font-medium">
                    NPM URL
                  </label>
                  <Input
                    id="npmUrl"
                    name="npmUrl"
                    value={formData.relatedLinks.npmUrl || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        relatedLinks: { ...formData.relatedLinks, npmUrl: e.target.value },
                      })
                    }
                    placeholder="https://www.npmjs.com/package/your-plugin"
                    className="w-full"
                    variant="bordered"
                    radius="none"
                    startContent={<Icon icon="simple-icons:npm" className="text-red-600" />}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="demoUrl" className="mb-1 block text-sm font-medium">
                    Demo URL
                  </label>
                  <Input
                    id="demoUrl"
                    name="demoUrl"
                    value={formData.relatedLinks.demoUrl || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        relatedLinks: { ...formData.relatedLinks, demoUrl: e.target.value },
                      })
                    }
                    placeholder="https://demo.example.com"
                    className="w-full"
                    variant="bordered"
                    radius="none"
                    startContent={<Icon icon="heroicons:globe-alt" className="text-blue-400" />}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="videoUrl" className="mb-1 block text-sm font-medium">
                    Video Tutorial URL
                  </label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.relatedLinks.videoUrl || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        relatedLinks: { ...formData.relatedLinks, videoUrl: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/watch?v=example"
                    className="w-full"
                    variant="bordered"
                    radius="none"
                    startContent={<Icon icon="heroicons:play" className="text-red-400" />}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Screenshots</h2>
                <p className="text-foreground/70">Upload images to showcase your plugin</p>
              </div>

              <div className="space-y-6">
                <ImageUploader
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  existingImageUrls={existingImages}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="mt-10 border-t border-foreground/10 pt-6">
              <div className="flex flex-wrap gap-4">
                {variant === 'submit' && (
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => {
                      setShowMainForm(false);
                      setShowRepoForm(true);
                    }}
                    className="min-w-[100px]"
                    radius="none"
                    type="button"
                  >
                    Back
                  </Button>
                )}
                <Button
                  color="primary"
                  isLoading={isPending}
                  type="submit"
                  className="min-w-[120px]"
                  radius="none"
                  disabled={isPending || !isFormValid()}
                  startContent={
                    !isPending && (
                      <Icon
                        icon={variant === 'submit' ? 'heroicons:paper-airplane' : 'heroicons:check'}
                      />
                    )
                  }
                >
                  {isPending
                    ? 'Processing...'
                    : variant === 'submit'
                      ? 'Submit Plugin'
                      : 'Save Changes'}
                </Button>

                {variant === 'edit' && (
                  <Button
                    as={Link}
                    href={`/plugins/${slug}`}
                    color="default"
                    variant="flat"
                    className="min-w-[100px]"
                    radius="none"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {error && <p className="text-red-400 fl-text-step--1 fl-mt-s">{error}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Success Screen (Submit variant only) */}
      {variant === 'submit' && showSubmissionSuccess && (
        <div className="animate-fade-in">
          <div className="flex flex-col items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5 p-10">
            {loading ? (
              <>
                <Spinner size="lg" color="primary" className="mb-4" />
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  Submitting your plugin...
                </h2>
                <p className="mb-4 text-center text-foreground/70">
                  Please wait while we process your submission. This may take a few moments.
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Icon icon="heroicons:check-circle" className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  Plugin submitted successfully!
                </h2>
                <p className="mb-6 text-center text-foreground/70">
                  Your plugin has been submitted and will be reviewed shortly. You will be
                  redirected to your plugin page in a moment.
                </p>
                {submittedPluginSlug && (
                  <Link href={`/plugins/${submittedPluginSlug}`}>
                    <Button color="primary" variant="flat" className="min-w-[150px]" radius="none">
                      View Plugin
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

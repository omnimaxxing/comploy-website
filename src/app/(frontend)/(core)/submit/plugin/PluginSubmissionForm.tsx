'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useActionState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Select,
  SelectItem,
  Form,
  Switch,
} from '@heroui/react';

import { Icon } from '@iconify/react';
import {
  fetchGitHubRepo,
  generateDescriptionWithGroq,
  extractInstallCommand,
  submitPlugin,
  fetchRepoAndRedirect,
  getAuthSession,
} from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';
import GitHubVerification from '../components/GitHubVerification';
import { FormInput } from '../components/FormInput';
import { SubmitButton } from '../components/SubmitButton';
import Image from 'next/image';
import { Tag, TagColor } from '@/components/ui/tag';

// Terminal style component for install commands
const TerminalInput = ({
  value,
  onChange,
  placeholder,
  prefix = 'pnpm install',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="flex items-center overflow-hidden border border-foreground/20 bg-background/50 p-3 font-mono fl-text-step--1">
      <span className="mr-2 text-foreground/40">{prefix}</span>
      <input
        type="text"
        className="flex-1 border-none bg-transparent text-foreground outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

// Multiple package manager installation commands component
const MultiPackageManagerInput = ({
  commands,
  onChange,
  disabled = false,
}: {
  commands: Array<{
    packageManager: string;
    customLabel?: string;
    command: string;
  }>;
  onChange: (
    commands: Array<{
      packageManager: string;
      customLabel?: string;
      command: string;
    }>
  ) => void;
  disabled?: boolean;
}) => {
  // Package manager options
  const packageManagers = [
    { value: 'npm', label: 'npm', prefix: 'npm install', icon: 'logos:npm' },
    { value: 'yarn', label: 'yarn', prefix: 'yarn add', icon: 'logos:yarn' },
    { value: 'pnpm', label: 'pnpm', prefix: 'pnpm add', icon: 'logos:pnpm' },
    { value: 'bun', label: 'bun', prefix: 'bun add', icon: 'logos:bun' },
  ];

  // Add a new command
  const addCommand = () => {
    // Find a package manager that isn't already used
    const unusedManagers = packageManagers.filter(
      pm => !commands.some(cmd => cmd.packageManager === pm.value)
    );

    if (unusedManagers.length === 0) return; // All package managers are used

    const nextManager = unusedManagers[0];

    // Generate a command value based on existing commands if any
    let packageName = '';
    if (commands.length > 0) {
      // Get the package name from the first command
      const firstCommand = commands[0].command;
      const prefix = getPrefix(commands[0].packageManager);
      packageName = firstCommand.startsWith(prefix)
        ? firstCommand.substring(prefix.length).trim()
        : firstCommand;
    }

    // Create full command with prefix
    const fullCommand = packageName ? `${nextManager.prefix} ${packageName}` : '';

    onChange([
      ...commands,
      {
        packageManager: nextManager.value,
        command: fullCommand,
      },
    ]);
  };

  // Update a command
  const updateCommand = (index: number, field: string, value: string) => {
    if (field === 'command') {
      // When updating the command, prepend the package manager prefix
      const updatedCommands = [...commands];
      const prefix = getPrefix(updatedCommands[index].packageManager);
      updatedCommands[index] = {
        ...updatedCommands[index],
        command: `${prefix} ${value}`,
      };
      onChange(updatedCommands);
    } else if (field === 'packageManager') {
      // When changing package manager, keep the package name but change the prefix
      const updatedCommands = [...commands];
      const oldCommand = updatedCommands[index].command;
      const oldPrefix = getPrefix(updatedCommands[index].packageManager);
      const packageName = getPackageNameFromCommand(
        oldCommand,
        updatedCommands[index].packageManager
      );

      // Update package manager first
      updatedCommands[index] = {
        ...updatedCommands[index],
        packageManager: value,
      };

      // Then update command with new prefix
      const newPrefix = getPrefix(value);
      updatedCommands[index].command = `${newPrefix} ${packageName}`;

      onChange(updatedCommands);
    } else {
      // For other fields, update normally
      const updatedCommands = [...commands];
      updatedCommands[index] = {
        ...updatedCommands[index],
        [field]: value,
      };
      onChange(updatedCommands);
    }
  };

  // Remove a command
  const removeCommand = (index: number) => {
    onChange(commands.filter((_, i) => i !== index));
  };

  // Get the prefix for a package manager
  const getPrefix = (packageManager: string): string => {
    const pm = packageManagers.find(pm => pm.value === packageManager);
    return pm ? pm.prefix : 'install';
  };

  // Extract the package name from a command with prefix
  const getPackageNameFromCommand = (command: string, packageManager: string): string => {
    const prefix = getPrefix(packageManager);
    return command.startsWith(prefix) ? command.substring(prefix.length).trim() : command;
  };

  return (
    <div className="space-y-4">
      {commands.map((command, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-32">
              <Select
                selectedKeys={[command.packageManager]}
                onChange={e => updateCommand(index, 'packageManager', e.target.value)}
                disabled={disabled}
                className="w-full text-foreground"
                variant="bordered"
                radius="none"
                classNames={{
                  base: 'text-foreground',
                  trigger: 'bg-background border-foreground/20 data-[open=true]:border-primary',
                  listbox: 'bg-background/95 backdrop-blur-md text-foreground',
                  popoverContent: 'bg-background/95 backdrop-blur-md border border-foreground/20',
                }}
              >
                {packageManagers.map(pm => (
                  <SelectItem
                    key={pm.value}
                    className="data-[selected=true]:bg-primary/20 text-foreground data-[hover=true]:bg-foreground/10"
                    isReadOnly={
                      pm.value !== command.packageManager &&
                      commands.some(cmd => cmd.packageManager === pm.value)
                    }
                    startContent={<Icon icon={pm.icon} className="mr-2 h-4 w-4" />}
                  >
                    {pm.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <button
              type="button"
              className="p-2 text-foreground/60 hover:text-foreground/90"
              onClick={() => removeCommand(index)}
              disabled={disabled}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <TerminalInput
            value={getPackageNameFromCommand(command.command, command.packageManager)}
            onChange={value => updateCommand(index, 'command', value)}
            placeholder="package-name"
            prefix={getPrefix(command.packageManager)}
            disabled={disabled}
          />
        </div>
      ))}

      {commands.length < packageManagers.length && (
        <button
          type="button"
          className="text-primary hover:text-primary/80 mt-2 flex items-center gap-1"
          onClick={addCommand}
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {commands.length > 0 ? 'Add another package manager' : 'Add a package manager'}
          </span>
        </button>
      )}
    </div>
  );
};

// GitHub repo card component
const GitHubRepoCard = ({
  repo,
}: {
  repo: {
    name: string;
    fullName: string;
    description: string;
    owner: {
      login: string;
      avatarUrl: string;
    };
  };
}) => {
  return (
    <Card className="border-foreground/10 bg-background">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md flex items-center font-semibold">
            <Icon icon="mdi:github" className="mr-2" />
            {repo.fullName}
          </p>
          <p className="text-small text-foreground/60">By {repo.owner.login}</p>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-foreground/80">{repo.description || ''}</p>
      </CardBody>
    </Card>
  );
};

// Image uploader component
const ImageUploader = ({
  images,
  onImagesChange,
  disabled = false,
}: {
  images: File[];
  onImagesChange: (images: File[]) => void;
  disabled?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate image previews when images change
  useEffect(() => {
    const newPreviews = images.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup function to revoke object URLs
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [images]);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    // Convert FileList to array and filter for images
    const newFiles = Array.from(e.target.files).filter(file => {
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        return false;
      }

      // Check file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        toast.error('File too large. Please select an image under 5MB.');
        return false;
      }

      return true;
    });

    if (newFiles.length === 0) {
      toast.error('Invalid files. Please select valid image files (JPG, PNG, GIF) under 5MB.');
      return;
    }

    // Add new files to existing ones, up to 4 max
    const updatedImages = [...images, ...newFiles].slice(0, 4);
    onImagesChange(updatedImages);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Show success toast
    toast.success(`${newFiles.length} image${newFiles.length > 1 ? 's' : ''} added successfully.`);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Image preview cards */}
        {previews.map((preview, index) => (
          <div
            key={index}
            className={`group relative border-2 ${
              index === 0 ? 'border-primary' : 'border-foreground/10'
            } overflow-hidden rounded-lg transition-colors hover:border-foreground/30`}
          >
            <div className="relative h-40 w-40">
              <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-background/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="self-end">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="rounded-full bg-background/80 p-1 text-foreground transition-colors hover:bg-red-500 hover:text-background"
                  disabled={disabled}
                >
                  <Icon icon="heroicons:x-mark" className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="self-start">
                  <span className="bg-primary rounded-full p-1 text-xs text-background">Main</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upload button */}
        {images.length < 4 && (
          <div
            className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/20 transition-colors hover:border-foreground/40"
            onClick={disabled ? undefined : triggerFileInput}
          >
            <Icon icon="heroicons:photo" className="h-8 w-8 text-foreground/40" />
            <span className="text-sm text-foreground/60">Add images</span>
            <span className="text-xs text-foreground/40">{images.length}/4</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-foreground/60">
        Upload up to 4 screenshots of your plugin. The first image will automatically be used as the
        featured image.
      </p>
    </div>
  );
};

// Main form component
export function PluginSubmissionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    githubUrl: '',
    category: '',
    tags: [] as string[],
    installCommands: [] as Array<{
      packageManager: string;
      customLabel?: string;
      command: string;
    }>,
    relatedLinks: {
      github: '',
      npm: '',
      demo: '',
      video: '',
    },
    isNpmLinkEnabled: false,
    isDemoLinkEnabled: false,
    isVideoLinkEnabled: false,
    images: [] as File[],
    mainImageIndex: undefined as number | undefined,
    readmeContent: '',
    useReadmeAsDescription: false,
  });
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isGitHubVerified, setIsGitHubVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // For categories and tags
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // For storage of repo data
  const [repoData, setRepoData] = useState<any>(null);
  const [userRepos, setUserRepos] = useState<any[]>([]);

  // Form view stages
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(true);
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [showMainForm, setShowMainForm] = useState(false);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);
  const [submittedPluginSlug, setSubmittedPluginSlug] = useState<string | null>(null);

  // Add state for auth session
  const [authSession, setAuthSession] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // At the appropriate position in the component, add a formRef
  const formRef = useRef<HTMLFormElement>(null);

  // Form action handlers with useActionState
  const [repoFetchState, repoAction] = useActionState(async (prevState, formData: FormData) => {
    const githubUrl = formData.get('githubUrl') as string;

    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return { error: 'Please enter a valid GitHub repository URL' };
    }

    try {
      setLoading(true);

      const repoResult = await fetchGitHubRepo(githubUrl);

      if (!repoResult.success) {
        setLoading(false);
        return { error: repoResult.error || 'Failed to fetch repository data' };
      }

      let installCommands: { packageManager: string; command: string; customLabel?: string }[] = [];

      if (repoResult.readme) {
        const extractResult = await extractInstallCommand(repoResult.readme);
        if (extractResult.found && extractResult.installCommands) {
          installCommands = extractResult.installCommands;
        }
      }

      setFormData(prev => ({
        ...prev,
        githubUrl: githubUrl,
        name: repoResult.repo.name || '',
        shortDescription: repoResult.repo.description || '',
        installCommands: installCommands.length > 0 ? installCommands : prev.installCommands,
      }));

      setRepoData(repoResult.repo);
      setShowRepoForm(false);
      setShowMainForm(true);

      return {
        success: true,
        repo: repoResult.repo,
        readme: repoResult.readme,
        installCommands: installCommands,
      };
    } catch (error) {
      setLoading(false);
      return { error: error instanceof Error ? error.message : 'Failed to fetch repository data' };
    }
  }, null);

  // Handle GitHub user repos fetch
  const fetchUserRepos = async (username: string, token?: string) => {
    try {
      setLoading(true);

      if (!token) {
        console.error('No token provided for GitHub API');
        throw new Error('Authentication token is required to fetch repositories');
      }

      // Call API to fetch user repos with token
      console.log('Fetching repositories with token');
      const response = await fetch(`/api/github/user-repos?token=${token}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user repositories');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        console.log(`Fetched ${data.length} repositories`);
        setUserRepos(data);
      }

      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error('Error fetching repositories:', error);
      toast.error('Failed to fetch your GitHub repositories');
      return false;
    }
  };

  // Submit action
  const [submitState, submitAction] = useActionState(async (prevState, formData: FormData) => {
    try {
      setLoading(true);
      console.log('Form submission started');

      // Get form data
      const formDataJson = formData.get('formData') as string;
      const parsedData = JSON.parse(formDataJson);
      const verificationDataJson = formData.get('verificationData') as string;
      const verificationData = JSON.parse(verificationDataJson || '{}');

      // Log verification data
      console.log('Verification data from form:', verificationData);
      console.log('Is GitHub verified?', isGitHubVerified);

      // Get the image files from the FormData
      const imageFiles = formData.getAll('imageFiles') as File[];

      console.log(`Processing ${imageFiles.length} images from form submission`);

      if (imageFiles.length > 0) {
        // Log the first image for debugging
        const firstImage = imageFiles[0];
        console.log(
          `First image: ${firstImage.name}, ${firstImage.type}, ${firstImage.size} bytes`
        );
      }

      // Add the images to the submission
      const result = await submitPlugin({
        name: parsedData.name,
        shortDescription: parsedData.shortDescription,
        githubUrl: parsedData.githubUrl,
        category: parsedData.category,
        tags: parsedData.tags,
        installCommands: parsedData.installCommands,
        relatedLinks: {
          github: parsedData.githubUrl,
          npm: parsedData.relatedLinks.npm,
          demo: parsedData.relatedLinks.demo,
          video: parsedData.relatedLinks.video,
        },
        verification: verificationData,
        images: imageFiles,
        mainImageIndex: imageFiles.length > 0 ? 0 : -1,
      });

      setLoading(false);

      if (result.success) {
        toast.success('Your plugin has been submitted and is now going live.');

        // Set the submitted plugin slug
        if (result.plugin && result.plugin.slug) {
          setSubmittedPluginSlug(result.plugin.slug);
        }

        // Show the success state
        setShowSubmissionSuccess(true);

        // Hide other form states
        setShowVerificationPrompt(false);
        setShowRepoForm(false);
        setShowMainForm(false);

        // Reset form data (but don't show the first step again)
        setFormData({
          name: '',
          shortDescription: '',
          githubUrl: '',
          category: '',
          tags: [],
          installCommands: [],
          relatedLinks: {
            github: '',
            npm: '',
            demo: '',
            video: '',
          },
          isNpmLinkEnabled: false,
          isDemoLinkEnabled: false,
          isVideoLinkEnabled: false,
          images: [],
          mainImageIndex: undefined,
          readmeContent: '',
          useReadmeAsDescription: false,
        });

        // Redirect to the plugin page if we have a slug
        if (result.plugin && result.plugin.slug) {
          // Short timeout to allow success state to be visible
          setTimeout(() => {
            router.push(`/plugins/${result.plugin.slug}`);
          }, 3000);
        }

        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to submit plugin');
      }
    } catch (error) {
      setLoading(false);
      return {
        error: error instanceof Error ? error.message : 'Failed to submit plugin',
      };
    }
  }, null);

  // Watch for submit state changes to handle errors
  useEffect(() => {
    if (submitState?.error) {
      console.error('Submission error:', submitState.error);
      toast.error(`Error: ${submitState.error}`);

      // If there was an error and we're in the success state, go back to the form
      if (showSubmissionSuccess) {
        setShowSubmissionSuccess(false);
        setShowMainForm(true);
      }

      // Make sure loading is off
      setLoading(false);
    } else if (submitState?.success) {
      console.log('Submission successful:', submitState);

      // Show success state when submission is successful
      setShowSubmissionSuccess(true);
      setShowVerificationPrompt(false);
      setShowRepoForm(false);
      setShowMainForm(false);
      setLoading(false);
    }
  }, [submitState, showSubmissionSuccess]);

  // Handle GitHub verification status
  const handleVerificationChange = (isVerified: boolean, data?: any) => {
    setIsGitHubVerified(isVerified);
    if (data) {
      // Add the 'verified' flag needed by submitPlugin function
      // and include method information
      setVerificationData({
        ...data,
        verified: isVerified,
        method: 'owner', // This indicates repository ownership
      });

      // If verification includes username, fetch their repos
      if (data.username && data.accessToken) {
        console.log('Fetching repositories for user:', data.username);
        fetchUserRepos(data.username, data.accessToken).then(success => {
          if (success) {
            // Move to repository selection after verification
            setShowVerificationPrompt(false);
            setShowRepoForm(true);

            // Show success toast
            toast.success(
              'GitHub Verification Successful. You can now select from your repositories or enter a URL manually.'
            );
          }
        });
      } else {
        // Move to repository selection even without repos
        setShowVerificationPrompt(false);
        setShowRepoForm(true);
      }
    } else {
      // If no data but verification is successful, still move forward
      if (isVerified) {
        setShowVerificationPrompt(false);
        setShowRepoForm(true);
      }
    }
  };

  // Skip verification and go to manual repo input
  const handleSkipVerification = () => {
    setIsGitHubVerified(false);
    setVerificationData(null);
    setShowVerificationPrompt(false);
    setShowRepoForm(true);
  };

  // Update the handleSelectRepo function to be simpler
  const handleSelectRepo = async (repoUrl: string) => {
    try {
      console.log('Selecting repository:', repoUrl);
      setLoading(true);

      // Create a FormData object to use with repoAction
      const formData = new FormData();
      formData.append('githubUrl', repoUrl);

      // Call the action directly
      const result = await fetchGitHubRepo(repoUrl);

      if (!result.success) {
        setLoading(false);
        toast.error('Error loading repository');
        return;
      }

      let installCommands: { packageManager: string; command: string; customLabel?: string }[] = [];

      if (result.readme) {
        const extractResult = await extractInstallCommand(result.readme);
        if (extractResult.found && extractResult.installCommands) {
          installCommands = extractResult.installCommands;
        }
      }

      // DETAILED VERIFICATION LOGGING
      console.log('==== REPOSITORY VERIFICATION DEBUG ====');
      console.log('Repository data:', result.repo);
      console.log('Verification data:', verificationData);

      // Extract owner from the repository data
      const repoOwner = result.repo.owner.login;
      const isOrganization = result.repo.owner.type === 'Organization';

      // Check if the authenticated user matches the repo owner
      // We'll consider it verified if either:
      // 1. The username matches the repo owner login (case insensitive)
      // 2. We have verification data with a valid user ID and access token
      const isVerifiedByUsername =
        verificationData?.username?.toLowerCase() === repoOwner?.toLowerCase();

      console.log('Repository owner login:', repoOwner);
      console.log('Is organization repo:', isOrganization);
      console.log('Authenticated user username:', verificationData?.username);
      console.log('Authenticated user display name:', verificationData?.displayName);
      console.log('Username match?', isVerifiedByUsername);

      // Always set verification to true if the user is authenticated and owns the repo
      if (verificationData && isVerifiedByUsername) {
        console.log('Setting repository as VERIFIED');
        setIsGitHubVerified(true);
        setVerificationData({
          ...verificationData,
          verifiedRepoUrl: repoUrl,
          verified: true,
          method: 'owner',
        });

        // Show success toast for verification
        toast.success('Repository Verified. This repository is verified as owned by you.');
      } else if (verificationData && isOrganization) {
        // For organization repositories, we can't check admin status here
        // We'll set it as pending and check later during submission
        setIsGitHubVerified(true);
        setVerificationData({
          ...verificationData,
          verifiedRepoUrl: repoUrl,
          verified: true,
          method: 'organization_pending',
        });

        // Show info toast for org repositories
        toast.info('Organization Repository - Admin status will be verified during submission.');
      } else {
        console.log('Repository NOT verified - user does not match owner');
        // Don't reset verification status completely, just mark this repo as not verified
        if (verificationData) {
          setVerificationData({
            ...verificationData,
            verifiedRepoUrl: repoUrl,
            verified: false,
          });

          // Show warning toast
          toast.error(
            'Repository Not Verified. The GitHub user does not match the owner of this repository.'
          );
        }
      }

      setFormData(prev => ({
        ...prev,
        githubUrl: repoUrl,
        name: result.repo.name || '',
        shortDescription: result.repo.description || '',
        installCommands: installCommands.length > 0 ? installCommands : prev.installCommands,
      }));

      setRepoData(result.repo);
      setShowRepoForm(false);
      setShowMainForm(true);
      setLoading(false);
    } catch (error) {
      console.error('Error selecting repository:', error);
      toast.error('Error selecting repository');
      setLoading(false);
    }
  };

  // Handle checkbox changes for related links
  const handleCheckboxChange = (name: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: isSelected,
    }));
  };

  // Handle related link changes
  const handleRelatedLinkChange = (type: 'npm' | 'demo' | 'video', value: string) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: {
        ...prev.relatedLinks,
        [type]: value,
      },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch categories and tags on component mount
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setLoadingCategories(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData);
          } else if (categoriesData.docs && Array.isArray(categoriesData.docs)) {
            setCategories(categoriesData.docs);
          } else {
            setCategories([]);
          }
        } else {
          setCategories([]);
        }

        // Fetch tags
        const tagsResponse = await fetch('/api/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          if (Array.isArray(tagsData)) {
            setTags(tagsData);
          } else if (tagsData.docs && Array.isArray(tagsData.docs)) {
            setTags(tagsData.docs);
          } else {
            setTags([]);
          }
        } else {
          setTags([]);
        }
      } catch (error) {
        setCategories([]);
        setTags([]);

        toast.error('Error loading categories and tags');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // Check for existing GitHub session on component mount
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        setIsCheckingSession(true);
        // Use the getAuthSession function to get the current session
        const result = await getAuthSession();

        if (result.success && result.session) {
          setAuthSession(result.session);

          // If user is already signed in with GitHub, skip the verification prompt
          if (result.session.user) {
            console.log('User already signed in with GitHub:', result.session.user);

            // Get GitHub username - prefer the username field from enhanced Auth.js
            let githubUsername = result.session.user.username || '';

            // Fallback to extracting from email if username not available
            if (
              !githubUsername &&
              result.session.user.email &&
              result.session.user.email.includes('@users.noreply.github.com')
            ) {
              githubUsername = result.session.user.email.split('@')[0];
            }

            console.log('GitHub username:', githubUsername);
            console.log('GitHub display name:', result.session.user.name);

            setIsGitHubVerified(true);
            setVerificationData({
              userId: result.session.user.id,
              username: githubUsername,
              displayName: result.session.user.name,
              verified: true,
              method: 'owner',
              accessToken: result.session.accessToken || '',
            });

            // Skip verification prompt and go straight to repo selection
            setShowVerificationPrompt(false);
            setShowRepoForm(true);

            // Fetch user's GitHub repositories if they're signed in
            if (result.session.accessToken) {
              fetchUserRepos(
                githubUsername || result.session.user.name || '',
                result.session.accessToken
              );
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuthSession();
  }, []);

  // Replace the RepoSelectionCard component with a more compact version
  const RepoListItem = ({ repo }: { repo: any }) => {
    return (
      <div
        className="hover:border-primary group flex cursor-pointer flex-col rounded border border-foreground/10 p-3 transition-colors"
        onClick={() => handleSelectRepo(repo.htmlUrl)}
      >
        <div className="flex items-center gap-2">
          <Icon icon="mdi:github" className="text-foreground/60" />
          <p className="group-hover:text-primary font-medium transition-colors">{repo.fullName}</p>
        </div>

        {repo.description && (
          <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{repo.description}</p>
        )}

        <p className="mt-1 text-xs text-foreground/60">
          Updated {new Date(repo.updatedAt).toLocaleDateString()}
        </p>
      </div>
    );
  };

  // Function to validate GitHub URL format
  const isValidGithubUrl = (url: string) => {
    return url.trim() !== '' && url.startsWith('https://github.com/') && url.split('/').length >= 5;
  };

  // First fix the isFormValid function
  const isFormValid = () => {
    // Basic required fields
    if (!formData.name || !formData.shortDescription || !formData.category) {
      return false;
    }

    // Check short description length
    if (formData.shortDescription.length > 120) {
      return false;
    }

    return true;
  };

  // Add a useEffect to handle repo fetch state updates
  useEffect(() => {
    if (repoFetchState?.error) {
      console.error('Repository fetch error:', repoFetchState.error);
      toast.error(`Error: ${repoFetchState.error}`);
      setLoading(false);
    } else if (repoFetchState?.success) {
      console.log('Repository fetch successful:', repoFetchState.success);
      toast.success('Repository data fetched successfully');
      setLoading(false);

      // Move to main form
      setShowRepoForm(false);
      setShowMainForm(true);
    }
  }, [repoFetchState]);

  return (
    <div className="space-y-10">
      {/* GitHub Verification Prompt Section */}
      {showVerificationPrompt && (
        <div className="animate-fade-in">
          {isCheckingSession ? (
            <div className="flex flex-col items-center justify-center p-10">
              <Spinner size="md" color="primary" className="mb-4" />
              <p className="text-foreground/70">Checking GitHub authentication status...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">GitHub Verification</h2>
                <p className="text-foreground/70">
                  Start by verifying your GitHub account or skip to enter a repository URL manually
                </p>
              </div>

              <div className="p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="border border-foreground/10 bg-background/50 p-4">
                      <Icon
                        icon="heroicons:check-circle"
                        className="mx-auto mb-2 h-8 w-8 text-green-500"
                      />
                      <h4 className="mb-1 font-medium">Select from Your Repositories</h4>
                      <p className="text-sm text-foreground/70">
                        Easily browse and select from your GitHub repositories
                      </p>
                    </div>
                    <div className="border border-foreground/10 bg-background/50 p-4">
                      <Icon
                        icon="heroicons:check-badge"
                        className="mx-auto mb-2 h-8 w-8 text-blue-500"
                      />
                      <h4 className="mb-1 font-medium">Get a Verified Badge</h4>
                      <p className="text-sm text-foreground/70">
                        Your plugin will display a verified badge to users
                      </p>
                    </div>
                    <div className="border border-foreground/10 bg-background/50 p-4">
                      <Icon
                        icon="heroicons:shield-check"
                        className="mx-auto mb-2 h-8 w-8 text-purple-500"
                      />
                      <h4 className="mb-1 font-medium">Edit Your Plugin Later</h4>
                      <p className="text-sm text-foreground/70">
                        Easily manage and update your plugin in the future
                      </p>
                    </div>
                    <div className="border border-foreground/10 bg-background/50 p-4">
                      <Icon
                        icon="heroicons:user-group"
                        className="mx-auto mb-2 h-8 w-8 text-orange-500"
                      />
                      <h4 className="mb-1 font-medium">Build Community Trust</h4>
                      <p className="text-sm text-foreground/70">
                        Users are more likely to trust verified plugins
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 mt-4 rounded-none border border-blue-500/30 bg-blue-900/20 p-4">
                    <div className="flex items-start">
                      <Icon
                        icon="heroicons:information-circle"
                        className="mr-2 mt-0.5 h-5 w-5 text-blue-400"
                      />
                      <div>
                        <h4 className="mb-1 font-medium">Organization Repositories</h4>
                        <p className="text-sm text-foreground/80">
                          You can verify repositories that you own directly OR repositories owned by
                          organizations where you have admin permissions. Sign in with GitHub to
                          automatically verify your status.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <GitHubVerification
                      githubUrl=""
                      onVerificationChange={handleVerificationChange}
                      formData={{
                        ...formData,
                        repoData: repoData,
                      }}
                      compact={true}
                    />

                    <Button
                      color="default"
                      variant="light"
                      onPress={handleSkipVerification}
                      className="min-w-[150px]"
                      radius="none"
                    >
                      Skip Verification
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Repository Selection/Input Section */}
      {showRepoForm && (
        <div className="animate-fade-in">
          <div className="mb-6 border-b border-foreground/10 pb-4">
            <h2 className="font-medium fl-text-step-1">
              {isGitHubVerified ? 'Select a Repository' : 'GitHub Repository'}
            </h2>
            <p className="text-foreground/70">
              {isGitHubVerified
                ? 'Select one of your repositories or enter a URL manually'
                : 'Enter the GitHub repository URL for your plugin'}
            </p>
          </div>

          {isGitHubVerified && userRepos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md mb-4 font-medium text-foreground">Your repositories</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {userRepos.slice(0, 10).map(repo => (
                  <RepoListItem key={repo.id} repo={repo} />
                ))}
              </div>
              {userRepos.length > 10 && (
                <div className="mt-4 text-center">
                  <Button
                    color="default"
                    variant="flat"
                    className="min-w-[200px]"
                    radius="none"
                    onPress={() =>
                      window.open('https://github.com/settings/repositories', '_blank')
                    }
                  >
                    View all repositories on GitHub
                    <Icon icon="heroicons:arrow-top-right-on-square" className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {isGitHubVerified && userRepos.length === 0 && loading && (
            <div className="mb-8">
              <h3 className="text-md mb-4 font-medium text-foreground">Your repositories</h3>
              <div className="flex flex-col items-center justify-center rounded-lg border border-foreground/10 bg-background/30 p-10">
                <Spinner size="md" color="primary" className="mb-4" />
                <p className="text-foreground/70">Fetching your GitHub repositories...</p>
              </div>
            </div>
          )}

          {isGitHubVerified && userRepos.length === 0 && !loading && (
            <div className="mb-8">
              <h3 className="text-md mb-4 font-medium text-foreground">Your repositories</h3>
              <div className="flex flex-col items-center justify-center rounded-lg border border-foreground/10 bg-background/30 p-10">
                <Icon
                  icon="heroicons:information-circle"
                  className="mb-2 h-8 w-8 text-foreground/40"
                />
                <p className="mb-2 text-foreground/70">No repositories found</p>
                <p className="mb-4 text-center text-sm text-foreground/50">
                  {`We couldn't find any repositories in your GitHub account. You can manually enter a
									repository URL below.`}
                </p>
                <Button
                  color="default"
                  variant="flat"
                  size="sm"
                  onClick={() => window.open('https://github.com/new', '_blank')}
                >
                  Create a repository on GitHub
                  <Icon icon="heroicons:arrow-top-right-on-square" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className={`${isGitHubVerified ? 'mt-6 border-t border-foreground/10 pt-6' : ''}`}>
            <h3
              className={`text-md mb-4 font-medium text-foreground ${
                !isGitHubVerified && 'sr-only'
              }`}
            >
              Or enter a repository URL manually
            </h3>

            <Form
              validationBehavior="aria"
              ref={formRef}
              onSubmit={e => {
                e.preventDefault();

                // Validate GitHub URL
                if (!formData.githubUrl || !formData.githubUrl.startsWith('https://github.com/')) {
                  toast.error('Please enter a valid GitHub repository URL.');
                  return;
                }

                // Create a FormData object from the form
                const formDataObj = new FormData(formRef.current!);

                // Add our GitHub URL
                formDataObj.set('githubUrl', formData.githubUrl);

                // Wrap the action call in startTransition
                toast.info('Fetching repository data...');
                setLoading(true);

                // Then submit the form
                startTransition(() => {
                  console.log('Inside startTransition, calling repoAction');
                  repoAction(formDataObj);
                });
              }}
            >
              <FormInput
                label="GitHub Repository URL"
                name="githubUrl"
                placeholder="https://github.com/username/repo"
                value={formData.githubUrl}
                onChange={handleChange}
                className={`fl-mt-l fl-mb-m fl-py-m ${
                  formData.githubUrl && !isValidGithubUrl(formData.githubUrl)
                    ? 'border-red-500'
                    : ''
                }`}
                icon="mdi:github"
                description={
                  formData.githubUrl && !isValidGithubUrl(formData.githubUrl)
                    ? 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)'
                    : 'Link to the GitHub repository containing your Payload plugin'
                }
                disabled={isPending}
              />

              <div className="flex flex-wrap gap-4">
                <Button
                  color="default"
                  variant="light"
                  onPress={() => {
                    setShowVerificationPrompt(true);
                    setShowRepoForm(false);
                  }}
                  className="min-w-[100px]"
                  radius="none"
                >
                  Back
                </Button>
                <SubmitButton
                  variant="plugin"
                  disabled={isPending || !isValidGithubUrl(formData.githubUrl)}
                >
                  Continue
                </SubmitButton>
              </div>

              {repoFetchState?.error && (
                <p className="text-red-400 fl-text-step--1 fl-mt-s">{repoFetchState.error}</p>
              )}
            </Form>
          </div>
        </div>
      )}

      {/* Main Form Section */}
      {showMainForm && (
        <div className="animate-fade-in">
          <form
            ref={formRef}
            onSubmit={e => {
              e.preventDefault();
              console.log('Form submission started');

              try {
                // Validate images first
                if (formData.images.length > 0) {
                  // Validate total image count
                  if (formData.images.length > 4) {
                    toast.error('Maximum of 4 images allowed.');
                    return;
                  }
                }

                // Create a FormData object from the form
                const formDataObj = new FormData(formRef.current!);

                // Add our form state data as a JSON string
                const formDataJson = {
                  ...formData,
                  // Don't include images in JSON, they'll be appended separately
                  images: undefined,
                };
                console.log('Form data to submit:', formDataJson);
                formDataObj.set('formData', JSON.stringify(formDataJson));

                // Add verification data
                console.log('Verification data:', verificationData);
                formDataObj.set('verificationData', JSON.stringify(verificationData || {}));

                // Remove any existing image files
                formDataObj.delete('imageFiles');

                // Add each image file to the FormData
                formData.images.forEach((file, index) => {
                  // Log image details
                  console.log(
                    `Adding image to form: ${file.name}, ${file.type}, ${file.size} bytes`
                  );
                  formDataObj.append('imageFiles', file);
                });

                // Show loading toast for image uploads
                if (formData.images.length > 0) {
                  toast.success(
                    `Uploading ${formData.images.length} image${
                      formData.images.length !== 1 ? 's' : ''
                    }...`
                  );
                }

                console.log('Starting form submission...');
                // Wrap the action call in startTransition
                toast.info('Submitting plugin...');
                setLoading(true);

                // Then submit the form
                startTransition(() => {
                  console.log('Inside startTransition, calling submitAction');
                  submitAction(formDataObj);
                });
              } catch (error) {
                console.error('Error preparing form submission:', error);
                toast.error(
                  `Error preparing submission: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
              }
            }}
          >
            {/* Repository Info */}
            {repoData && (
              <div className="mb-10">
                <div className="mb-6 border-b border-foreground/10 pb-4">
                  <h2 className="font-medium fl-text-step-1">Repository Information</h2>
                  <p className="text-foreground/70">Details fetched from GitHub</p>
                </div>
                {/* Display verification status */}
                <div className="mb-6">
                  {isGitHubVerified && verificationData?.verifiedRepoUrl === formData.githubUrl ? (
                    <div className="flex items-center gap-3 rounded-none border border-green-500/30 bg-green-900/20 p-3">
                      <Icon icon="heroicons:check-circle" className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Verified Repository</p>
                        <p className="text-xs text-foreground/70">
                          {verificationData?.method === 'organization_admin'
                            ? `This repository is verified through your organization admin access.`
                            : verificationData?.method === 'organization_pending'
                              ? `Organization repository - admin status will be verified during submission.`
                              : `This repository is verified as owned by ${verificationData?.username || verificationData?.githubUsername || 'you'}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-none border border-amber-500/30 bg-amber-900/20 p-3">
                      <Icon
                        icon="heroicons:exclamation-triangle"
                        className="h-5 w-5 text-amber-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Unverified Repository</p>
                        <p className="text-xs text-foreground/70">
                          {isGitHubVerified
                            ? 'This repository is not owned by your GitHub account. To get a verified badge, verify a repository owned by you.'
                            : "This repository is not verified. You can still submit the plugin, but it won't display a verified badge."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <GitHubRepoCard repo={repoData} />
              </div>
            )}

            {/* Plugin Info Section */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Plugin Information</h2>
                <p className="text-foreground/70">Basic details about your plugin</p>
              </div>

              <div className="space-y-6 fl-py-s">
                <FormInput
                  label="Plugin Name"
                  name="name"
                  placeholder="My Awesome Plugin"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isPending}
                  required
                  className="[&_label]:after:ml-1 [&_label]:after:text-red-500 [&_label]:after:content-['*']"
                />

                <div className="space-y-1 fl-mt-m fl-py-s">
                  <FormInput
                    label="Short Description (One Sentence)"
                    name="shortDescription"
                    placeholder="A brief description of your plugin in one sentence"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    disabled={isPending}
                    maxLength={120}
                    required
                    className={`[&_label]:after:ml-1 [&_label]:after:text-red-500 [&_label]:after:content-['*'] ${
                      formData.shortDescription.length > 120 ? 'border-red-500' : ''
                    }`}
                    description="Brief explanation of your plugin (used in listings and search results)"
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      {formData.shortDescription.length > 120 && (
                        <p className="text-xs text-red-500">
                          Short description must be 120 characters or less
                        </p>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs ${
                          formData.shortDescription.length > 120
                            ? 'font-bold text-red-500'
                            : formData.shortDescription.length > 100
                              ? 'text-amber-500'
                              : 'text-foreground/60'
                        }`}
                      >
                        {formData.shortDescription.length}/120 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* GitHub Description Note */}
                <div className="mb-6 border-l-4 border-blue-500 bg-blue-500/10 p-4 text-blue-200">
                  <div className="flex items-start">
                    <Icon icon="heroicons:information-circle" className="mr-2 mt-0.5 h-5 w-5" />
                    <div>
                      <h4 className="mb-1 font-medium">About Plugin Description</h4>
                      <p className="text-sm text-blue-200/80">
                        The plugin&apos;s long description will be automatically generated from your
                        GitHub repository README. Make sure your README clearly explains what your
                        plugin does, how to use it, and any other relevant information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories and Tags Section */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Categories & Tags</h2>
                <p className="text-foreground/70">Categorize your plugin to help users find it</p>
              </div>

              {loadingCategories ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Spinner size="md" color="primary" />
                  <p className="mt-2 text-sm text-foreground/70">Loading categories and tags...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      placeholder="Select a category"
                      className="w-full bg-background text-foreground"
                      isRequired
                      selectedKeys={formData.category ? [formData.category] : []}
                      onSelectionChange={keys => {
                        // The keys object is a Set, convert it to an array and get the first item
                        const selectedKey = Array.from(keys)[0]?.toString() || '';
                        setFormData(prev => ({ ...prev, category: selectedKey }));
                      }}
                      isDisabled={isPending}
                      variant="bordered"
                      radius="none"
                      classNames={{
                        popoverContent:
                          'bg-background/95 backdrop-blur-md border border-foreground/20',
                        listbox: 'p-0 text-foreground bg-background/0',
                        base: 'text-foreground',
                        trigger: 'data-[open=true]:border-primary',
                      }}
                    >
                      {categories?.map(category => (
                        <SelectItem
                          key={category.id}
                          className="data-[selected=true]:bg-primary/20 text-foreground data-[hover=true]:bg-foreground/10"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <p className="mt-1 text-xs text-foreground/60">
                      Choose the primary category that best matches your plugin
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Tags (Optional)</label>
                    <div className="mb-4">
                      <Select
                        placeholder="Select up to 6 tags"
                        selectionMode="multiple"
                        selectedKeys={new Set(formData.tags)}
                        className="w-full"
                        variant="bordered"
                        radius="none"
                        isDisabled={isPending || formData.tags.length >= 6}
                        onSelectionChange={keys => {
                          if (!keys) return;

                          // Convert to array of strings
                          const selectedTags = Array.from(keys).map(String);

                          // Enforce max 6 tags
                          if (selectedTags.length > 6) {
                            toast.error('You can select a maximum of 6 tags');
                            return;
                          }

                          // Update tags in form data
                          setFormData(prev => ({
                            ...prev,
                            tags: selectedTags,
                          }));
                        }}
                        classNames={{
                          base: 'text-foreground',
                          trigger:
                            'bg-background border-foreground/20 data-[open=true]:border-primary text-foreground',
                          listbox: 'bg-background/95 backdrop-blur-md text-foreground',
                          popoverContent:
                            'bg-background/95 backdrop-blur-md border border-foreground/20',
                        }}
                      >
                        {tags && tags.length > 0 ? (
                          tags.map(tag => (
                            <SelectItem
                              key={tag.id}
                              textValue={tag.name}
                              className="data-[selected=true]:bg-primary/20 text-foreground data-[hover=true]:bg-foreground/10"
                              startContent={
                                <div
                                  className={`mr-2 h-2 w-2 rounded-full bg-${
                                    tag.color || 'gray'
                                  }-400`}
                                />
                              }
                            >
                              {tag.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem key="no-tags" isDisabled className="text-foreground/50">
                            No tags available
                          </SelectItem>
                        )}
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-foreground/60">
                        Select up to 6 tags that describe your plugin
                      </p>
                      {formData.tags.length > 0 && (
                        <p className="text-primary text-xs">
                          {formData.tags.length}/6 tags selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Installation Commands Section */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Installation Commands</h2>
                <p className="text-foreground/70">
                  Provide commands for different package managers to install your plugin
                </p>
              </div>

              <div className="space-y-6">
                <p className="mb-3 text-sm text-foreground/80">
                  Help users install your plugin by providing installation commands for different
                  package managers. At least one package manager is required.
                </p>

                <MultiPackageManagerInput
                  commands={formData.installCommands}
                  onChange={commands => {
                    setFormData(prev => ({
                      ...prev,
                      installCommands: commands,
                    }));
                  }}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Related Links Section */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Related Links</h2>
                <p className="text-foreground/70">
                  Add optional links to help users learn more about your plugin
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-36">
                    <Checkbox
                      isSelected={formData.isNpmLinkEnabled}
                      onValueChange={isSelected =>
                        handleCheckboxChange('isNpmLinkEnabled', isSelected)
                      }
                    >
                      <span className="fl-text-step--1">NPM Package</span>
                    </Checkbox>
                  </div>
                  {formData.isNpmLinkEnabled && (
                    <Input
                      placeholder="https://www.npmjs.com/package/your-plugin"
                      value={formData.relatedLinks.npm}
                      variant="bordered"
                      onChange={e => handleRelatedLinkChange('npm', e.target.value)}
                      startContent={<Icon icon="simple-icons:npm" className="text-red-600" />}
                      size="sm"
                      radius="none"
                      className="w-full flex-1"
                    />
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-36">
                    <Checkbox
                      isSelected={formData.isDemoLinkEnabled}
                      onValueChange={isSelected =>
                        handleCheckboxChange('isDemoLinkEnabled', isSelected)
                      }
                    >
                      <span className="fl-text-step--1">Demo</span>
                    </Checkbox>
                  </div>
                  {formData.isDemoLinkEnabled && (
                    <Input
                      placeholder="https://demo-site.com"
                      value={formData.relatedLinks.demo}
                      onChange={e => handleRelatedLinkChange('demo', e.target.value)}
                      startContent={<Icon icon="heroicons:globe-alt" className="text-blue-400" />}
                      variant="bordered"
                      size="sm"
                      radius="none"
                      className="w-full flex-1"
                    />
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-36">
                    <Checkbox
                      isSelected={formData.isVideoLinkEnabled}
                      onValueChange={isSelected =>
                        handleCheckboxChange('isVideoLinkEnabled', isSelected)
                      }
                    >
                      <span className="fl-text-step--1">Video Tutorial</span>
                    </Checkbox>
                  </div>
                  {formData.isVideoLinkEnabled && (
                    <Input
                      placeholder="https://youtube.com/watch?v=your-video-id"
                      value={formData.relatedLinks.video}
                      onChange={e => handleRelatedLinkChange('video', e.target.value)}
                      startContent={<Icon icon="heroicons:play" className="text-red-400" />}
                      variant="bordered"
                      size="sm"
                      radius="none"
                      className="w-full flex-1"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Screenshots Section */}
            <div className="mb-10">
              <div className="mb-6 border-b border-foreground/10 pb-4">
                <h2 className="font-medium fl-text-step-1">Screenshots</h2>
                <p className="text-foreground/70">Upload images to showcase your plugin</p>
              </div>

              <div className="space-y-6">
                <ImageUploader
                  images={formData.images}
                  onImagesChange={images => setFormData(prev => ({ ...prev, images }))}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="mt-10 border-t border-foreground/10 pt-6">
              <input
                type="hidden"
                name="formData"
                value={JSON.stringify({
                  ...formData,
                  // Don't include images in JSON, they'll be appended separately
                  images: undefined,
                })}
              />
              <input
                type="hidden"
                name="verificationData"
                value={JSON.stringify(verificationData)}
              />

              {/* For the form action, we need to add actual file inputs
							    but we can't add them as hidden inputs since file inputs
							    can't be set programmatically for security reasons.
							    Instead, we'll need to handle files separately in the server action */}

              <div className="flex flex-wrap gap-4">
                <Button
                  color="default"
                  variant="light"
                  onClick={() => {
                    setShowMainForm(false);
                    setShowRepoForm(true);
                  }}
                  className="min-w-[100px]"
                  radius="none"
                  type="button"
                >
                  Back
                </Button>
                <SubmitButton variant="plugin" disabled={isPending || !isFormValid()}>
                  {isPending ? 'Submitting...' : 'Submit Plugin'}
                </SubmitButton>
              </div>

              {submitState?.error && (
                <p className="text-red-400 fl-text-step--1 fl-mt-s">{submitState.error}</p>
              )}
            </div>
          </form>
        </div>
      )}

      {showSubmissionSuccess && (
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

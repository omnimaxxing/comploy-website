'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import payload from 'payload';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth } from '@/auth';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Schema for GitHub URL validation
const githubUrlSchema = z
  .string()
  .url()
  .startsWith('https://github.com/')
  .refine(url => {
    // Must have at least 2 path segments after github.com
    const segments = url.split('/').filter(Boolean);
    return segments.length >= 4; // "https:", "", "github.com", "{owner}", "{repo}"
  }, 'Invalid GitHub repository URL');

// Extract owner and repo from GitHub URL
function extractOwnerAndRepo(url: string): { owner: string; repo: string } {
  const segments = url.split('/').filter(Boolean);
  return {
    owner: segments[2], // Owner is the 3rd segment (0-indexed)
    repo: segments[3], // Repo is the 4th segment (0-indexed)
  };
}

// Define return type interfaces
interface GitHubRepoSuccess {
  success: true;
  repo: {
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    owner: {
      login: string;
      avatarUrl: string;
      type?: string;
    };
    defaultBranch: string;
    license: string | null;
    homepage: string | null;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    topics: string[];
  };
  readme: string;
  contributors: {
    login: string;
    avatarUrl: string;
    contributions: number;
  }[];
}

interface GitHubRepoError {
  success: false;
  error: string;
}

type GitHubRepoResult = GitHubRepoSuccess | GitHubRepoError;

// Function to fetch GitHub repository data
export async function fetchGitHubRepo(githubUrl: string): Promise<GitHubRepoResult> {
  try {
    // Validate GitHub URL
    const validatedUrl = githubUrlSchema.parse(githubUrl);

    // Extract owner and repo
    const { owner, repo } = extractOwnerAndRepo(validatedUrl);

    // GitHub API endpoint
    const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // Fetch repository data
    const response = await fetch(repoApiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Add GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
      cache: 'no-store', // Disable caching completely to always get fresh data
    });

    if (!response.ok) {
      console.error(`[GitHub Fetch] API Error: ${response.status} - ${await response.text()}`);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repoData = await response.json();

    // Fetch README content
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
      cache: 'no-store', // Disable caching
    });

    let readmeContent = '';

    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      // README content is base64 encoded
      readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    }

    // Get repository contributors
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        cache: 'no-store', // Disable caching
      }
    );

    let contributors = [];

    if (contributorsResponse.ok) {
      contributors = await contributorsResponse.json();
    }

    // Return combined data
    const result: GitHubRepoSuccess = {
      success: true,
      repo: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        owner: {
          login: repoData.owner.login,
          avatarUrl: repoData.owner.avatarUrl,
          type: repoData.owner.type,
        },
        defaultBranch: repoData.default_branch,
        license: repoData.license?.name || null,
        homepage: repoData.homepage,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        topics: repoData.topics || [],
      },
      readme: readmeContent,
      contributors: contributors.map((contributor: any) => ({
        login: contributor.login,
        avatarUrl: contributor.avatarUrl,
        contributions: contributor.contributions,
      })),
    };

    return result;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    const errorResult: GitHubRepoError = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching GitHub data',
    };
    return errorResult;
  }
}

// Function to generate description using GROQ API
export async function generateDescriptionWithGroq(readmeContent: any) {
  try {
    // Check if GROQ API key is set
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ API key is not configured');
      throw new Error('API key not configured');
    }

    // Get identifier for rate limiting
    const identifier = await getAIGenerationIdentifier();

    // Rate limit: 5 generations per hour per user/IP
    const rateLimitKey = `ai-generation-rate-limit:${identifier}`;
    const rateLimitCount = await redis.get(rateLimitKey);

    if (rateLimitCount && Number(rateLimitCount) >= 5) {
      console.log('AI generation rate limit exceeded for', identifier);
      throw new Error(
        'You have reached the limit for AI-generated descriptions. Please try again later.'
      );
    }

    // Increment rate limit counter
    await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 3600); // 1 hour expiry

    // Ensure readme content is a string
    const readmeString =
      typeof readmeContent === 'string'
        ? readmeContent
        : readmeContent?.description || readmeContent?.readme || JSON.stringify(readmeContent);

    // Check if readme is empty
    if (!readmeString || readmeString.trim().length === 0) {
      console.error('README content is empty');
      throw new Error('Cannot generate description from empty README');
    }

    // Truncate readme if too long (GROQ has token limits)
    const truncatedReadme =
      readmeString.length > 8000 ? readmeString.substring(0, 8000) + '...' : readmeString;

    // GROQ API endpoint - you'll need to replace with your actual endpoint
    const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    console.log(`Sending request to GROQ API with ${truncatedReadme.length} characters`);

    // Generate the full description
    const requestBody = {
      model: 'llama3-70b-8192', // Updated model - was "mixtral-8x7b-32768"
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates concise, informative descriptions of software plugins based on README files. You will provide TWO separate descriptions:\n\n1. A SHORT DESCRIPTION: A single sentence STRICTLY LIMITED TO 120 CHARACTERS MAXIMUM (including spaces and punctuation) that clearly explains what the plugin does. Do not exceed this limit.\n\n2. A FULL DESCRIPTION: 2-3 clearly separated paragraphs (5-8 sentences total) in a professional tone explaining what the plugin does, its key features, and benefits. Each paragraph should be separated by a blank line.\n\nFormat your response as:\nSHORT DESCRIPTION: [your one sentence here]\n\nFULL DESCRIPTION:\n[your paragraphs with proper line breaks between them]',
        },
        {
          role: 'user',
          content: `Based on the following README for a Payload CMS plugin, write both a short one-sentence description and a full description explaining what it does, its main features, and benefits:\n\n${truncatedReadme}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 600,
    };

    try {
      const response = await fetch(groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GROQ API error: ${response.status} - ${errorText}`);
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content || '';

      // Parse the response to extract short and full descriptions
      let shortDescription = '';
      let fullDescription = '';

      const shortMatch = generatedContent.match(/SHORT DESCRIPTION: (.*?)(?:\n|$)/i);
      if (shortMatch && shortMatch[1]) {
        shortDescription = shortMatch[1].trim();
        // Ensure short description is under 120 characters
        if (shortDescription.length > 120) {
          shortDescription = shortDescription.substring(0, 117) + '...';
        }
      }

      const fullMatch = generatedContent.match(/FULL DESCRIPTION:\n([\s\S]*?)(?:$)/i);
      if (fullMatch && fullMatch[1]) {
        fullDescription = fullMatch[1].trim();
      }

      // If parsing failed, use a fallback method
      if (!shortDescription) {
        const firstSentence = generatedContent.split(/[.!?][\s\n]+/)[0] + '.';
        shortDescription =
          firstSentence.length > 120 ? firstSentence.substring(0, 117) + '...' : firstSentence;
      }

      if (!fullDescription) {
        fullDescription = generatedContent;
      }

      return {
        success: true,
        description: fullDescription,
        shortDescription: shortDescription,
      };
    } catch (error) {
      console.error('Error calling GROQ API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating description with GROQ:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating description',
    };
  }
}

// Helper function to get a unique identifier for AI generation rate limiting
async function getAIGenerationIdentifier() {
  try {
    // Try to get the user session first
    const session = await auth();
    if (session?.user?.email) {
      return `user:${session.user.email}`;
    }

    // Fall back to IP-based identification
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return `ip:${data.ip}`;
  } catch (error) {
    console.error('Error getting identifier for rate limiting:', error);
    // Return a timestamp as last resort
    return `fallback:${Date.now()}`;
  }
}

// Function to convert Markdown to Lexical rich text format
export async function convertMarkdownToLexical(markdown: string) {
  try {
    // Initialize Payload to get the config
    const payload = await getPayload({ config: configPromise });

    if (!payload) {
      throw new Error('Failed to initialize Payload CMS');
    }

    // Import the converter and other required modules from the richtext-lexical package
    const { convertMarkdownToLexical, editorConfigFactory } = await import(
      '@payloadcms/richtext-lexical'
    );

    // Get the editor config
    const config = await configPromise;
    const editorConfig = await editorConfigFactory.default({
      config,
    });

    // First perform basic preprocessing of GitHub markdown for better conversion
    const preprocessedMarkdown = preprocessGitHubMarkdown(markdown);

    // Convert the preprocessed markdown to lexical format
    const lexicalJSON = await convertMarkdownToLexical({
      editorConfig,
      markdown: preprocessedMarkdown,
    });

    return {
      success: true,
      data: lexicalJSON,
    };
  } catch (error) {
    console.error('Error converting markdown to lexical format:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error converting markdown',
    };
  }
}

// Function to preprocess GitHub markdown to better handle specific patterns
function preprocessGitHubMarkdown(markdown: string): string {
  // Make sure code blocks have proper line breaks for better parsing
  markdown = markdown.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, language, code) => {
    return `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`;
  });

  // Improve handling of blockquotes (common in GitHub READMEs)
  markdown = markdown.replace(/^>\s*(.+)$/gm, (match, content) => {
    return `> ${content}\n`;
  });

  // Clean up HTML that might appear in GitHub READMEs
  markdown = markdown.replace(/<p align="center">([\s\S]*?)<\/p>/g, (match, content) => {
    return content;
  });

  // Ensure proper list item spacing
  markdown = markdown.replace(/^-\s+(.+)$/gm, (match, content) => {
    return `- ${content}\n`;
  });

  // Fix table formatting if present
  markdown = markdown.replace(/\|(.+)\|/g, match => {
    return `${match}\n`;
  });

  return markdown;
}

// Function to extract install command from readme
export async function extractInstallCommand(readme: string) {
  // Common patterns for install commands
  const patterns = [
    /npm install (\S+)/i,
    /pnpm install (\S+)/i,
    /yarn add (\S+)/i,
    /bun add (\S+)/i,
    /install.*?`npm install (\S+)`/i,
    /install.*?`pnpm install (\S+)`/i,
    /install.*?`yarn add (\S+)`/i,
    /install.*?`bun add (\S+)`/i,
  ];

  // Detected commands for different package managers
  const detectedCommands: {
    packageManager: string;
    command: string;
  }[] = [];

  // Package manager prefixes
  const prefixes = {
    npm: 'npm install',
    pnpm: 'pnpm add',
    yarn: 'yarn add',
    bun: 'bun add',
  };

  // Check for each pattern
  for (const pattern of patterns) {
    const match = readme.match(pattern);
    if (match && match[1]) {
      // Determine package manager from the pattern
      let packageManager = 'npm';
      if (pattern.toString().includes('pnpm')) {
        packageManager = 'pnpm';
      } else if (pattern.toString().includes('yarn')) {
        packageManager = 'yarn';
      } else if (pattern.toString().includes('bun')) {
        packageManager = 'bun';
      }

      // Create the full command with prefix
      const prefix = prefixes[packageManager as keyof typeof prefixes];
      const packageName = match[1];
      const fullCommand = `${prefix} ${packageName}`;

      // Store the command
      detectedCommands.push({
        packageManager,
        command: fullCommand,
      });
    }
  }

  // If we found commands, use the first one as the main installCommand
  if (detectedCommands.length > 0) {
    // Use the first detected command as the main one
    return {
      found: true,
      packageName: detectedCommands[0].command.split(' ').pop() || '',
      installCommands: detectedCommands,
    };
  }

  // No matches found
  return {
    found: false,
    packageName: null,
    installCommands: [],
  };
}

// Function to verify GitHub repository ownership
export async function verifyGitHubOwnership(githubUrl: string) {
  try {
    // Validate GitHub URL
    const validatedUrl = githubUrlSchema.parse(githubUrl);

    // Redirect to GitHub OAuth flow
    return {
      success: true,
      redirectUrl: `/api/auth/github?repo_url=${encodeURIComponent(validatedUrl)}`,
    };
  } catch (error) {
    console.error('Error starting GitHub verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error starting GitHub verification',
    };
  }
}

// Define an extended type for server-side file handling
type ServerFile = {
  data: Buffer;
  mimetype: string;
  name: string;
  size: number;
};

// Shared utility to upload images to Payload media collection
async function uploadImage(
  image: File | Blob,
  altText: string,
  payloadInstance: any
): Promise<string | null> {
  try {
    if (!image) return null;

    // Extract image file details
    const fileName = 'name' in image ? image.name : 'uploaded-image.jpg';
    const fileType = 'type' in image ? image.type : 'image/jpeg';
    const fileSize = 'size' in image ? image.size : 0;

    // Get image data as buffer
    let buffer;

    if ('arrayBuffer' in image) {
      // Modern File or Blob object with arrayBuffer method
      const imageBytes = await image.arrayBuffer();
      buffer = Buffer.from(imageBytes);
    } else {
      console.error('[Image Upload] Invalid image object');
      throw new Error('Image upload failed: invalid file object');
    }

    // Create media document
    const uploadedMedia = await payloadInstance.create({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: buffer,
        mimetype: fileType,
        name: fileName,
        size: fileSize,
      },
    });

    if (uploadedMedia && uploadedMedia.id) {
      return uploadedMedia.id.toString();
    }

    return null;
  } catch (error) {
    console.error('[Image Upload] Error:', error);
    return null;
  }
}

// Function to submit the plugin to Payload CMS
export async function submitPlugin(formData: {
  name: string;
  shortDescription: string;
  description?: string; // Now optional since we'll use the README
  githubUrl: string;
  category?: string;
  tags?: string[];
  installCommand?: string;
  installCommands?: Array<{
    packageManager: string;
    customLabel?: string;
    command: string;
  }>;
  relatedLinks: {
    github: string;
    npm?: string;
    demo?: string;
    video?: string;
  };
  verification?: {
    verified: boolean;
    method?: string;
    userId?: string;
    username?: string;
    accessToken?: string;
  };
  images?: File[];
  mainImageIndex?: number;
}) {
  console.log('Plugin submission started');

  const payload = await getPayload({ config: configPromise });

  if (!payload) {
    return {
      success: false,
      error: 'Failed to initialize Payload CMS',
    };
  }

  try {
    // Log basic form data for debugging
    console.log(`Submitting plugin: ${formData.name}`);
    console.log(`GitHub URL: ${formData.githubUrl}`);
    console.log(`Has images: ${formData.images ? formData.images.length : 0}`);
    console.log(`Main image index: ${formData.mainImageIndex}`);

    // Fetch GitHub data first including README
    const githubData = await fetchGitHubRepo(formData.githubUrl);

    if (!githubData.success) {
      console.error('Failed to fetch GitHub data:', githubData.error);
      // Continue without GitHub data, but we need the README for the description
      if (!formData.description) {
        return {
          success: false,
          error:
            'Failed to fetch GitHub README, and no description was provided. Please try again or provide a manual description.',
        };
      }
    }

    // Convert README markdown to Lexical format
    let fullDescription;
    if (githubData.success && githubData.readme) {
      console.log('Converting README to Lexical format');
      const conversionResult = await convertMarkdownToLexical(githubData.readme);

      if (conversionResult.success) {
        fullDescription = conversionResult.data;
        console.log('README successfully converted to Lexical format');
      } else {
        console.error('Failed to convert README to Lexical format:', conversionResult.error);
        // If we have a manual description as fallback, use that
        if (formData.description) {
          console.log('Using provided description as fallback');
          fullDescription = createRichTextFromDescription(formData.description);
        } else {
          return {
            success: false,
            error:
              'Failed to process the GitHub README. Please try again or provide a manual description.',
          };
        }
      }
    } else if (formData.description) {
      // Fallback to manual description if provided
      console.log('No README available, using provided description');
      fullDescription = createRichTextFromDescription(formData.description);
    } else {
      // No README and no manual description
      return {
        success: false,
        error:
          'No README found in the GitHub repository, and no description was provided. Please provide a description or ensure your repository has a README file.',
      };
    }

    // Process the full description to handle paragraph breaks
    function createRichTextFromDescription(description: string) {
      // Split the description into paragraphs based on double newlines
      const paragraphs = description.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      // Create a rich text node for each paragraph
      const children = paragraphs.map(paragraph => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph.trim(),
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      }));

      return {
        root: {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      };
    }

    // Prepare payload data object
    const payloadData: any = {
      name: formData.name,
      shortDescription: formData.shortDescription,
      // Use the converted README or fallback to manual description
      fullDescription,
      _status: 'published',
      githubUrl: formData.githubUrl,
      installCommand: formData.installCommand,
      relatedLinks: {
        npmUrl: formData.relatedLinks.npm,
        demoUrl: formData.relatedLinks.demo,
        videoUrl: formData.relatedLinks.video,
      },
      // Add GitHub data if available
      githubData:
        githubData.success && githubData.repo
          ? {
              stars: githubData.repo.stars,
              forks: githubData.repo.forks,
              owner: {
                login: githubData.repo.owner.login,
                avatarUrl: githubData.repo.owner.avatarUrl,
              },
              lastCommit: githubData.repo.pushedAt,
              license: githubData.repo.license,
            }
          : undefined,
    };

    // Add category if provided
    if (formData.category) {
      payloadData.category = formData.category;
    }

    // Add tags if provided
    if (formData.tags && formData.tags.length > 0) {
      // Use tags directly without mapping to objects with id property
      payloadData.tags = formData.tags;
    }

    // Add installCommands if provided
    if (formData.installCommands && formData.installCommands.length > 0) {
      payloadData.installCommands = formData.installCommands;
    }

    // Add verification data if provided
    if (formData.verification && formData.verification.verified) {
      console.log('Processing verification data:', formData.verification);

      // Extract owner and repo from GitHub URL
      const { owner, repo } = extractOwnerAndRepo(formData.githubUrl);
      console.log('Repository owner/repo from URL:', owner, '/', repo);
      console.log('Verification user ID:', formData.verification.userId);
      console.log('Verification username:', formData.verification.username);

      // Verify repository access one final time
      try {
        console.log('Verifying repository access with token');
        const repoAccessResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: {
            Authorization: `Bearer ${formData.verification.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!repoAccessResponse.ok) {
          console.log(
            'Repository access verification failed with status:',
            repoAccessResponse.status
          );
          // Don't block submission, just skip verification
          console.log('Skipping verification for this submission');
        } else {
          const repoData = await repoAccessResponse.json();

          console.log('Repository owner login:', repoData.owner.login);
          console.log('Repository owner ID:', repoData.owner.id);
          console.log('User ID from verification:', formData.verification.userId);
          console.log('Username from verification:', formData.verification.username);

          // Check if the user is the owner - use string comparison for both values
          // GitHub API returns numeric IDs but Auth.js might store them as strings
          // Also check by username (case-insensitive)
          const isOwnerById =
            repoData.owner.id.toString() === formData.verification.userId?.toString();
          const isOwnerByName =
            repoData.owner.login.toLowerCase() === formData.verification.username?.toLowerCase();

          console.log('Is owner by ID match?', isOwnerById);
          console.log('Is owner by username match?', isOwnerByName);

          // If not direct owner, check if user has admin permissions on the repo (for org repos)
          let isOrgAdmin = false;
          if (!isOwnerById && !isOwnerByName) {
            console.log('Not direct owner, checking if user has admin permissions (for org repos)');

            // Make additional API call to check user's permissions on this repository
            const permissionsResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/collaborators/${formData.verification.username}/permission`,
              {
                headers: {
                  Authorization: `Bearer ${formData.verification.accessToken}`,
                  Accept: 'application/vnd.github.v3+json',
                },
              }
            );

            if (permissionsResponse.ok) {
              const permissionsData = await permissionsResponse.json();
              console.log('User permission level on repo:', permissionsData.permission);

              // Consider 'admin' permission level as verified
              isOrgAdmin = permissionsData.permission === 'admin';
              console.log('Is org admin with permission?', isOrgAdmin);
            } else {
              console.log('Failed to check permissions:', permissionsResponse.status);
            }
          }

          if (isOwnerById || isOwnerByName || isOrgAdmin) {
            // Prepare verification data for Payload CMS
            payloadData.verification = {
              isVerified: true,
              verifiedBy: formData.verification.username || 'GitHub User',
              verifiedAt: new Date().toISOString(),
              githubVerification: {
                userId: formData.verification.userId || '',
                username: formData.verification.username || '',
                method: isOrgAdmin ? 'organization_admin' : 'owner',
              },
            };

            console.log('Set verification in payload data:', payloadData.verification);
          } else {
            console.log('User is not the repository owner or org admin, skipping verification');
            console.log('Owner login:', repoData.owner.login);
            console.log('User username:', formData.verification.username);
          }
        }
      } catch (error) {
        console.error('Error verifying repository access:', error);
        // Don't block submission on verification error
        console.log('Skipping verification due to error');
      }
    } else {
      console.log('No verification data provided or verified flag not set:', formData.verification);
    }

    // Process images if they exist
    if (formData.images && formData.images.length > 0) {
      try {
        console.log(`Processing ${formData.images.length} images for plugin: ${formData.name}`);

        // Upload images one by one
        const uploadedImageIds: number[] = [];
        let mainImageId: number | null = null;

        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          const isMainImage = formData.mainImageIndex === i;

          try {
            // Convert image to buffer
            const buffer = await image.arrayBuffer();

            // Upload to media collection using the standard Payload approach
            const uploadResult = await payload.create({
              collection: 'media',
              data: {
                alt: `${formData.name} screenshot ${i + 1}`,
              },
              file: {
                data: Buffer.from(buffer),
                mimetype: image.type,
                name: image.name,
                size: image.size,
              },
            });

            console.log(`Uploaded image ${i + 1}:`, uploadResult.id);

            // Store the ID as a number - don't convert to string
            const imageId = uploadResult.id as number;
            uploadedImageIds.push(imageId);

            // Set as main image if applicable
            if (isMainImage) {
              mainImageId = imageId;
            }
          } catch (err) {
            console.error(`Error uploading image ${i + 1}:`, err);
          }
        }

        // If we have images but no main image was specified, use the first one
        if (uploadedImageIds.length > 0 && !mainImageId) {
          mainImageId = uploadedImageIds[0];
        }

        // Add images to plugin data
        if (uploadedImageIds.length > 0) {
          console.log('Setting image gallery with IDs:', uploadedImageIds);
          payloadData.imagesGallery = uploadedImageIds;
        }

        if (mainImageId) {
          console.log('Setting main image with ID:', mainImageId);
          payloadData.mainImage = mainImageId;
        }
      } catch (error) {
        console.error('Error processing images:', error);
        // Continue with plugin creation even if image upload fails
      }
    } else {
      // No images provided, make sure these fields are explicitly undefined
      console.log('No images provided');
      delete payloadData.imagesGallery;
      delete payloadData.mainImage;
    }

    // Create the plugin in Payload
    console.log('Creating plugin in Payload CMS with data:', {
      name: payloadData.name,
      shortDescription: payloadData.shortDescription,
      hasImages: payloadData.imagesGallery && payloadData.imagesGallery.length > 0,
      hasMainImage: payloadData.mainImage ? 'Yes' : 'No',
      imageCount: payloadData.imagesGallery ? payloadData.imagesGallery.length : 0,
    });

    const plugin = await payload.create({
      collection: 'plugins',
      data: payloadData,
    });

    // Log the created plugin to see if images were attached
    console.log(`Successfully created plugin with ID: ${plugin.id}`);

    // Use type assertion to access potentially undefined properties
    const pluginData = plugin as any;
    // Check and log images gallery
    console.log(
      'Plugin has images gallery:',
      pluginData.imagesGallery
        ? Array.isArray(pluginData.imagesGallery)
          ? pluginData.imagesGallery.length
          : 'Not an array'
        : 'None'
    );
    if (pluginData.imagesGallery) {
      console.log('Image gallery in created plugin:', JSON.stringify(pluginData.imagesGallery));
    }
    // Check and log main image
    if (pluginData.mainImage) {
      console.log('Main image in created plugin:', JSON.stringify(pluginData.mainImage));
    }

    // Revalidate paths
    revalidatePath('/plugins');

    return {
      success: true,
      plugin,
    };
  } catch (error) {
    console.error('Error submitting plugin:', error);

    // Provide more detailed error information
    let errorMessage = 'Unknown error submitting plugin';

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }

    // Check for specific error types
    if (errorMessage.includes('media')) {
      errorMessage = 'Error uploading images: ' + errorMessage;
    } else if (errorMessage.includes('GitHub')) {
      errorMessage = 'Error with GitHub repository: ' + errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Function to get all available tags
export async function getTags() {
  try {
    // Initialize Payload
    const payload = await getPayload({ config: configPromise });

    // Get all tags
    const tagsResult = await payload.find({
      collection: 'tags',
      limit: 500, // Get a large number of tags
    });

    return {
      success: true,
      data: tagsResult.docs.map(tag => ({
        id: tag.id,
        name: tag.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching tags',
    };
  }
}

// Function to submit showcase data
export async function submitShowcase(formData: {
  name: string;
  projectUrl: string;
  githubUrl?: string;
  description: string;
  technologies: string[]; // Now expecting tag IDs rather than tag names
  image?: File | null;
}) {
  try {
    // Initialize Payload
    const payload = await getPayload({ config: configPromise });

    // Create showcase document
    const showcaseData: any = {
      name: formData.name,
      websiteUrl: formData.projectUrl, // Field is named websiteUrl in the collection
      githubUrl: formData.githubUrl || undefined,
      description: formData.description,
      _status: 'published',
      // Simply assign the tags directly since we're already sending tag IDs
      tags: formData.technologies,
    };

    // Handle image upload if provided
    if (formData.image) {
      try {
        // Create a buffer from the file
        const buffer = Buffer.from(await formData.image.arrayBuffer());

        // Upload to media collection
        const uploadedMedia = await payload.create({
          collection: 'media',
          data: {
            alt: `${formData.name} showcase image`,
          },
          file: {
            data: buffer,
            mimetype: formData.image.type,
            name: formData.image.name,
            size: formData.image.size,
          },
        });

        // Add the media relation to the showcase data
        showcaseData.image = uploadedMedia.id;
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue with submission even if image upload fails
      }
    }

    const showcase = await payload.create({
      collection: 'showcases',
      data: showcaseData,
    });

    // Revalidate paths - both the list page and the individual showcase page
    revalidatePath('/showcase');

    return {
      success: true,
      id: showcase.id,
    };
  } catch (error) {
    console.error('Error submitting showcase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error submitting showcase',
    };
  }
}

// Function to fetch GitHub user repositories
export async function fetchUserRepositories(
  token: string
): Promise<{ success: boolean; repos?: any[]; error?: string }> {
  try {
    console.log('[GitHub Repos] Fetching repositories with token', token ? 'provided' : 'missing');

    if (!token) {
      return {
        success: false,
        error: 'No GitHub token provided',
      };
    }

    // Fetch user repositories from GitHub API
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100&visibility=public',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store', // Disable caching to always get fresh data
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GitHub Repos Fetch] API Error: ${response.status} - ${errorText}`);
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    const repos = await response.json();
    console.log(`[GitHub Repos] Successfully retrieved ${repos.length} repositories`);

    // Filter and map to relevant data
    const mappedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatarUrl,
      },
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
      isArchived: repo.archived,
      isDisabled: repo.disabled,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
    }));

    return {
      success: true,
      repos: mappedRepos,
    };
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching repositories',
    };
  }
}

// Check if this function exists already
export async function fetchRepoAndRedirect(githubUrl: string) {
  const result = await fetchGitHubRepo(githubUrl);
  return result;
}

// Add a new server action to get the authentication session
export async function getAuthSession() {
  try {
    // This is a server action, so it's safe to call auth() here
    const session = await auth();
    return {
      success: true,
      session: session,
    };
  } catch (error) {
    console.error('Error getting auth session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get authentication session',
    };
  }
}

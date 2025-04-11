'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import payload from 'payload';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth } from '@/auth';

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

// Common types for the form
export interface InstallCommand {
  packageManager: string;
  customLabel?: string | null;
  command: string;
  id?: string | null;
}

export interface PluginImage {
  id: number;
  url: string;
  alt?: string;
}

// Extract owner and repo from GitHub URL
export async function extractOwnerAndRepo(url: string): Promise<{ owner: string; repo: string }> {
  const segments = url.split('/').filter(Boolean);
  return {
    owner: segments[2], // Owner is the 3rd segment (0-indexed)
    repo: segments[3], // Repo is the 4th segment (0-indexed)
  };
}

// Interface for GitHub repo data
export interface GitHubRepoSuccess {
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

export interface GitHubRepoError {
  success: false;
  error: string;
}

export type GitHubRepoResult = GitHubRepoSuccess | GitHubRepoError;

// Function to fetch GitHub repository data
export async function fetchGitHubRepo(githubUrl: string): Promise<GitHubRepoResult> {
  try {
    // Validate GitHub URL
    const validatedUrl = githubUrlSchema.parse(githubUrl);

    // Extract owner and repo
    const { owner, repo } = await extractOwnerAndRepo(validatedUrl);

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
    return {
      success: true,
      repo: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        owner: {
          login: repoData.owner.login,
          avatarUrl: repoData.owner.avatar_url,
        },
        defaultBranch: repoData.default_branch,
        license: repoData.license ? repoData.license.name : null,
        homepage: repoData.homepage,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        topics: repoData.topics || [],
      },
      readme: readmeContent,
      contributors: contributors.map((contributor: any) => ({
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        contributions: contributor.contributions,
      })),
    };
  } catch (error) {
    console.error('Error fetching GitHub repo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching repository',
    };
  }
}

// Function to extract install command from readme
export async function extractInstallCommand(readme: string) {
  // Common installation command patterns
  const patternNpm = /npm (i|install) ([\w-@/]+)/;
  const patternYarn = /yarn add ([\w-@/]+)/;
  const patternPnpm = /pnpm (add|install) ([\w-@/]+)/;

  // Search for installation commands
  const npmMatch = readme.match(patternNpm);
  const yarnMatch = readme.match(patternYarn);
  const pnpmMatch = readme.match(patternPnpm);

  // Extracted package names
  const npmPackage = npmMatch ? npmMatch[2] : null;
  const yarnPackage = yarnMatch ? yarnMatch[1] : null;
  const pnpmPackage = pnpmMatch ? pnpmMatch[2] : null;

  // Prioritize findings (use the first found package)
  const packageName = npmPackage || yarnPackage || pnpmPackage || '';

  return packageName;
}

// Function to get the authentication session
export async function getAuthSession() {
  try {
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

// Function to verify GitHub repository ownership
export async function verifyGitHubOwnership(githubUrl: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return { verified: false, error: 'Not authenticated' };
    }

    const { owner } = await extractOwnerAndRepo(githubUrl);
    const username = session.user.username || session.user.name;

    if (owner.toLowerCase() === username?.toLowerCase()) {
      return {
        verified: true,
        data: {
          verifiedBy: username,
          method: 'owner',
          username: username,
          userId: session.user.id,
        },
      };
    }

    return { verified: false, error: 'Repository owner does not match your GitHub username' };
  } catch (error) {
    console.error('Error verifying ownership:', error);
    return { verified: false, error: 'Error verifying ownership' };
  }
}

// Helper to upload image to Payload media collection
export async function uploadImage(
  image: File | Blob,
  altText: string,
  payloadInstance: any
): Promise<string | null> {
  try {
    // Create a buffer from the file
    const buffer = Buffer.from(await image.arrayBuffer());

    // Upload to media collection
    const uploadedMedia = await payloadInstance.create({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: buffer,
        mimetype: image.type,
        name: 'name' in image ? image.name : 'plugin-image.jpg',
        size: image.size,
      },
    });

    // Return the uploaded media ID
    return uploadedMedia.id;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Function to submit a new plugin
export async function submitPlugin(formData: FormData) {
  try {
    const payload = await getPayload({ config: configPromise });

    // Parse form data
    const formDataJson = formData.get('formData');
    const verificationDataJson = formData.get('verificationData');

    if (!formDataJson) {
      return { success: false, error: 'No form data provided' };
    }

    const data = JSON.parse(formDataJson.toString());
    const verificationData = verificationDataJson
      ? JSON.parse(verificationDataJson.toString())
      : null;

    // Process images if they exist
    let imageIds: string[] = [];
    if (formData.getAll('images').length > 0) {
      const imageFiles = formData.getAll('images') as File[];
      const validImageFiles = imageFiles.filter(
        file => file instanceof File && file.size > 0 && file.name
      );

      // Upload each image
      for (const image of validImageFiles) {
        const imageId = await uploadImage(image, `${data.name} plugin image`, payload);
        if (imageId) {
          imageIds.push(imageId);
        }
      }
    }

    // Create rich text from description
    const richTextDescription = createRichTextFromDescription(data.description || '');

    // Prepare the plugin data
    const pluginData: any = {
      name: data.name,
      shortDescription: data.shortDescription,
      fullDescription: richTextDescription,
      githubUrl: data.githubUrl,
      category: data.category ? Number(data.category) : undefined,
      tags: data.tags?.map((tag: string) => Number(tag)) || [],
      _status: 'published',
      installCommands: data.installCommands || [],
      relatedLinks: {
        github: data.githubUrl,
        npm: data.relatedLinks?.npmUrl || null,
        demo: data.relatedLinks?.demoUrl || null,
        video: data.relatedLinks?.videoUrl || null,
      },
    };

    // Add GitHub data if available
    if (data.githubData) {
      pluginData.githubData = {
        stars: data.githubData.stars,
        forks: data.githubData.forks,
        lastUpdated: data.githubData.pushedAt || data.githubData.updatedAt,
      };
    }

    // Add verification data if available
    if (verificationData && verificationData.verified) {
      pluginData.verification = {
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: verificationData.data.verifiedBy,
        githubVerification: {
          userId: verificationData.data.userId,
          username: verificationData.data.username,
          method: verificationData.data.method,
        },
      };
    }

    // Add images if uploaded
    if (imageIds.length > 0) {
      pluginData.images = imageIds.map(id => ({ media: id }));
    }

    // Create the plugin in the database
    const plugin = await payload.create({
      collection: 'plugins',
      data: pluginData,
    });

    // Revalidate the plugins page
    revalidatePath('/plugins');

    return {
      success: true,
      pluginId: plugin.id,
      slug: plugin.slug,
    };
  } catch (error) {
    console.error('Error submitting plugin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error submitting plugin',
    };
  }
}

// Function to update an existing plugin
export async function updatePlugin(formData: FormData) {
  try {
    const payload = await getPayload({ config: configPromise });

    // Parse form data
    const formDataJson = formData.get('formData');
    const pluginId = formData.get('pluginId');
    const slug = formData.get('slug');

    if (!formDataJson || !pluginId || !slug) {
      return { success: false, error: 'Missing required data' };
    }

    const data = JSON.parse(formDataJson.toString());

    // Get the current plugin to check ownership
    const pluginRes = await payload.find({
      collection: 'plugins',
      where: {
        slug: {
          equals: slug.toString(),
        },
      },
    });

    if (pluginRes.docs.length === 0) {
      return { success: false, error: 'Plugin not found' };
    }

    const plugin = pluginRes.docs[0];

    // Check if user is owner
    const session = await auth();

    if (!session || !session.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is owner based on verification data
    let isOwner = false;

    if (plugin.verification && plugin.verification.githubVerification) {
      const githubUsername = session.user.username;

      isOwner =
        plugin.verification.githubVerification.username === githubUsername ||
        plugin.verification.verifiedBy === githubUsername;
    }

    if (!isOwner) {
      return { success: false, error: 'You do not have permission to edit this plugin' };
    }

    // Process new images if provided
    let newImageIds: string[] = [];
    if (formData.getAll('images').length > 0) {
      const imageFiles = formData.getAll('images') as File[];
      const validImageFiles = imageFiles.filter(
        file => file instanceof File && file.size > 0 && file.name
      );

      // Upload each image
      for (const image of validImageFiles) {
        const imageId = await uploadImage(image, `${data.name} plugin image`, payload);
        if (imageId) {
          newImageIds.push(imageId);
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      shortDescription: data.shortDescription,
      category: data.category ? Number(data.category) : null,
      tags: data.tags ? data.tags.map((tagId: string) => Number(tagId)) : [],
      installCommands: data.installCommands || [],
      relatedLinks: {
        npmUrl: data.relatedLinks?.npmUrl || null,
        demoUrl: data.relatedLinks?.demoUrl || null,
        videoUrl: data.relatedLinks?.videoUrl || null,
      },
    };

    // Combine existing images with new ones
    if (newImageIds.length > 0 || data.removedImageIds) {
      // Get existing images
      const existingImages = plugin.images || [];

      // Filter out removed images
      const filteredImages = data.removedImageIds
        ? existingImages.filter((img: any) => !data.removedImageIds.includes(img.id.toString()))
        : existingImages;

      // Add new images
      updateData.images = [...filteredImages, ...newImageIds.map(id => ({ media: id }))];
    }

    // Update the plugin
    const updatedPlugin = await payload.update({
      collection: 'plugins',
      id: pluginId.toString(),
      data: updateData,
    });

    // Revalidate paths
    revalidatePath(`/plugins/${slug}`);

    // If name changed, the slug might have changed too
    const newSlug = updatedPlugin.slug;
    if (newSlug !== slug) {
      revalidatePath(`/plugins/${newSlug}`);
    }

    return {
      success: true,
      message: 'Plugin updated successfully',
      newSlug: newSlug !== slug ? newSlug : null,
    };
  } catch (error) {
    console.error('Error updating plugin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating plugin',
    };
  }
}

// Function to get all available tags
export async function getTags() {
  try {
    const payload = await getPayload({ config: configPromise });

    const tags = await payload.find({
      collection: 'tags',
      limit: 100,
    });

    return {
      success: true,
      tags: tags.docs,
    };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching tags',
    };
  }
}

// Function to get all categories
export async function getCategories() {
  try {
    const payload = await getPayload({ config: configPromise });

    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    });

    return {
      success: true,
      categories: categories.docs,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching categories',
    };
  }
}

// Function to fetch a plugin for editing
export async function getPluginForEdit(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });

    const plugin = await payload.find({
      collection: 'plugins',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2, // Need depth for related links and other nested data
    });

    if (plugin.docs.length === 0) {
      return { success: false, error: 'Plugin not found' };
    }

    return {
      success: true,
      plugin: plugin.docs[0],
    };
  } catch (error) {
    console.error('Error fetching plugin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching plugin',
    };
  }
}

// Helper to create rich text from plain text
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

// Function to fetch GitHub user repositories
export async function fetchUserRepositories(
  token: string
): Promise<{ success: boolean; repos?: any[]; error?: string }> {
  try {
    console.log('[GitHub Repos] Fetching repositories with token', token ? 'provided' : 'missing')

    if (!token) {
      return {
        success: false,
        error: 'No GitHub token provided',
      }
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
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[GitHub Repos Fetch] API Error: ${response.status} - ${errorText}`)
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`)
    }

    const repos = await response.json()
    console.log(`[GitHub Repos] Successfully retrieved ${repos.length} repositories`)

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
        avatarUrl: repo.owner.avatar_url,
      },
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
      isArchived: repo.archived,
      isDisabled: repo.disabled,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
    }))

    return {
      success: true,
      repos: mappedRepos,
    }
  } catch (error) {
    console.error('Error fetching user repositories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching repositories',
    }
  }
}

// Server component for plugin edit page
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { getPluginForEdit } from './actions';
import { PluginEditForm } from './PluginEditForm';
import Link from 'next/link';
import { Icon } from '@iconify/react';

// Define params as a Promise type
type PageParams = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditPluginPage({ params: paramsPromise }: PageParams) {
  // Await the params
  const { slug } = await paramsPromise;

  // Check if user is authenticated
  const session = await auth();
  if (!session || !session.user) {
    // Redirect to the standard Auth.js sign-in URL
    return redirect(`/plugins/${slug}`);
  }

  try {
    // Fetch the plugin data for editing - this now handles ownership verification internally
    const pluginData = await getPluginForEdit(slug);

    if (!pluginData) {
      return notFound();
    }

    // If authenticated and authorized, render the edit form with plugin data
    return (
      <div className="u-container fl-py-l">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href={`/plugins/${slug}`}
            className="group mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <Icon
              icon="heroicons:arrow-left"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            <span>Back to plugin</span>
          </Link>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Edit Plugin</h1>
          <p className="max-w-2xl text-lg text-white/80">Update the information for your plugin.</p>
        </div>

        {/* Pass the plugin data to the client component */}
        <PluginEditForm slug={slug} initialData={pluginData} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching plugin data:', error);
    // Show unauthorized message if not the owner or other error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const isUnauthorized =
      errorMessage.includes('permission') || errorMessage.includes('authorized');

    return (
      <div className="u-container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 rounded-none border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start">
              <div className="mr-4">
                <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold">
                  {isUnauthorized ? 'Unauthorized Access' : 'Error Loading Plugin'}
                </h2>
                <p className="mb-4">
                  {isUnauthorized
                    ? "You don't have permission to edit this plugin. Only the verified owner can edit plugin details."
                    : 'There was an error loading the plugin data. Please try again later.'}
                </p>
                {isUnauthorized && (
                  <p className="text-sm">
                    If you believe you should have access, you can verify ownership through the
                    plugin page.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Link
              href={`/plugins/${slug}`}
              className="flex items-center text-foreground/70 transition-colors hover:text-foreground"
            >
              <Icon icon="heroicons:arrow-left" className="mr-1 h-4 w-4" />
              Back to Plugin
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

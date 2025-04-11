import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { noindex } from '@/seo/noindex';
import { PluginSubmissionForm } from './PluginSubmissionForm';
import { Button, Spinner } from '@heroui/react';
import { CosmicBackground } from '../components/CosmicBackground';
import { Suspense } from 'react';

// Enable Partial Prerendering for this route
export const experimental_ppr = true;
export const metadata = {
  title: 'Submit a Plugin - PayloadPlugins',
  description:
    'Share your Payload CMS plugin with the community. Include installation instructions, documentation, and examples.',
  robots: noindex,
};

export default function PluginSubmitPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Hero section */}
      <section className="relative fl-py-l">
        <div className="u-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-foreground fl-text-step-3 fl-mb-s">Submit a Plugin</h1>
            <p className="text-foreground/80 fl-text-step-0 fl-mb-l">
              Share your Payload CMS plugin with the community. Add your GitHub repository,
              installation instructions, and plugin details to get started.
            </p>
          </div>
        </div>
      </section>
      {/* Form section */}
      <section className="relative fl-pb-xl">
        <div className="u-container relative z-10">
          <div className="mx-auto max-w-3xl">
            <Suspense
              fallback={
                <div className="py-8 text-center">
                  <Spinner size="lg" color="white" />
                </div>
              }
            >
              <PluginSubmissionForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

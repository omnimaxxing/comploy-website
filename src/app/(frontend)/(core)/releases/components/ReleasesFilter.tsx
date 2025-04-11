'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge, Card, Spinner } from '@heroui/react';
import type { Release } from '@/payload-types';
import { ReleaseDetails } from './ReleaseDetails';

interface ReleasesFilterProps {
  initialReleases: Release[];
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const ReleasesFilter: React.FC<ReleasesFilterProps> = ({ initialReleases }) => {
  const [releases, setReleases] = useState<Release[]>(initialReleases || []);
  const [filteredReleases, setFilteredReleases] = useState<Release[]>(initialReleases || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [fromVersion, setFromVersion] = useState<string>('');
  const [toVersion, setToVersion] = useState<string>('');
  const [sortNewest, setSortNewest] = useState(true);
  const [breakingChangesOnly, setBreakingChangesOnly] = useState(false);

  // Available version options
  const [versionOptions, setVersionOptions] = useState<{ label: string; value: string }[]>([]);

  // Initialize version options and default filters on mount
  useEffect(() => {
    if (initialReleases && initialReleases.length > 0) {
      // Create version options
      const options = initialReleases.map(release => ({
        label: release.version,
        value: release.version,
      }));
      setVersionOptions(options);

      // Set default filter values
      setFromVersion(initialReleases[Math.min(10, initialReleases.length - 1)].version);
      setToVersion(initialReleases[0].version);
    }
  }, [initialReleases]);

  // Apply filters when filter settings change
  useEffect(() => {
    if (releases.length === 0) return;

    let filtered = [...releases];

    // Filter by version range
    if (fromVersion && toVersion) {
      const fromIndex = releases.findIndex(r => r.version === fromVersion);
      const toIndex = releases.findIndex(r => r.version === toVersion);

      if (fromIndex !== -1 && toIndex !== -1) {
        const startIndex = Math.min(fromIndex, toIndex);
        const endIndex = Math.max(fromIndex, toIndex);
        filtered = releases.slice(startIndex, endIndex + 1);
      }
    }

    // Filter by breaking changes
    if (breakingChangesOnly) {
      filtered = filtered.filter(release => release.isBreaking);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

    setFilteredReleases(filtered);
  }, [releases, fromVersion, toVersion, sortNewest, breakingChangesOnly]);

  // Reset filters
  const handleReset = () => {
    if (releases.length > 0) {
      setFromVersion(releases[Math.min(10, releases.length - 1)].version);
      setToVersion(releases[0].version);
    }
    setSortNewest(true);
    setBreakingChangesOnly(false);
  };

  // Render commit hash link
  const renderCommitLink = (hash?: string) => {
    if (!hash) return null;
    return (
      <a
        href={`https://github.com/payloadcms/payload/commit/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        {hash.substring(0, 7)}
      </a>
    );
  };

  // Render issue link
  const renderIssueLink = (issueNumber?: number) => {
    if (!issueNumber) return null;
    return (
      <a
        href={`https://github.com/payloadcms/payload/issues/${issueNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        #{issueNumber}
      </a>
    );
  };

  // Custom dropdown since heroui Select isn't working well
  const VersionSelect = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
  }) => (
    <div>
      <label className="mb-2 block font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 backdrop-blur-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fl-mb-xl">
      {/* Filter controls */}
      <Card className="bg-card/30 border border-white/10 p-6 backdrop-blur-sm fl-mb-m">
        <div className="u-grid gap-4">
          <div className="col-span-12 mb-2 md:col-span-4">
            <VersionSelect
              label="From Version"
              value={fromVersion}
              onChange={setFromVersion}
              options={versionOptions}
            />
          </div>

          <div className="col-span-12 mb-2 md:col-span-4">
            <VersionSelect
              label="To Version"
              value={toVersion}
              onChange={setToVersion}
              options={versionOptions}
            />
          </div>

          <div className="col-span-12 mb-2 md:col-span-4">
            <VersionSelect
              label="Sort Order"
              value={sortNewest ? 'newest' : 'oldest'}
              onChange={value => setSortNewest(value === 'newest')}
              options={[
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
              ]}
            />
          </div>

          <div className="col-span-12 flex items-center fl-mb-s">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={breakingChangesOnly}
                onChange={e => setBreakingChangesOnly(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <span>Breaking Changes Only</span>
            </label>
          </div>

          <div className="col-span-12">
            <Button onPress={handleReset} variant="light">
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Release count */}
      <div className="text-muted-foreground fl-mb-m">
        {filteredReleases.length} {filteredReleases.length === 1 ? 'release' : 'releases'} found
      </div>

      {/* Error message */}
      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive border-l-4 p-4 fl-mb-m">
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-10 text-center">
          <Spinner aria-label="Loading Auth State" color="white" variant="gradient" />
          <p className="mt-2">Loading releases...</p>
        </div>
      )}

      {/* Releases list */}
      {!loading && filteredReleases.length === 0 && (
        <div className="py-8 text-center">
          <p>No releases match your filter criteria.</p>
        </div>
      )}

      {filteredReleases.map(release => (
        <ReleaseDetails key={release.id} release={release} />
      ))}
    </div>
  );
};

export default ReleasesFilter;

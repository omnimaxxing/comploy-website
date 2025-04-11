'use client';

import React, { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { Button, Select, SelectItem, Card, CardBody } from '@heroui/react';
import { InstallCommand, PluginImage } from './actions';

// Terminal style component for install commands
export const TerminalInput = ({
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
export const MultiPackageManagerInput = ({
  commands,
  onChange,
  disabled = false,
}: {
  commands: InstallCommand[];
  onChange: (commands: InstallCommand[]) => void;
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
      packageName = getPackageNameFromCommand(firstCommand, commands[0].packageManager);
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
      // When updating the command, extract the package name and prepend the prefix
      const updatedCommands = [...commands];
      const prefix = getPrefix(updatedCommands[index].packageManager);
      updatedCommands[index] = {
        ...updatedCommands[index],
        command: value.startsWith(prefix) ? value : `${prefix} ${value}`,
      };
      onChange(updatedCommands);
    } else if (field === 'packageManager') {
      // When changing package manager, keep the package name but change the prefix
      const updatedCommands = [...commands];

      // Extract the package name from the old command
      const oldCommand = updatedCommands[index].command || '';
      const packageName = getPackageNameFromCommand(
        oldCommand,
        updatedCommands[index].packageManager
      );

      // Get the new prefix for the selected package manager
      const newPrefix = packageManagers.find(pm => pm.value === value)?.prefix || 'npm install';

      // Create the new command with the new prefix but same package
      const newCommand = packageName ? `${newPrefix} ${packageName}` : '';

      updatedCommands[index] = {
        ...updatedCommands[index],
        packageManager: value,
        command: newCommand,
      };

      onChange(updatedCommands);
    }
  };

  // Remove a command
  const removeCommand = (index: number) => {
    const updatedCommands = [...commands];
    updatedCommands.splice(index, 1);
    onChange(updatedCommands);
  };

  // Get the prefix for a package manager
  const getPrefix = (packageManager: string): string => {
    return packageManagers.find(pm => pm.value === packageManager)?.prefix || 'npm install';
  };

  // Extract the package name from a command with prefix
  const getPackageNameFromCommand = (command: string, packageManager: string): string => {
    const prefix = getPrefix(packageManager);
    return command.startsWith(prefix) ? command.substring(prefix.length).trim() : command;
  };

  return (
    <div className="space-y-4">
      {commands.map((command, index) => (
        <Card key={index} className="border-foreground/10 shadow-none">
          <CardBody className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <Select
                  label="Package Manager"
                  size="sm"
                  className="max-w-[180px]"
                  disallowEmptySelection
                  selectedKeys={[command.packageManager]}
                  onChange={e => updateCommand(index, 'packageManager', e.target.value)}
                  disabled={disabled}
                >
                  {packageManagers.map(pm => (
                    <SelectItem key={pm.value} startContent={<Icon icon={pm.icon} />}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </Select>

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => removeCommand(index)}
                  className="ml-auto"
                  disabled={disabled || commands.length <= 1}
                >
                  <Icon icon="heroicons:trash" />
                </Button>
              </div>

              <TerminalInput
                value={command.command}
                onChange={value => updateCommand(index, 'command', value)}
                prefix={getPrefix(command.packageManager)}
                disabled={disabled}
              />
            </div>
          </CardBody>
        </Card>
      ))}

      {commands.length < packageManagers.length && (
        <Button
          size="sm"
          variant="flat"
          color="primary"
          startContent={<Icon icon="heroicons:plus" />}
          onClick={addCommand}
          className="mt-2"
          disabled={disabled}
        >
          Add Install Command
        </Button>
      )}
    </div>
  );
};

// GitHub repo card component
export const GitHubRepoCard = ({
  repo,
}: {
  repo: {
    name: string;
    fullName: string;
    description: string | null;
    owner: {
      login: string;
      avatarUrl: string;
    };
  };
}) => {
  return (
    <Card className="border-foreground/10 shadow-none">
      <CardBody className="p-4">
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0">
            <Image
              src={repo.owner.avatarUrl}
              alt={repo.owner.login}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium">{repo.name}</h3>
            <p className="truncate text-sm text-foreground/60">{repo.fullName}</p>
            {repo.description && (
              <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{repo.description}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Image uploader component
export const ImageUploader = ({
  images,
  onImagesChange,
  disabled = false,
  existingImageUrls = [],
  onRemoveExistingImage,
}: {
  images: File[];
  onImagesChange: (images: File[]) => void;
  disabled?: boolean;
  existingImageUrls?: PluginImage[];
  onRemoveExistingImage?: (id: number) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Handle adding images
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to Array and filter out any non-image files
      const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));

      // Create preview URLs for the new files
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));

      // Update state with new files and previews
      onImagesChange([...images, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    // Release the object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    // Update state by removing the file and preview
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // Handle removing an existing image
  const handleRemoveExistingImage = (id: number) => {
    onRemoveExistingImage?.(id);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {existingImageUrls && existingImageUrls.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {existingImageUrls.map(image => (
            <div key={image.id} className="group relative">
              <div className="aspect-video overflow-hidden rounded-lg border border-foreground/10">
                <Image
                  src={image.url}
                  alt={image.alt || 'Plugin image'}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>

              {onRemoveExistingImage && (
                <button
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleRemoveExistingImage(image.id)}
                  disabled={disabled}
                  type="button"
                >
                  <Icon icon="heroicons:x-mark" className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((_, index) => (
            <div key={index} className="group relative">
              <div className="aspect-video overflow-hidden rounded-lg border border-foreground/10">
                <Image
                  src={previews[index]}
                  alt={`Preview ${index + 1}`}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>

              <button
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
                type="button"
              >
                <Icon icon="heroicons:x-mark" className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleAddImages}
          disabled={disabled}
        />

        <Button
          size="md"
          variant="flat"
          color="default"
          startContent={<Icon icon="heroicons:arrow-up-tray" className="h-5 w-5" />}
          onClick={triggerFileInput}
          className="w-full"
          disabled={disabled}
          type="button"
        >
          Upload Images
        </Button>

        <p className="mt-2 text-sm text-foreground/60">
          Upload images to showcase your plugin (PNG, JPG, GIF)
        </p>
      </div>
    </div>
  );
};

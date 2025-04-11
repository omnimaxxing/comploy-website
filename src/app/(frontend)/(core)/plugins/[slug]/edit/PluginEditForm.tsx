'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Form, Input, Select, SelectItem, Textarea, Spinner, Switch, Card, CardBody, Chip } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Image from 'next/image'
import { toast } from 'sonner'
import { updatePlugin } from './actions'

// Terminal style component for install commands
const TerminalInput = ({
  value,
  onChange,
  placeholder,
  prefix = 'pnpm install',
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  prefix?: string
  disabled?: boolean
}) => {
  return (
    <div className="bg-background/50 border border-foreground/20 p-3 font-mono fl-text-step--1 flex items-center overflow-hidden">
      <span className="text-foreground/40 mr-2">{prefix}</span>
      <input
        type="text"
        className="bg-transparent flex-1 outline-none border-none text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}

// Multiple package manager installation commands component
const MultiPackageManagerInput = ({
  commands,
  onChange,
  disabled = false,
}: {
  commands: Array<{
    packageManager: string
    customLabel?: string | null
    command: string
    id?: string | null
  }>
  onChange: (
    commands: Array<{
      packageManager: string
      customLabel?: string | null
      command: string
      id?: string | null
    }>,
  ) => void
  disabled?: boolean
}) => {
  // Package manager options
  const packageManagers = [
    { value: 'npm', label: 'npm', prefix: 'npm install', icon: 'logos:npm' },
    { value: 'yarn', label: 'yarn', prefix: 'yarn add', icon: 'logos:yarn' },
    { value: 'pnpm', label: 'pnpm', prefix: 'pnpm add', icon: 'logos:pnpm' },
    { value: 'bun', label: 'bun', prefix: 'bun add', icon: 'logos:bun' },
  ]

  // Add a new command
  const addCommand = () => {
    // Find a package manager that isn't already used
    const unusedManagers = packageManagers.filter(
      (pm) => !commands.some((cmd) => cmd.packageManager === pm.value),
    )

    if (unusedManagers.length === 0) return // All package managers are used

    const nextManager = unusedManagers[0]

    // Generate a command value based on existing commands if any
    let packageName = ''
    if (commands.length > 0) {
      // Get the package name from the first command
      const firstCommand = commands[0].command
      const prefix = getPrefix(commands[0].packageManager)
      packageName = firstCommand.startsWith(prefix)
        ? firstCommand.substring(prefix.length).trim()
        : firstCommand
    }

    // Create full command with prefix
    const fullCommand = packageName ? `${nextManager.prefix} ${packageName}` : ''

    onChange([
      ...commands,
      {
        packageManager: nextManager.value,
        command: fullCommand,
      },
    ])
  }

  // Add a default package manager if none provided
  useEffect(() => {
    if (commands.length === 0) {
      addCommand()
    }
  }, [commands.length])

  // Update a command
  const updateCommand = (index: number, field: string, value: string) => {
    if (field === 'packageManager') {
      // When changing package manager, keep the package name but change the prefix
      const updatedCommands = [...commands]
      
      // Extract the package name from the old command
      const oldCommand = updatedCommands[index].command || ''
      const oldPrefix = getPrefix(updatedCommands[index].packageManager)
      const packageName = getPackageNameFromCommand(oldCommand, updatedCommands[index].packageManager)
      
      // Get the new prefix for the selected package manager
      const newPrefix = packageManagers.find(pm => pm.value === value)?.prefix || 'npm install'
      
      // Create the new command with the new prefix but same package
      const newCommand = packageName ? `${newPrefix} ${packageName}` : ''
      
      updatedCommands[index] = {
        ...updatedCommands[index],
        packageManager: value,
        command: newCommand
      }
      
      onChange(updatedCommands)
    } else if (field === 'command') {
      const updatedCommands = [...commands]
      updatedCommands[index] = {
        ...updatedCommands[index],
        [field]: value,
      }
      onChange(updatedCommands)
    } else {
      const updatedCommands = [...commands]
      updatedCommands[index] = {
        ...updatedCommands[index],
        [field]: value,
      }
      onChange(updatedCommands)
    }
  }

  // Remove a command
  const removeCommand = (index: number) => {
    const updatedCommands = [...commands]
    updatedCommands.splice(index, 1)
    onChange(updatedCommands)
  }

  // Get the prefix for a package manager
  const getPrefix = (packageManager: string): string => {
    return packageManagers.find((pm) => pm.value === packageManager)?.prefix || 'npm install'
  }

  // Extract the package name from a command with prefix
  const getPackageNameFromCommand = (command: string, packageManager: string): string => {
    const prefix = getPrefix(packageManager)
    return command.startsWith(prefix) ? command.substring(prefix.length).trim() : command
  }

  return (
    <div className="space-y-4">
      {commands.map((command, index) => (
        <div key={index} className="space-y-2 border border-foreground/10 p-4 rounded relative">
          <div className="flex items-center space-x-2">
            <Select
              selectedKeys={command.packageManager ? [command.packageManager] : []}
              onChange={(e) => updateCommand(index, 'packageManager', e.target.value)}
              className="flex-1 min-w-[150px]"
              size="sm"
              aria-label="Select package manager"
              disabled={disabled}
            >
              {packageManagers.map((pm) => (
                <SelectItem
                  key={pm.value}
                  startContent={<Icon icon={pm.icon} className="w-5 h-5" />}
                >
                  {pm.label}
                </SelectItem>
              ))}
            </Select>

            {/* Remove button */}
            <Button
              isIconOnly
              variant="light"
              color="danger"
              size="sm"
              onClick={() => removeCommand(index)}
              disabled={disabled || commands.length <= 1}
              title="Remove command"
              className="absolute right-2 top-2"
              aria-label="Remove command"
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </Button>
          </div>

          <div>
            <Input
              type="text"
              placeholder="Your command"
              value={getPackageNameFromCommand(command.command || '', command.packageManager)}
              onChange={(e) => {
                const prefix = getPrefix(command.packageManager)
                updateCommand(index, 'command', `${prefix} ${e.target.value}`)
              }}
              label="Command"
              labelPlacement="outside"
              variant="bordered"
              radius="none"
              disabled={disabled}
              startContent={
                <div className="flex items-center bg-background/50 text-foreground/40 pl-2 pr-3 py-1 rounded">
                  <span className="text-xs">{getPrefix(command.packageManager)}</span>
                </div>
              }
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-2">
        <Button
          variant="flat"
          color="default"
          size="sm"
          onClick={addCommand}
          startContent={<Icon icon="heroicons:plus" className="w-4 h-4" />}
          disabled={disabled || packageManagers.length <= commands.length}
          aria-label="Add new command"
        >
          Add Another
        </Button>
      </div>
    </div>
  )
}

// Image uploader component
const ImageUploader = ({
  images,
  onImagesChange,
  disabled = false,
  existingImageUrls = [],
  onRemoveExistingImage,
}: {
  images: File[]
  onImagesChange: (images: File[]) => void
  disabled?: boolean
  existingImageUrls?: PluginImage[]
  onRemoveExistingImage?: (id: number) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  // Generate image previews when images change
  useEffect(() => {
    const newPreviews = images.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)

    // Cleanup function to revoke object URLs
    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [images])

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    // Convert FileList to array and filter for images
    const newFiles = Array.from(e.target.files).filter((file) => {
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        return false
      }

      // Check file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024 // 5MB
      if (file.size > MAX_SIZE) {
        toast('File too large: ' + file.name + ' exceeds the 5MB size limit.')
        return false
      }

      return true
    })

    if (newFiles.length === 0) {
      toast('Please select valid image files (JPG, PNG, GIF) under 5MB.')
      return
    }

    // Add new files to existing ones, up to 4 max
    const updatedImages = [...images, ...newFiles].slice(0, 4)
    onImagesChange(updatedImages)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Show success toast
    toast(`${newFiles.length} image${newFiles.length > 1 ? 's' : ''} added successfully.`)
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    onImagesChange(updatedImages)
  }

  const handleRemoveExistingImage = (id: number) => {
    if (onRemoveExistingImage) {
      onRemoveExistingImage(id)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Existing images preview */}
        {existingImageUrls.map((img, index) => (
          <div
            key={`existing-${img.id}`}
            className={`relative group border-2 ${
              index === 0 ? 'border-primary' : 'border-foreground/10'
            } rounded-lg overflow-hidden hover:border-foreground/30 transition-colors`}
          >
            <div className="w-40 h-40 relative">
              <Image
                src={img.url}
                alt={`Existing image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              {index === 0 && (
                <div className="self-start">
                  <span className="p-1 rounded-full text-xs bg-primary text-background">Main</span>
                </div>
              )}
              <div className="self-end">
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.id)}
                  className="p-1 bg-background/80 rounded-full text-foreground hover:bg-red-500 hover:text-background transition-colors"
                  disabled={disabled}
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* New images preview */}
        {previews.map((preview, index) => (
          <div
            key={`new-${index}`}
            className={`relative group border-2 ${
              existingImageUrls.length === 0 && index === 0
                ? 'border-primary'
                : 'border-foreground/10'
            } rounded-lg overflow-hidden hover:border-foreground/30 transition-colors`}
          >
            <div className="w-40 h-40 relative">
              <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="self-end">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1 bg-background/80 rounded-full text-foreground hover:bg-red-500 hover:text-background transition-colors"
                  disabled={disabled}
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              </div>
              {existingImageUrls.length === 0 && index === 0 && (
                <div className="self-start">
                  <span className="p-1 rounded-full text-xs bg-primary text-background">Main</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upload button */}
        {existingImageUrls.length + images.length < 4 && (
          <div
            className="w-40 h-40 border-2 border-dashed border-foreground/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/40 transition-colors"
            onClick={disabled ? undefined : triggerFileInput}
          >
            <Icon icon="heroicons:photo" className="w-8 h-8 text-foreground/40" />
            <span className="text-sm text-foreground/60">Add images</span>
            <span className="text-xs text-foreground/40">
              {existingImageUrls.length + images.length}/4
            </span>
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
  )
}

// Define interfaces for form data types
interface InstallCommand {
  packageManager: string
  customLabel?: string | null
  command: string
  id?: string | null
}

interface PluginImage {
  id: number
  url: string
  alt?: string
}

interface PluginFormData {
  name: string
  shortDescription: string
  category?: string | number | null
  tags?: string[]
  installCommands: InstallCommand[]
  relatedLinks: {
    npmUrl?: string | null
    demoUrl?: string | null
    videoUrl?: string | null
  }
  images: File[]
}

interface PluginEditFormProps {
  slug: string
  initialData: any
}

export function PluginEditForm({ slug, initialData }: PluginEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState<PluginFormData>({
    name: initialData.name || '',
    shortDescription: initialData.shortDescription || '',
    category: initialData.category?.id || initialData.category || null,
    tags: initialData.tags?.map((tag: any) => 
      // Handle both simple ids and objects with id property
      typeof tag === 'object' ? tag.id : tag
    ) || [],
    installCommands:
      initialData.installCommands?.map((cmd: any) => ({
        packageManager: cmd.packageManager,
        customLabel: cmd.customLabel,
        command: cmd.command,
        id: cmd.id,
      })) || [],
    relatedLinks: {
      npmUrl: initialData.relatedLinks?.npmUrl || initialData.npmUrl || '',
      demoUrl: initialData.relatedLinks?.demoUrl || initialData.demoUrl || '',
      videoUrl: initialData.relatedLinks?.videoUrl || initialData.videoUrl || '',
    },
    images: [],
  })

  // Debug log to see what data we're getting
  useEffect(() => {
    console.log('Initial form data:', {
      initialCategory: initialData.category,
      formCategory: formData.category,
      initialTags: initialData.tags,
      formTags: formData.tags,
      initialLinks: initialData.relatedLinks,
      formLinks: formData.relatedLinks,
      githubRepo: initialData.githubRepo,
    })
  }, [])

  // State for categories and tags
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [tags, setTags] = useState<Array<{ id: string; name: string; color?: string }>>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // State for existing images
  const [existingImages, setExistingImages] = useState<PluginImage[]>(
    initialData.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
    })) || [],
  )

  // GitHub info display
  const githubRepo = initialData.githubRepo || '(not specified)'
  const stars = initialData.stars || 0
  const forks = initialData.forks || 0
  const lastUpdated = initialData.updatedAt
    ? new Date(initialData.updatedAt).toLocaleDateString()
    : 'Unknown'

  // Set up client-side data fetching for categories and tags
  useEffect(() => {
    fetchCategoriesAndTags()
  }, [])

  // Handle removing existing images
  const handleRemoveExistingImage = (id: number) => {
    setExistingImages(existingImages.filter((img) => img.id !== id))
  }

  // Handle adding new images
  const handleImagesChange = (newImages: File[]) => {
    setFormData({
      ...formData,
      images: newImages,
    })
  }

  // Function to fetch categories and tags
  async function fetchCategoriesAndTags() {
    // Fetch categories
    const categoriesResponse = await fetch('/api/categories')
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      } else if (categoriesData.docs && Array.isArray(categoriesData.docs)) {
        setCategories(categoriesData.docs)
      } else {
        setCategories([])
      }
    } else {
      setCategories([])
    }

    // Fetch tags
    const tagsResponse = await fetch('/api/tags')
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json()
      if (Array.isArray(tagsData)) {
        setTags(tagsData)
      } else if (tagsData.docs && Array.isArray(tagsData.docs)) {
        setTags(tagsData.docs)
      } else {
        setTags([])
      }
    } else {
      setTags([])
    }
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Create a FormData object for handling both text data and files
      const formDataToSend = new FormData()
      formDataToSend.append('slug', slug)
      
      // Add JSON data
      const processedFormData = {
        ...formData,
        tags: formData.tags?.map((tagId) => String(tagId)),
      }

      // Convert to string for form submission
      formDataToSend.append('data', JSON.stringify(processedFormData))

      // Add images if any
      formData.images.forEach((file, index) => {
        formDataToSend.append(`images`, file)
      })

      // Update the plugin
      const result = await updatePlugin(formDataToSend)

      if (result.success) {
        setSuccess('Plugin updated successfully!')

        // If the slug changed, navigate to the new URL
        if (result.newSlug && result.newSlug !== slug) {
          toast.success('Plugin updated successfully! Redirecting...')
          startTransition(() => {
            router.push(`/plugins/${result.newSlug}`)
          })
        } else {
          toast.success('Plugin updated successfully! Redirecting...')
          startTransition(() => {
            router.push(`/plugins/${slug}`)
          })
        }
      } else {
        setError(result.message || 'Failed to update plugin')
        toast.error(result.message || 'Failed to update plugin')
      }
    } catch (err) {
      console.error('Error updating plugin:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* GitHub Repository Info - Read Only Section */}
      <Card className="mb-8 bg-black/30 border border-foreground/10">
        <CardBody>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">GitHub Repository Info</h3>
              <p className="text-foreground/70 text-sm mb-4">
                This information is automatically synced from GitHub and cannot be edited.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground/60">Repository URL:</p>
                  <p className="font-mono text-sm break-all">
                    <a
                      href={githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {githubRepo}
                    </a>
                  </p>
                </div>

                <div className="flex gap-3">
                  <div>
                    <p className="text-sm text-foreground/60">Stars:</p>
                    <p className="flex items-center">
                      <Icon icon="heroicons:star" className="mr-1 text-yellow-400" />
                      {stars}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/60">Forks:</p>
                    <p className="flex items-center">
                      <Icon icon="heroicons:arrow-path" className="mr-1 text-blue-400" />
                      {forks}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/60">Last Updated:</p>
                    <p>{lastUpdated}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section - Editable Fields */}
        <div>
          <div className="border-b border-foreground/10 pb-4 mb-6">
            <h2 className="fl-text-step-1 font-medium">Basic Information</h2>
            <p className="text-foreground/70">Edit your plugin details</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Plugin Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Awesome Plugin"
                className="w-full"
                variant="bordered"
                radius="none"
                required
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="A brief description of your plugin"
                className="w-full"
                variant="bordered"
                radius="none"
                required
              />
            </div>
          </div>
        </div>

        {/* Category and Tags Section */}
        <div>
          <div className="border-b border-foreground/10 pb-4 mb-6">
            <h2 className="fl-text-step-1 font-medium">Category and Tags</h2>
            <p className="text-foreground/70">Categorize your plugin to help users find it</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                id="category"
                placeholder="Select a category"
                defaultSelectedKeys={formData.category ? [formData.category] : []}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full"
                variant="bordered"
                radius="none"
                isDisabled={isSaving}
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    textValue={category.name}
                  >
                    <div className="flex items-center">
                      <Chip 
                        size="sm" 
                        color="primary" 
                        variant="flat" 
                        className="mr-2"
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </Chip>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Tags</label>
              <Select
                placeholder="Select tags"
                selectionMode="multiple"
                className="w-full"
                radius="none"
                variant="bordered"
                selectedKeys={formData.tags?.map(String) || []}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: Array.from(e.target.value),
                  })
                }
              >
                {tags.map((tag) => (
                  <SelectItem
                    key={tag.id}
                    textValue={tag.name}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color || '#888888' }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Installation Commands Section */}
        <div>
          <div className="border-b border-foreground/10 pb-4 mb-6">
            <h2 className="fl-text-step-1 font-medium">Installation</h2>
            <p className="text-foreground/70">Installation commands for different package managers</p>
          </div>

          <div className="space-y-4">
            <MultiPackageManagerInput
              commands={formData.installCommands}
              onChange={(commands) => setFormData({ ...formData, installCommands: commands })}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Related Links Section */}
        <div>
          <div className="border-b border-foreground/10 pb-4 mb-6">
            <h2 className="fl-text-step-1 font-medium">Related Links</h2>
            <p className="text-foreground/70">
              Add optional links to help users learn more about your plugin
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="npmUrl" className="block text-sm font-medium mb-1">
                NPM URL
              </label>
              <Input
                id="npmUrl"
                name="npmUrl"
                value={formData.relatedLinks.npmUrl || ''}
                onChange={(e) =>
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
              />
            </div>

            <div>
              <label htmlFor="demoUrl" className="block text-sm font-medium mb-1">
                Demo URL
              </label>
              <Input
                id="demoUrl"
                name="demoUrl"
                value={formData.relatedLinks.demoUrl || ''}
                onChange={(e) =>
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
              />
            </div>

            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium mb-1">
                Video Tutorial URL
              </label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.relatedLinks.videoUrl || ''}
                onChange={(e) =>
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
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6 mt-8">
          <div className="border-b border-foreground/10 pb-4 mb-6">
            <h2 className="text-xl font-semibold">Plugin Images</h2>
            <p className="text-foreground/60 text-sm mt-1">
              Add screenshots of your plugin to showcase its features
            </p>
          </div>

          <div className="space-y-4">
            <ImageUploader
              images={formData.images}
              onImagesChange={handleImagesChange}
              existingImageUrls={existingImages}
              onRemoveExistingImage={handleRemoveExistingImage}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
            startContent={<Icon icon="heroicons:check" className="w-5 h-5" />}
            radius="none"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  )
}

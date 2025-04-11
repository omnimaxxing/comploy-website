'use client'

import React, { useState, useRef, startTransition, useEffect, Key, useMemo } from 'react'
import { useActionState } from 'react'
import { 
  Button, 
  Input,
  cn,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { submitShowcase, getTags } from '../actions'
import { useRouter } from 'next/navigation'
import { FormInput } from '../components/FormInput'
import { SubmitButton } from '../components/SubmitButton'
import { FileUploadInput } from '../components/FileUploadInput'

// Define a Tag type
interface Tag {
  id: string
  name: string
}

// Define GetTagsResponse type
interface GetTagsResponse {
  success: boolean
  data?: Tag[]
  error?: string
}

// Main form component
export function ShowcaseSubmissionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchInputRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchInputRef])
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    projectUrl: '',
    githubUrl: '',
    description: '',
    technologies: [] as string[],
    image: null as File | null,
  })
  
  // Selected tags for display
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  
  // Fetch available tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true)
        const tags = await getTags() as GetTagsResponse
        if (tags.success && tags.data) {
          setAvailableTags(tags.data)
        } else {
          console.error('Error fetching tags:', tags.error)
          toast({
            title: "Failed to load tags",
            description: "There was a problem loading available technology tags.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoadingTags(false)
      }
    }
    
    fetchTags()
  }, [])
  
  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    // Always exclude already selected tags
    const selectedTagIds = new Set(formData.technologies)
    const unselectedTags = availableTags.filter(tag => !selectedTagIds.has(tag.id))
    
    if (!searchQuery.trim()) return unselectedTags
    
    return unselectedTags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [availableTags, searchQuery, formData.technologies])
  
  // Update selected tags display whenever technologies changes
  useEffect(() => {
    const tags = formData.technologies.map(id => {
      const tag = availableTags.find(tag => tag.id === id)
      return tag || { id, name: id }
    })
    setSelectedTags(tags)
  }, [formData.technologies, availableTags])
  
  // Submit action state
  const [submitState, submitAction] = useActionState(
    async (prevState, formData: FormData) => {
      try {
        setLoading(true)
        
        // Get form fields
        const name = formData.get('name') as string
        const projectUrl = formData.get('projectUrl') as string
        const githubUrl = formData.get('githubUrl') as string || undefined
        const description = formData.get('description') as string
        const technologiesJson = formData.get('technologies') as string
        const technologies = JSON.parse(technologiesJson || '[]')
        
        if (!name || !projectUrl || !description) {
          setLoading(false)
          return { error: 'Please fill in all required fields' }
        }
        
        if (technologies.length === 0) {
          setLoading(false)
          return { error: 'Please add at least one technology' }
        }
        
        const result = await submitShowcase({
          name,
          projectUrl,
          githubUrl,
          description,
          technologies,
          image: formData.get('image') as File || null
        })
        
        setLoading(false)
        
        if (result.success) {
          toast({
            title: "Showcase submitted successfully!",
            description: "Your showcase has been submitted and will be reviewed shortly.",
            variant: "default",
          })
          
          // Reset form
          setFormData({
            name: '',
            projectUrl: '',
            githubUrl: '',
            description: '',
            technologies: [],
            image: null,
          })
          setSearchQuery("")
          setSelectedTags([])
          
          // Redirect to the showcase page
          setTimeout(() => {
            router.push(`/showcase/`)
          }, 2000)
          
          return { success: true }
        } else {
          throw new Error(result.error || 'Failed to submit showcase')
        }
      } catch (error) {
        setLoading(false)
        console.error("Submission error:", error)
        return { 
          error: error instanceof Error 
            ? error.message 
            : 'Failed to submit showcase'
        }
      }
    },
    null
  )
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }))
  }
  
  const handleTagSelect = (tagId: string) => {
    if (!formData.technologies.includes(tagId)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tagId]
      }))
    }
    setSearchQuery('')
    setIsDropdownOpen(false)
  }
  
  const handleTagRemove = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(id => id !== tagId)
    }))
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Open dropdown when typing
    if (e.target.value && !isDropdownOpen) {
      setIsDropdownOpen(true)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.name || !formData.projectUrl || !formData.description || formData.technologies.length === 0) {
      toast({
        title: "Please fill in all required fields",
        description: "Make sure to complete all required fields and add at least one technology.",
        variant: "destructive",
      })
      return
    }
    
    if (!formRef.current) return
    
    // Create a new FormData instance
    const formDataToSubmit = new FormData()
    
    // Add text fields
    formDataToSubmit.set('name', formData.name)
    formDataToSubmit.set('projectUrl', formData.projectUrl)
    if (formData.githubUrl) formDataToSubmit.set('githubUrl', formData.githubUrl)
    formDataToSubmit.set('description', formData.description)
    
    // Add the technologies array as JSON
    formDataToSubmit.set('technologies', JSON.stringify(formData.technologies))
    
    // Add the image file if present
    if (formData.image) {
      formDataToSubmit.set('image', formData.image)
    }
    
    // Wrap in startTransition to resolve the useActionState warning
    startTransition(() => {
      // Submit the form using the action
      submitAction(formDataToSubmit)
    })
  }
  
  return (
    <div className="animate-fade-in">
      <div className="fl-mb-l">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="fl-mb-m">
            {/* Project Details */}
            <div className="u-grid fl-mb-m">
              <FormInput
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your project name"
                icon="lucide:globe"
                className="col-span-12 md:col-span-6"
                required
                disabled={loading}
              />
              
              <FormInput
                label="Project URL"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleChange}
                placeholder="https://your-project-url.com"
                icon="lucide:link"
                className="col-span-12 md:col-span-6"
                required
                disabled={loading}
              />
            </div>
            
            <FormInput
              label="GitHub Repository (Optional)"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
              icon="lucide:github"
              className="fl-mb-m"
              disabled={loading}
            />
            
            <FormInput
              label="Project Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project and what makes it unique..."
              className="fl-mb-m"
              required
              disabled={loading}
              rows={4}
            />
            
            {/* Project Image Upload */}
            <FileUploadInput
              label="Project Image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="fl-mb-m"
              description="Upload a screenshot or preview image of your project (recommended size: 1200×630px)"
              disabled={loading}
              icon="lucide:image"
            />
            
            {/* Technologies */}
            <div className="fl-mb-m">
              <label className="block fl-text-step--1 font-medium fl-mb-xxs">Technologies Used</label>
              <p className="fl-text-step--2 text-foreground/60 fl-mb-xs">
                Select the technologies used in your project from the available options
              </p>
              
              {/* Technologies Search Input */}
              <div className="relative" ref={searchInputRef}>
                <Input
                  placeholder="Search for technologies..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={() => setIsDropdownOpen(true)}
                  className="mb-2"
                  radius="none"
                  variant="bordered"
                  startContent={
                    <Icon icon="lucide:search" className="text-foreground/40 pointer-events-none flex-shrink-0" />
                  }
                  endContent={
                    loadingTags ? (
                      <Spinner size="sm" color="secondary" />
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-foreground/40 cursor-pointer"
                      >
                        <Icon icon={isDropdownOpen ? "lucide:chevron-up" : "lucide:chevron-down"} />
                      </button>
                    )
                  }
                  isDisabled={loading || loadingTags}
                />
                
                {isDropdownOpen && (
                  <div className="w-full absolute top-full left-0 mt-1 max-h-[240px] overflow-y-auto z-50 shadow-md border border-border bg-background rounded">
                    {loadingTags ? (
                      <div className="p-4 text-center">
                        <Spinner size="sm" color="secondary" />
                        <p className="mt-2 text-sm text-foreground/60">Loading technologies...</p>
                      </div>
                    ) : filteredTags.length > 0 ? (
                      <ul className="py-1">
                        {filteredTags.map((tag) => (
                          <li 
                            key={tag.id}
                            className="px-2 py-2 hover:bg-purple-500/20 cursor-pointer text-sm" 
                            onClick={() => {
                              handleTagSelect(tag.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {tag.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-sm text-foreground/60">
                        {searchQuery ? "No matching technologies found" : "No more technologies available"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedTags.length === 0 && !loadingTags && (
                <p className="text-foreground/50 fl-text-step--1 mt-2">
                  No technologies selected. Search and select technologies from the list.
                </p>
              )}
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTags.map((tag) => (
                    <Chip 
                      key={tag.id}
                      variant="flat"
                      color="secondary"
                      onClose={() => handleTagRemove(tag.id)}
                      radius="none"
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              color="default" 
              variant="light" 
              onClick={() => router.push('/submit')}
              className="min-w-[100px]"
              radius="none"
              isDisabled={loading}
            >
              Back
            </Button>
            <SubmitButton
              variant="showcase"
              disabled={!formData.name || !formData.projectUrl || !formData.description || formData.technologies.length === 0 || loading}
            >
              Submit Showcase
            </SubmitButton>
          </div>
          
          {submitState?.error && (
            <p className="text-red-400 fl-mt-s fl-text-step--1">{submitState.error}</p>
          )}
        </form>
      </div>
    </div>
  )
} 
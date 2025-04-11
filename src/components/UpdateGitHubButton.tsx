'use client'

import React, { useState } from 'react'
import { useConfig } from '@payloadcms/ui'
import { Button } from '@heroui/react'

export const UpdateGitHubButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)
  
  const config = useConfig()

  const handleClick = async () => {
    try {
      setLoading(true)
      
      // Call the GitHub update endpoint
      const response = await fetch(`/api/update-github-data`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to queue GitHub updates')
      }
      
      // Also trigger the job processor to run immediately after queueing
      const processResponse = await fetch(`/api/payload-jobs/run?queue=github-updates`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!processResponse.ok) {
        console.warn('Job processing may have failed, but updates were queued successfully')
      }
      
      setMessage({
        text: 'Successfully queued and processed GitHub updates for all plugins',
        type: 'success',
      })
      
    } catch (error) {
      console.error('Error updating GitHub data:', error)
      setMessage({
        text: error.message || 'An error occurred while updating GitHub data',
        type: 'error',
      })
    } finally {
      setLoading(false)
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <Button 
        onClick={handleClick} 
        disabled={loading}
      >
        {loading ? 'Processing GitHub Updates...' : 'Update GitHub Data'}
      </Button>
      
      {message && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          color: message.type === 'success' ? '#155724' : '#721c24' 
        }}>
          {message.text}
        </div>
      )}
    </div>
  )
}

export default UpdateGitHubButton 
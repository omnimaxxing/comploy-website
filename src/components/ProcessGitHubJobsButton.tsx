'use client'

import React, { useState } from 'react'
import { Button } from '@heroui/react'

export const ProcessGitHubJobsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  const handleClick = async () => {
    try {
      setLoading(true)
      
      // Trigger the job processor to run
      const response = await fetch(`/api/payload-jobs/run?queue=github-updates`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process GitHub update jobs')
      }
      
      const result = await response.json()
      
      setMessage({
        text: `Successfully processed ${result.processedCount || 0} GitHub update jobs`,
        type: 'success',
      })
      
    } catch (error) {
      console.error('Error processing GitHub update jobs:', error)
      setMessage({
        text: error.message || 'An error occurred while processing GitHub update jobs',
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
        variant="ghost"
      >
        {loading ? 'Processing Jobs...' : 'Process Queued GitHub Jobs'}
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

export default ProcessGitHubJobsButton 
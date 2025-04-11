import React from 'react'
import UpdateGitHubButton from './UpdateGitHubButton'
import { UpdateReleasesButton } from './releases/UpdateReleasesButton'

export const BeforeDashboard: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <UpdateGitHubButton />
        <UpdateReleasesButton />
      </div>
    </div>
  )
}

export default BeforeDashboard 
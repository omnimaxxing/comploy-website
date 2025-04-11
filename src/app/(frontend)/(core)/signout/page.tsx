'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { Icon } from '@iconify/react'

export default function SignOutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('/')
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Extract callback URL from the query parameters
    const params = new URLSearchParams(window.location.search)
    const callback = params.get('callbackUrl')
    if (callback) {
      setCallbackUrl(callback)
    }
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push(callbackUrl)
  }

  const handleCancel = () => {
    router.push(callbackUrl)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Modal 
        isOpen={isOpen} 
        onClose={handleCancel}
        classNames={{
          base: "bg-background border border-foreground/10",
          header: "border-b border-foreground/10",
          footer: "border-t border-foreground/10",
          closeButton: "hover:bg-foreground/10"
        }}
        radius="none"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center">
              <Icon icon="mdi:github" className="mr-2 h-5 w-5" />
              Sign Out of GitHub
            </div>
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to sign out of your GitHub account? You will need to sign in again to submit or verify plugins.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={handleCancel}
              radius="none"
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleSignOut}
              isLoading={isLoading}
              radius="none"
            >
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

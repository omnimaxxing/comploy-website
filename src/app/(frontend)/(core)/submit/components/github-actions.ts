'use server'

import { signIn } from '@/auth'

export async function signInWithGitHub(formData: FormData) {
  const redirectTo = '/submit/plugin'
  await signIn('github', { redirectTo })
}

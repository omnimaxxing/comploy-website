'use server';

import { signIn, signOut } from '@/auth';

export async function signInWithGitHub(formData: FormData) {
  // Get the current URL to redirect back to
  const redirectTo = formData.get('redirectUrl')?.toString() || '/';
  await signIn('github', { redirectTo });
}

export async function signOutFromGitHub(formData: FormData) {
  // Get the current URL to redirect back to
  const redirectTo = formData.get('redirectUrl')?.toString() || '/';
  await signOut({ redirectTo });
}

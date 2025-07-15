import { useAuth, useUser, useSession } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

/**
 * Custom hook for authentication state with proper error handling
 */
export function useAuthState() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { session } = useSession()

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
    session,
    isAuthenticated: isLoaded && isSignedIn,
  }
}

/**
 * Hook to protect pages - redirects to sign-in if not authenticated
 */
export function useProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()

  if (isLoaded && !isSignedIn) {
    redirect('/sign-in')
  }

  return { isLoaded, isSignedIn }
}

/**
 * Server-side authentication utility
 */
export { auth } from '@clerk/nextjs/server'
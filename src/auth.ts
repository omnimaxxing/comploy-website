import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub({
    // Request the user's email and profile during authentication
    authorization: {
      params: {
        scope: 'read:user user:email repo'
      }
    }
  })],
  callbacks: {
    async session({ session, token }) {
      // Add GitHub access token to the session
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      
      // Add GitHub user ID to the user object
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      // Add GitHub username to the session if available
      if (token.username) {
        session.user.username = token.username as string;
      }
      
      return session;
    },
    async jwt({ token, account, profile }) {
      // Save the access token from the OAuth provider to the JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      
      // Save GitHub username from the profile to the token
      if (profile) {
        token.username = profile.login || profile.preferred_username || profile.name;
      }
      
      return token;
    }
  }
})

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null; // Add GitHub username
    }
  }
  
  interface JWT {
    username?: string; // Add username to JWT
  }
}

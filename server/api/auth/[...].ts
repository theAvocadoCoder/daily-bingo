import Auth0Provider from "next-auth/providers/auth0";
import {NuxtAuthHandler} from "#auth";
import { JWT } from "next-auth/jwt";
import User from "~/interfaces/User";

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,

  providers: [
    // @ts-expect-error
    Auth0Provider.default({
      clientId: useRuntimeConfig().authClientId,
      clientSecret: useRuntimeConfig().authClientSecret,
      issuer: useRuntimeConfig().authIssuerBaseURL,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // Session is valid for a week
    updateAge: 60 * 60, // Session token refreshes every hour
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user && (session.user as { token: JWT } & Partial<User>)._id) {
        return session;
      }

      const user = await $fetch("/api/auth/confirm-or-register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...session.user
        })
      });
      session.user = {
        ...token,
        ...user,
      };

      return session;
    },
    async redirect({url, baseUrl}) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  pages: {
    signOut: '/',
    newUser: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  }
})

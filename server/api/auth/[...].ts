import Auth0Provider from "next-auth/providers/auth0";
import {NuxtAuthHandler} from "#auth";

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
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...token,
        ...session.user,
      };

      return session;
    },
    async redirect({url, baseUrl}) {
      return `${baseUrl}`;
    }
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/signup'
  }
})

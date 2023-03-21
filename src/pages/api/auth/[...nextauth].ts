import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";

/*

Resources used:
- https://dev.to/srijans38/accessing-the-google-access-token-in-nextauth-js-2ep3
- https://github.com/nextauthjs/next-auth-example/blob/main/pages/api/auth/%5B...nextauth%5D.ts
- https://blog.openreplay.com/user-authentication-with-google-next-auth/
- https://authjs.dev/getting-started/upgrade-to-v4#callbacks

*/

export default NextAuth({
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.upload",
        },
      },
    }),
  ],
  secret: env.SECRET,
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   console.log("what is the url", url);
    //   return baseUrl;
    // },
    async jwt({ token, account }) {
      // docs: https://next-auth.js.org/getting-started/example#extensibility
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = String(token.accessToken);
      return session;
    },
  },
});

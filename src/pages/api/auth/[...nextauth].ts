import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";

export default NextAuth({
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
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
});

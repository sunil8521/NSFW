import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { mongoClient, mongoDb } from "@/lib/mongodb";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://nsfw-lime.vercel.app");

const secret =
  process.env.BETTER_AUTH_SECRET ||
  "zpo_super_secret_auth_key_2026_9876543210_token";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  "864163503623-3f314m8gq7e7cc5cdjlspe3d27vvpqi5.apps.googleusercontent.com";

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ||
  "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";

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),
  baseURL,
  secret,
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  user: {
    additionalFields: {
      u: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

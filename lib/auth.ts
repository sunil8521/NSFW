import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { mongoClient, mongoDb } from "@/lib/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

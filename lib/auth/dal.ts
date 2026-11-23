import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { mongoDb } from "@/lib/mongodb";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  u?: number;
}

export interface AuthSession {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

// Optional session check — returns null if unauthenticated (0 redirect)
export const getOptionalSession = cache(async (): Promise<AuthSession | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    return session as unknown as AuthSession;
  } catch {
    return null;
  }
});

// Require user to be logged in
export const verifySession = cache(async (): Promise<AuthSession> => {
  const session = await getOptionalSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
});

// Require user to have admin privilege (u: 1)
export const requireAdmin = cache(async (): Promise<AuthSession> => {
  const session = await verifySession();

  let userU = session.user.u;

  // Designated owner gets automatically upgraded to u: 1 in DB
  const adminEmail = process.env.ADMIN_EMAIL;
  if (userU !== 1 && adminEmail && session.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
    try {
      await mongoDb.collection("user").updateOne(
        { email: session.user.email },
        { $set: { u: 1 } }
      );
      session.user.u = 1;
      userU = 1;
    } catch (err) {
      console.error("Error setting admin role for owner:", err);
    }
  }

  if (userU !== 1) {
    // Standard user (u: 0) is forbidden from admin panel
    redirect("/");
  }

  return session;
});

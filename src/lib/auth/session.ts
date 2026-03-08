import { headers } from "next/headers";
import { auth } from "./better-auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, email, name, emailVerified } = session.user;
  return { id, email, name, emailVerified };
}

export async function assertAuthenticated(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  return user;
}

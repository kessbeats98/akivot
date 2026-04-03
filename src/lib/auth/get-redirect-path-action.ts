"use server";

import { headers } from "next/headers";
import { auth } from "./better-auth";
import { getUserRole } from "./get-user-role";

export async function getRedirectPath(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return "/login";

  const role = await getUserRole(session.user.id);

  switch (role) {
    case "walker":
    case "both":
      return "/walker/dashboard";
    case "owner":
      return "/owner/dashboard";
    case "none":
      return "/onboarding";
  }
}

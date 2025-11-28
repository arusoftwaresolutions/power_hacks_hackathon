"use client";

import useSWR from "swr";
import { swrFetcher } from "./api";

type UserRole = "USER" | "MODERATOR" | "ADMIN";

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

// Lightweight hook to read the current user without forcing a redirect
// when unauthenticated. Useful for conditional UI like showing admin links.
export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<MeResponse>(
    "/api/auth/me",
    swrFetcher<MeResponse>,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000,
    }
  );

  // If the request fails (401/403), we just treat it as "no user"
  if (error) {
    return { user: undefined, isLoading: false } as const;
  }

  return { user: data?.user, isLoading } as const;
}

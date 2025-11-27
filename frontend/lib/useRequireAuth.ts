"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

export function useRequireAuth() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<MeResponse>(
    "/api/auth/me",
    swrFetcher<MeResponse>
  );

  useEffect(() => {
    if (error) {
      const next = encodeURIComponent(
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/dashboard"
      );
      router.replace(`/login?next=${next}`);
    }
  }, [error, router]);

  return { user: data?.user, isLoading };
}

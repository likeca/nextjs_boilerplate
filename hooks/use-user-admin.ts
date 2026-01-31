"use client";

import { useEffect, useState } from "react";

export function useUserAdmin(userId?: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    async function checkAdmin() {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [userId]);

  return { isAdmin, isLoading };
}

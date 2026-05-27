"use client";

import { request } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ListsPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    request<AuthUser>("/auth/me")
      .then(() => {
        if (active) {
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          router.replace("/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[var(--vault-bg)] px-6 py-8 text-[var(--vault-muted)]">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--vault-bg)] px-6 py-8 text-[var(--vault-text)]">
      Lists
    </main>
  );
}

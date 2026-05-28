"use client";

import { useEffect, useState } from "react";
import ProfileSummary from "@/components/profile/profileSummary";
import ProfileFavorites from "@/components/profile/profileFavorites";
import ProfileRecentReviews from "@/components/profile/profileRecentReviews";
import type { ProfileResponse } from "@/lib/types/profile";
import { request } from "@/lib/api";
import { useRouter } from "next/navigation";




export default function Page() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        request<ProfileResponse>("/profiles/me")
            .then((data) => {
                if (active) {
                    setProfile(data);
                }
            })
            .catch((error) => {
                if (active) {
                    setError(error instanceof Error ? error.message : "Unable to load profile.");
                    router.replace("/login");
                }
            });

        return () => {
            active = false;
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-[var(--vault-bg)]">
            <main className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-12 px-6 py-7 md:px-9">
                {error && (
                    <p className="rounded-md border border-[var(--vault-danger)]/40 bg-[var(--vault-danger)]/10 px-4 py-3 text-sm text-[var(--vault-danger)]">
                        {error}
                    </p>
                )}

                {!profile && !error && (
                    <p className="text-[var(--vault-muted)]">Loading profile...</p>
                )}

                {profile && (
                    <>
                        <ProfileSummary user={profile.user} stats={profile.stats} />
                        <ProfileFavorites favorites={profile.favorites} />
                        <ProfileRecentReviews reviews={profile.recent_reviews} />
                    </>
                )}
            </main>
        </div>
    );
}

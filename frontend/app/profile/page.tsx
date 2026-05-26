"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProfileSummary from "@/components/profile/profileSummary";
import ProfileFavorites from "@/components/profile/profileFavorites";
import ProfileRecentReviews from "@/components/profile/profileRecentReviews";
import type { ProfileResponse } from "@/lib/types/profile";
import { request } from "@/lib/api";




export default function Page() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        request<ProfileResponse>("/profiles/me")
            .then((data) => {
                setProfile(data);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    return (
        <div className="min-h-screen bg-[var(--vault-bg)]">
            <Header />

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

            <Footer />
        </div>
    );
}

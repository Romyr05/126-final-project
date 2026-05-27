"use client";

import Link from "next/link";
import { request } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {type AuthUser } from "@/lib/auth";

export default function Header(){
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loaded, setLoaded] = useState(false);  //Checking purposes

    const refreshCurrentUser = useCallback(() => {
        setLoaded(false);
        request<AuthUser>("/auth/me")
            .then((currentUser) => {
                setUser(currentUser);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoaded(true);
            });
    }, []);

    useEffect(() => {
        let isMounted = true;

        request<AuthUser>("/auth/me")
            .then((currentUser) => {
                if (isMounted) {
                    setUser(currentUser);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUser(null);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoaded(true);
                }
            });

        window.addEventListener("vault-auth-changed", refreshCurrentUser);

        return () => {
            isMounted = false;
            window.removeEventListener("vault-auth-changed", refreshCurrentUser);
        };
    }, [refreshCurrentUser]);

    const profileName = user?.username?.trim() || user?.email?.trim() || "Profile";
    const profileLabel = loaded && !user ? "Login" : profileName;
    const profileHref = loaded && !user ? "/login" : "/profile";
    const profileTextClass =
        profileLabel.length > 24
            ? "text-[11px] leading-none"
            : profileLabel.length > 16
                ? "text-xs leading-none": profileLabel.length > 10 ? "text-sm" : "text-base";

return(
    <header>
        <div className="border-b border-[var(--vault-border)] bg-[var(--vault-bg)]">
            <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center px-8">  
                <Link href = "/" className="justify-self-start text-4xl font-black !text-[var(--vault-purple)] ">
                    VAULT
                </Link>

            <nav className="flex items-center gap-8 justify-self-center">
                <Link href = "/catalog" className="hover:!text-[var(--vault-purple)]">Catalog</Link>
                <Link href = "/Journal" className="hover:!text-[var(--vault-purple)]">Journal</Link>
                <Link href = "/landingPage" className="hover:!text-[var(--vault-purple)]">Feed</Link>
            </nav>
            
                <Link
                    href={profileHref}
                    title={profileLabel}
                    className="justify-self-end flex h-10 max-w-40 min-w-0 items-center justify-center rounded-full border border-[var(--vault-border-strong)] px-4 py-2 font-medium hover:!text-[var(--vault-purple)]"
                >
                    <span className={`block min-w-0 truncate whitespace-nowrap ${profileTextClass}`}>
                        {profileLabel}
                    </span>
                </Link>
            </div>

        </div>

    </header>
)

}

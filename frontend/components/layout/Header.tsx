"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { request } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {type AuthUser } from "@/lib/auth";

const navItems = [
    { label: "Home", href: "/landingPage", activePaths: ["/", "/landingPage"] },
    { label: "Catalog", href: "/catalog", activePaths: ["/catalog"] },
    { label: "Journal", href: "/Journal", activePaths: ["/Journal"] },
];

export default function Header(){
    const pathname = usePathname();
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
                <Link href = "/" className="relative block h-10 w-36 justify-self-start overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)] focus:ring-offset-2 focus:ring-offset-[var(--vault-bg)]">
                    <Image
                        src="/images/707943536_970877018910743_8750370338733159474_n.png"
                        alt="Vault"
                        width={416}
                        height={214}
                        priority
                        sizes="208px"
                        className="absolute -left-[2.9rem] -top-[2.15rem] h-auto w-[13rem] max-w-none"
                    />
                </Link>

            <nav className="flex items-center gap-8 justify-self-center">
                {navItems.map((item) => {
                    const isActive = item.activePaths.some((path) => (
                        pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
                    ));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`relative py-2 font-medium transition hover:!text-[var(--vault-purple)] ${
                                isActive ? "!text-[var(--vault-purple)]" : "text-[var(--vault-text)]"
                            }`}
                        >
                            {item.label}
                            <span
                                className={`absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[var(--vault-purple)] transition ${
                                    isActive ? "opacity-100" : "opacity-0"
                                }`}
                                aria-hidden="true"
                            />
                        </Link>
                    );
                })}
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

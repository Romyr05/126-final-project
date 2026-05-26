import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--vault-border)] bg-[var(--vault-bg)]">
            <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <p className="text-xl font-black tracking-[0.03em] text-[var(--vault-text)]">
                        VAULT
                    </p>
                    <p className="text-sm font-bold text-[var(--vault-cyan)]">
                        &copy;2026 CMSC 126
                    </p>
                </div>

                <nav
                    aria-label="Footer navigation"
                    className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[var(--vault-muted)]"
                >
                    <Link href="/about" className="text-[var(--vault-muted)] transition-colors hover:!text-[var(--vault-purple)]">
                        About
                    </Link>
                    <Link href="/privacy" className="text-[var(--vault-muted)] transition-colors hover:!text-[var(--vault-purple)]">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-[var(--vault-muted)] transition-colors hover:!text-[var(--vault-purple)]">
                        Terms
                    </Link>
                    <Link href="/api" className="text-[var(--vault-muted)] transition-colors hover:!text-[var(--vault-purple)]">
                        API
                    </Link>
                    <Link href="/help" className="text-[var(--vault-muted)] transition-colors hover:!text-[var(--vault-purple)]">
                        Help
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
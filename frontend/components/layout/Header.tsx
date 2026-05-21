import Link from "next/link";

export default function Header(){

return(
    <header>
        <div className="border-b border-[var(--vault-border)] bg-[var(--vault-bg)]">
            <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center px-8">  
                <Link href = "/" className="justify-self-start text-4xl font-black !text-[var(--vault-purple)] ">
                    VAULT
                </Link>

            <nav className="flex items-center gap-8 justify-self-center">
                <Link href = "/catalog" className="hover:!text-[var(--vault-purple)]">Catalog</Link>
                <Link href = "/journal" className="hover:!text-[var(--vault-purple)]">Journal</Link>
                <Link href = "/landingPage" className="hover:!text-[var(--vault-purple)]">Home</Link>
            </nav>
            
                <Link href = "/profile" className="justify-self-end rounded-full border border-[var-(--vault-border-strong)] px-5 py-2 !text-[var(--vault-purple)]">Profile</Link>
            </div>

        </div>

    </header>
)

}
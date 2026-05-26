import Link from "next/link"
import NavLink from "./NavLink"

export default function Header() {
  return (
    <header className="flex items-center gap-6 px-8 py-4 border-b border-white/10">
      <Link href="/" className="text-xl font-bold">
        Game<span className="text-yellow-400">flix</span>
      </Link>
      <nav className="flex items-center gap-6">
        <NavLink text="Catalog" href="/catalog" />
        <NavLink text="Journal" href="/Journal" />
        <NavLink text="Lists" href="/lists" />
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <NavLink text="Login" href="/login" />
        <NavLink text="Register" href="/signup" />
      </div>
    </header>
  )
}
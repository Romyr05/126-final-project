/*
this is the header of the landing page
this is the "Header.tsx"
header with a navigation links
*/

import NavLink from "./NavLink";
import GameCard from "./GameCard";

const navItems = [
  { text: "Journal", href: "/Journal" },
  { text: "Games", href: "/games" },
  
  { text: "Add nav here", href: "/addNav Here" } // add nav items here
]

export default function Header() {
  return (
    <header className="flex items-center gap-4 p-4 border-b">
      {navItems.map((item) => (
        <NavLink key={item.href} text={item.text} href={item.href} />
      ))}
    </header>
  )
}
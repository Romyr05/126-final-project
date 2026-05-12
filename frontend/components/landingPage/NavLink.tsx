/*
this is a component to be used to be able to go through other pages, like in the header
of the landing page
this is the "NavLink.tsx"
*/

//create an object to be used for the NavLink component
import Link from "next/link"

type NavLinkProps = {
  text: string
  href: string
}

export default function NavLink({ text, href }: NavLinkProps) {
  return (
    <Link href={href}>
      {text}
    </Link>
  )
}
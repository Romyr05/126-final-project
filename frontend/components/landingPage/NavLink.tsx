/*
this is a component to be used to be able to go through other pages, like in the header
of the landing page
this is the "NavLink.tsx"
*/

//create an object to be used for the NavLink component
type NavLinkProps = {
  text: string;
  href: string;
};

function NavLink({ text, href }: NavLinkProps) {
    return (
    <div>
        <a className = "" href={href}>{text}</a> 
    </div>
    
  );
}

export default NavLink;
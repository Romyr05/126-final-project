/*
this is the header of the landing page
this is the "Header.tsx"
*/
import "tailwindcss";

import NavLink from "./NavLink";
import GameCard from "./GameCard";

//compiles all the components to form the Header of the landing page
function Header() {
    return (
        <div className="">
            <NavLink text="Journal" href=""/>
            <NavLink text="Somewhere" href="" />
            <hr></hr>
            <GameCard title = 'Game 1' imageStr=""></GameCard>
        </div>
            
        
        

    )
}

export default Header;
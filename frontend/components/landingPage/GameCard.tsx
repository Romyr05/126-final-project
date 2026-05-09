/*
this is a component that shows a game and its image
this is the "GameCard.tsx"
*/

//create an object
type GameCardProps = {
    title: string,
    imageStr: string
}


//function that takes in an object as a parameter
function GameCard({ title, imageStr }: GameCardProps) {
    let img = imageStr;
    
    return (
        <div className = "">
            <h1>{title}</h1>
            <img src='/images/dummyGameImg.png' alt='minecraft'></img>
        </div>
            
        
    );
    
}


export default GameCard;
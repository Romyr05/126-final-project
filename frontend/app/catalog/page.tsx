import GameCardCatalog from "@/components/catalog/GameCardCatalog";

export default function CatalogPage() {
    return (
        <div className="">
            <GameCardCatalog
                limit={40}
                offset={67}
            />
        </div>
    );
}

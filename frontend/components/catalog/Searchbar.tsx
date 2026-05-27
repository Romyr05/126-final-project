"use client";

type Data = {
    setSearchQuery : (newQuery : string) => void
}

export default function Searchbar(data : Data) {
    return (<input
        type="text"
        placeholder="Search..."
        className="
            w-full
            rounded-lg
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
        "
        // when any change is detected in input, use callback to set
        // query and the catalog will automatically update
        onChange={(e) => data.setSearchQuery("Arena")}
    />);
}
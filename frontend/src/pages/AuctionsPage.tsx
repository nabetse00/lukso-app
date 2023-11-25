import { useLoaderData } from "react-router-dom";


export function Component(){
    const data = useLoaderData();
    console.log("here")
    return <p>
        Auctions here {data as string}
    </p>
}

Component.displayName = "MainPageRoute";
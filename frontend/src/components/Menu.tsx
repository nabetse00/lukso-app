import { Link } from "react-router-dom"
import { Menu } from '../types/menu.ts';

interface Props {
    menu: Menu
}

export default function MenuComponent({ menu }: Props) {


    return (
        <>
            {menu.map(e => {
                return (<li>
                    <Link to={e.path}>{e.description}</Link>
                </li>)
            })}
        </>
    )
}
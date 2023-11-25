import logo from "../assets/logo.svg"
import ConnectWallet from "./ConnectUniversalProfile"
import MenuComponent from "./Menu"
import { menu } from "../main"

export default function NavBar() {


    return (

        <div className="navbar pb-6 bg-black/30">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <MenuComponent menu={menu} />
                    </ul>
                </div>
                <a className="btn btn-ghost text-xl">
                    <img src={logo} width="50px" alt="Lukso Auction Logo" />
                    <div className="flex flex-col">

                        <div className="text-left">
                            Lukso
                        </div>
                        <div className="text-left">
                            Auction
                        </div>
                    </div>
                </a>
            </div>
            <div className="navbar-center hidden md:flex">
                <ul className="menu menu-horizontal px-1">
                    <MenuComponent menu={menu} />
                </ul>
            </div>
            <div className="navbar-end">
                <ConnectWallet />
            </div>
        </div>

    )
}
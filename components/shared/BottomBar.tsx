"use client";

import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const sidebarLinks = [
    {
      imgURL: "/assets/home.svg",
      route: "/",
      label: "Home",
    },
    {
      imgURL: "/assets/search.svg",
      route: "/search",
      label: "Search",
    },
    {
      imgURL: "/assets/heart.svg",
      route: "/activity",
      label: "Activity",
    },
    {
      imgURL: "/assets/create.svg",
      route: "/create-thread",
      label: "Create Thread",
    },
    {
      imgURL: "/assets/community.svg",
      route: "/communities",
      label: "Communities",
    },
    {
      imgURL: "/assets/user.svg",
      route: "/profile",
      label: "Profile",
    },
]; 


function BottomBar() {

    const router = useRouter();
    const pathname = usePathname();
    const { userId } = useAuth();

    return (
        <section className="bottombar">
            <div className="bottombar_container">
            {sidebarLinks.map((link) => {
                    
                    const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

                    if (link.route === "/profile") {
                      link.route = `${link.route}/${userId}`
                    }

                    return (
                        <Link href={link.route} key={link.label} className={`bottombar_link ${isActive && "bg-primary-500"}`} >
                            <Image src={link.imgURL} alt={link.label} width={24} height={24} />
                            <p className="text-subtle-medium text-light-1 max-sm:hidden">
                                {link.label.split(/\s+/)[0]}
                            </p>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
};

export default BottomBar;
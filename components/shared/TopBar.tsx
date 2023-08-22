"use client";

import { OrganizationSwitcher, SignOutButton, SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { dark } from "@clerk/themes";
import { useRouter } from "next/navigation";

function TopBar() {

    const router = useRouter();

    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
                <Image src="/assets/logo.png" alt="logo" width={30} height={30} />
                <p className="text-heading3-bold text-light-1 max-xs:hidden">
                    Bebenang
                </p>
            </Link>

            {/* contain the navigation setup */}
            <div className="flex items-center gap-1">
                {/* contain a sign out button onl when signed in */}
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton signOutCallback={() => router.push("/sign-in")}>
                            <div className="flex cursor-pointer">
                                <Image src="/assets/logout.svg" alt="logout" width={24} height={24} />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>

                {/*  */}
                <OrganizationSwitcher
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            organizationSwitcherTrigger: "py-2 px-4",
                        }
                    }}
                 />

            </div>
        </nav>
    )
};

export default TopBar;
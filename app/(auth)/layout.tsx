// This layout will only be applied for the (auth) group

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import React from "react";

import "../globals.css";

export const metadata = {
    title: "Bebenang",
    description: "Threads Application Clone via Next.js",
};

const inter = Inter({ subsets: ["latin"] });

// Have "children" as props
// In most cases, layout will have "children" because we will display something within it
// the type of "children" will be a type React.ReactNode
export default function RootLayout({ 
    children 
} : { 
    children: React.ReactNode 
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1`}>
                    <div className="w-full flex justify-center items-center min-h-screen">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
};
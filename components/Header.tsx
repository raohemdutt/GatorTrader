"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the user on initial load
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
    }

    fetchUser();

    // Set up the auth listener to update userId when authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id || null);
      }
    );

    // Cleanup listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    window.location.href = "/login"; // Redirect to login after logout
  };

  return (
    <header className="w-full bg-primary text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/*  Logo */}
        <Link href="/about" className="flex items-center space-x-2">
          <Image
            src="/icons/Gator Trader.png"
            alt="GatorTrader Icon"
            width={70}
            height={70}
          />
        </Link>

        {/* Centered Text */}
        <div className="text-center flex-grow ml-8">
          <h1 className="text-lg font-semibold">
            Connecting Gators for Seamless Trading
          </h1>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center space-x-6">
          {userId ? (
            <>
              <NavLink href={`/dashboard/${userId}`}>Dashboard</NavLink>
              <NavLink href="/messages">Messages</NavLink>
              <NavLink href="/my_products"> My Listings</NavLink>
              <NavLink href={`/transactions/${userId}`}> Transactions</NavLink>
              <NavLink href={`/profile/${userId}`}>Profile</NavLink>

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-white bg-transparent border-none hover:bg-gray-700"
                  >
                    More ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black w-40 mt-2">
                  <DropdownMenuItem asChild>
                    {/* <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">About</Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/contact"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Contact
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              {/* <NavLink href="/login">Login</NavLink>
              <NavLink href="/signup">Sign Up</NavLink> */}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// Reusable NavLink Component
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link href={href} className="text-white hover:underline transition">
      {children}
    </Link>
  );
};

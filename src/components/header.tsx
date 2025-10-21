"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onAuthClick: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { isAuthenticated, user, loading, logout } = useAuth();

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          OMR Quiz Master
        </h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user?.photoURL ?? undefined} />
                 <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
               <span className="text-sm font-medium hidden sm:inline">{user?.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={onAuthClick}>
              <LogIn className="mr-2 h-4 w-4" />
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

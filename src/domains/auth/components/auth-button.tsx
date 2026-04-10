"use client";

import { LogIn, LogOut, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useState } from "react";

import { LIBRARY_COLLECTIONS_ROUTE } from "@/features/library/routes";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { useAuth } from "../hooks";

import { AuthDialog } from "./auth-dialog";

export const AuthButton = memo(function AuthButton() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSignInClick = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  if (isLoading) {
    return <div className="size-8 animate-pulse rounded-full bg-slate-200" />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSignInClick}
          aria-label="Sign in"
          className="text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
        >
          <LogIn className="size-4" />
        </Button>
        <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  if (!user) {
    return null;
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-full border border-white/80 bg-white text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.16)] transition-opacity outline-none hover:opacity-80"
        aria-label="Account menu"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2" render={<Link href="/profile" />}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" render={<Link href={LIBRARY_COLLECTIONS_ROUTE} />}>
          <BookOpen className="size-4" />
          Collections
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

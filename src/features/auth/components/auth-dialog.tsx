"use client";

import { memo, useCallback, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { SignInForm, SignUpForm } from "./auth-dialog-parts";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = memo(function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<string>("signin");

  const handleSuccess = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tab === "signin" ? "Welcome Back" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {tab === "signin"
              ? "Sign in to save your name history and location collections."
              : "Create an account to personalize your Spyfall experience."}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
});

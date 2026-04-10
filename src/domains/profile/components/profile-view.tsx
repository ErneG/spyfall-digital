"use client";

import { BookOpen, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { LIBRARY_COLLECTIONS_ROUTE } from "@/features/library/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

import { getProfile, getNameHistory, updateProfile, deleteNameFromHistory } from "../actions";

import { NameHistoryList } from "./name-history-list";

import type { ProfileOutput, NameHistoryItem } from "../schema";

export function ProfileView() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileOutput | null>(null);
  const [names, setNames] = useState<NameHistoryItem[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    const load = async () => {
      const [profileResult, namesResult] = await Promise.all([getProfile(), getNameHistory()]);
      if (profileResult.success) {
        setProfile(profileResult.data);
        setDisplayName(profileResult.data.displayName ?? profileResult.data.name);
      }
      if (namesResult.success) {
        setNames(namesResult.data);
      }
    };
    void load();
  }, [isAuthenticated, authLoading, router]);

  const handleSaveDisplayName = useCallback(async () => {
    if (!displayName.trim()) {
      return;
    }
    setSaving(true);
    const result = await updateProfile({ displayName: displayName.trim() });
    if (result.success) {
      setProfile((previous) =>
        previous ? { ...previous, displayName: result.data.displayName } : previous,
      );
    }
    setSaving(false);
  }, [displayName]);

  const handleDeleteName = useCallback(async (name: string) => {
    setDeleting(true);
    const result = await deleteNameFromHistory({ name });
    if (result.success) {
      setNames((previous) => previous.filter((n) => n.name !== name));
    }
    setDeleting(false);
  }, []);

  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value),
    [],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [signOut, router]);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]">
        <div className="size-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 items-start justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.48),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] p-4 pt-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-bold text-slate-950">Profile</h1>
        </div>

        {/* Account Info */}
        <section className="space-y-4 rounded-2xl border border-white/80 bg-white/82 p-4 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
              {(profile.displayName ?? profile.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-950">{profile.displayName ?? profile.name}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                onChange={handleDisplayNameChange}
                maxLength={30}
              />
              <Button size="sm" onClick={handleSaveDisplayName} disabled={saving}>
                {saving ? "..." : "Save"}
              </Button>
            </div>
          </div>
        </section>

        {/* Name History */}
        <section className="space-y-3 rounded-2xl border border-white/80 bg-white/82 p-4 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-950">Name History</h2>
          <NameHistoryList names={names} onDelete={handleDeleteName} isDeleting={deleting} />
        </section>

        {/* Collections Link */}
        <Button
          variant="outline"
          className="w-full justify-start gap-3 rounded-full border-slate-200 bg-white/86 text-slate-700 hover:bg-white hover:text-slate-950"
          onClick={() => router.push(LIBRARY_COLLECTIONS_ROUTE)}
        >
          <BookOpen className="size-4" />
          My Collections
          <span className="text-muted-foreground ml-auto text-sm">{profile.collectionCount}</span>
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className="text-destructive w-full justify-start gap-3 rounded-full hover:bg-[#fff1f2]"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </main>
  );
}

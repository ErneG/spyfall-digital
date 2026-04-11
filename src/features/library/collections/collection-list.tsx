"use client";

import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/entities/auth/use-auth";
import { createCollection, deleteCollection, getCollections } from "@/entities/library/actions";
import { type CollectionListItem } from "@/entities/library/collection";
import { getLibraryCollectionRoute, LIBRARY_ROUTE } from "@/features/library/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { CollectionCard } from "./collection-list-parts";

export function CollectionListView() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    const loadCollections = async () => {
      const result = await getCollections();
      if (cancelled) {
        return;
      }
      if (result.success) {
        setCollections(result.data);
      }
      setLoading(false);
    };
    void loadCollections();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, router]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      return;
    }
    setCreating(true);
    const result = await createCollection({ name: newName.trim() });
    if (result.success) {
      router.push(getLibraryCollectionRoute(result.data.id));
    }
    setCreating(false);
  }, [newName, router]);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteCollection(id);
    if (result.success) {
      setCollections((previous) => previous.filter((c) => c.id !== id));
    }
  }, []);

  const handleNewNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value),
    [],
  );

  const handleBack = useCallback(() => router.push(LIBRARY_ROUTE), [router]);
  const handleToggleCreate = useCallback(() => setShowCreate((previous) => !previous), []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]">
        <div className="size-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.55),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-[36px] border border-white/80 bg-white/68 p-5 shadow-[0_40px_120px_rgba(148,163,184,0.22)] backdrop-blur-2xl sm:p-7">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              aria-label="Back"
              className="rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Collections
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Curated room packs
              </h1>
              <p className="mt-2 text-xs font-medium text-slate-500">Library / Collections</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleCreate}
              aria-label="New"
              className="rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Build reusable location packs from your saved locations, then import them into rooms or
            pass-and-play without rebuilding the same role lists every time.
          </p>

          {showCreate ? (
            <div className="mt-6 rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.9))] p-5 shadow-[0_24px_70px_rgba(186,230,253,0.22)]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Collection name"
                  value={newName}
                  onChange={handleNewNameChange}
                  maxLength={50}
                  autoFocus
                  className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={creating}
                  className="rounded-full border border-slate-950/5 bg-slate-950 px-5 text-white hover:bg-slate-900"
                >
                  {creating ? "Creating…" : "Create"}
                </Button>
              </div>
            </div>
          ) : null}

          {collections.length === 0 && !showCreate ? (
            <div className="space-y-3 rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <BookOpen className="mx-auto size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-950">No collections yet</p>
              <p className="text-sm leading-6 text-slate-500">
                Start with one curated pack so rooms and pass-and-play can reuse it later.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleCreate}
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                <Plus className="mr-1.5 size-3.5" />
                Create your first collection
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {collections.map((c) => (
                <CollectionCard key={c.id} collection={c} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

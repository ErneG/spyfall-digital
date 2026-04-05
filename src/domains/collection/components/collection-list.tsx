"use client";

import { Plus, BookOpen, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { getCollections, createCollection, deleteCollection } from "../actions";

import type { CollectionListItem } from "../schema";

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
    getCollections().then((result) => {
      if (result.success) {
        setCollections(result.data);
      }
      setLoading(false);
    });
  }, [isAuthenticated, authLoading, router]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      return;
    }
    setCreating(true);
    const result = await createCollection({ name: newName.trim() });
    if (result.success) {
      router.push(`/collections/${result.data.id}`);
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

  const handleBack = useCallback(() => router.push("/"), [router]);
  const handleToggleCreate = useCallback(() => setShowCreate((previous) => !previous), []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="bg-surface-2 size-8 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 items-start justify-center bg-black p-4 pt-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="flex-1 text-xl font-bold text-white">My Collections</h1>
          <Button variant="ghost" size="icon-sm" onClick={handleToggleCreate} aria-label="New">
            <Plus className="size-4" />
          </Button>
        </div>

        {showCreate && (
          <div className="flex gap-2">
            <Input
              placeholder="Collection name"
              value={newName}
              onChange={handleNewNameChange}
              maxLength={50}
              autoFocus
            />
            <Button size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? "..." : "Create"}
            </Button>
          </div>
        )}

        {collections.length === 0 && !showCreate ? (
          <div className="space-y-3 py-12 text-center">
            <BookOpen className="text-muted-foreground/40 mx-auto size-10" />
            <p className="text-muted-foreground text-sm">No collections yet</p>
            <Button variant="outline" size="sm" onClick={handleToggleCreate}>
              <Plus className="mr-1.5 size-3.5" />
              Create your first collection
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Card ────────────────────────────────────────────────────

interface CollectionCardProps {
  collection: CollectionListItem;
  onDelete: (id: string) => void;
}

const CollectionCard = memo(function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/collections/${collection.id}`);
  }, [router, collection.id]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(collection.id);
    },
    [onDelete, collection.id],
  );

  return (
    <button
      onClick={handleClick}
      className="bg-surface-1 hover:bg-surface-2 flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#8B5CF6]/12">
        <BookOpen className="size-5 text-[#8B5CF6]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{collection.name}</p>
        <p className="text-muted-foreground text-xs">
          {collection.locationCount} location{collection.locationCount !== 1 ? "s" : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDelete}
        aria-label={`Delete ${collection.name}`}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </button>
  );
});

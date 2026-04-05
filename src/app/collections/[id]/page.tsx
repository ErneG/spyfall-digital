"use client";

import { useParams } from "next/navigation";

import { CollectionEditor } from "@/domains/collection/components/collection-editor";

export default function CollectionPage() {
  const params = useParams<{ id: string }>();
  return <CollectionEditor collectionId={params.id} />;
}

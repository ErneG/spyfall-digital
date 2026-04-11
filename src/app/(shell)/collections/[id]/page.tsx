import { redirect } from "next/navigation";

import { getLibraryCollectionRoute } from "@/features/library/routes";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  redirect(getLibraryCollectionRoute(id));
}

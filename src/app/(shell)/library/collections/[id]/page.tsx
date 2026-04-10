import { CollectionEditor } from "@/features/library/collections/collection-editor";

interface LibraryCollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LibraryCollectionPage({ params }: LibraryCollectionPageProps) {
  const { id } = await params;

  return <CollectionEditor collectionId={id} />;
}

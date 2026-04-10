import { CollectionEditor } from "@/domains/collection/components/collection-editor";

interface LibraryCollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LibraryCollectionPage({ params }: LibraryCollectionPageProps) {
  const { id } = await params;

  return <CollectionEditor collectionId={id} />;
}

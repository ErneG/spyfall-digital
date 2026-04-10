import { CollectionEditor } from "@/domains/collection/components/collection-editor";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  return <CollectionEditor collectionId={id} />;
}

import { CollectionEditor } from "@/domains/collection/components/collection-editor";

export default async function CollectionPage(props: PageProps<"/collections/[id]">) {
  const { id } = await props.params;

  return <CollectionEditor collectionId={id} />;
}

import { redirect } from "next/navigation";

import { LIBRARY_COLLECTIONS_ROUTE } from "@/features/library/routes";

export default function CollectionsPage() {
  redirect(LIBRARY_COLLECTIONS_ROUTE);
}

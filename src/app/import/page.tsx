import { getAllCategories } from "@/lib/queries/categories";
import ImportWizard from "@/components/import/ImportWizard";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Import Bank Statement</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ImportWizard categories={categories} />
      </div>
    </div>
  );
}

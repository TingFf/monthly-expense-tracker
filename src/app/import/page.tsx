import Link from "next/link";
import { getAllCategories } from "@/lib/queries/categories";
import ImportWizard from "@/components/import/ImportWizard";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import Bank Statement</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transactions are auto-categorized using your{" "}
          <Link href="/categories" className="text-blue-600 hover:underline">
            keyword rules
          </Link>
          .
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ImportWizard categories={categories} />
      </div>
    </div>
  );
}

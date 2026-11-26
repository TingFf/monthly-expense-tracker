import { getAllCategories } from "@/lib/queries/categories";
import CategoryForm from "@/components/categories/CategoryForm";
import CategoryList from "@/components/categories/CategoryList";
import KeywordRules from "@/components/categories/KeywordRules";
import { getAllKeywords } from "@/lib/queries/keywords";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = getAllCategories();
  const keywords = getAllKeywords();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="font-medium mb-3 text-sm text-gray-600">Add a new category</h2>
        <CategoryForm />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <CategoryList categories={categories} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <KeywordRules categories={categories} keywords={keywords} />
      </div>
    </div>
  );
}

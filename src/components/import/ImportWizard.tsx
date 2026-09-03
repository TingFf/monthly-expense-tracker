"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/types";
import type { ImportPreviewMeta, ImportPreviewResponse, ParsedTransaction } from "@/lib/import/types";
import ImportUploadForm from "@/components/import/ImportUploadForm";
import ImportPreviewTable from "@/components/import/ImportPreviewTable";

type Stage =
  | { name: "idle" }
  | { name: "parsing" }
  | { name: "preview"; meta: ImportPreviewMeta; rows: ParsedTransaction[] }
  | { name: "committing"; meta: ImportPreviewMeta; rows: ParsedTransaction[] }
  | { name: "done"; created: number; skipped: number }
  | { name: "error"; message: string };

export default function ImportWizard({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ name: "idle" });

  async function handleUpload(file: File) {
    setStage({ name: "parsing" });

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/import/parse", { method: "POST", body: formData });
    const body = await res.json();

    if (!res.ok) {
      setStage({ name: "error", message: body.error ?? "Could not parse this file." });
      return;
    }

    const { meta, transactions } = body as ImportPreviewResponse;
    setStage({ name: "preview", meta, rows: transactions });
  }

  function handleRowChange(
    row_index: number,
    patch: Partial<Pick<ParsedTransaction, "include" | "suggested_category_id">>
  ) {
    if (stage.name !== "preview") return;
    setStage({
      ...stage,
      rows: stage.rows.map((row) => (row.row_index === row_index ? { ...row, ...patch } : row)),
    });
  }

  function handleSelectAll(include: boolean) {
    if (stage.name !== "preview") return;
    setStage({ ...stage, rows: stage.rows.map((row) => ({ ...row, include })) });
  }

  async function handleCommit() {
    if (stage.name !== "preview") return;
    const { meta, rows } = stage;
    setStage({ name: "committing", meta, rows });

    const items = rows
      .filter((row) => row.include)
      .map((row) => ({
        amount_cents: row.amount_cents,
        category_id: row.suggested_category_id,
        description: row.description,
        date: row.date,
        payment_method: "bank_transfer" as const,
      }));

    if (items.length === 0) {
      setStage({ name: "preview", meta, rows });
      return;
    }

    const res = await fetch("/api/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const body = await res.json();

    if (!res.ok) {
      setStage({ name: "error", message: "Could not import these expenses. Please try again." });
      return;
    }

    setStage({ name: "done", created: body.created_count, skipped: body.skipped_duplicate_count });
    router.refresh();
  }

  if (stage.name === "idle" || stage.name === "parsing") {
    return <ImportUploadForm disabled={stage.name === "parsing"} onSubmit={handleUpload} />;
  }

  if (stage.name === "error") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{stage.message}</p>
        <button
          onClick={() => setStage({ name: "idle" })}
          className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (stage.name === "done") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Imported {stage.created} expense{stage.created === 1 ? "" : "s"}
          {stage.skipped > 0 && ` (${stage.skipped} duplicate(s) skipped)`}.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStage({ name: "idle" })}
            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700"
          >
            Import another statement
          </button>
          <button
            onClick={() => router.push("/expenses")}
            className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
          >
            View expenses
          </button>
        </div>
      </div>
    );
  }

  // preview or committing
  const { meta, rows } = stage;
  const selectedCount = rows.filter((r) => r.include).length;

  return (
    <div className="space-y-4">
      <ImportPreviewTable
        meta={meta}
        rows={rows}
        categories={categories}
        onChange={handleRowChange}
        onSelectAll={handleSelectAll}
      />
      <div className="flex gap-3">
        <button
          onClick={handleCommit}
          disabled={stage.name === "committing" || selectedCount === 0}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {stage.name === "committing" ? "Importing…" : `Import ${selectedCount} selected`}
        </button>
        <button
          onClick={() => setStage({ name: "idle" })}
          disabled={stage.name === "committing"}
          className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function ImportUploadForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (file) onSubmit(file);
      }}
      className="space-y-4 max-w-md"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Bank statement (CSV or PDF)</label>
        <input
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload a CSV or PDF export from DBS/POSB, OCBC, UOB, or most other SG banks. PDF
          parsing is best-effort — always review the table before importing.
        </p>
      </div>

      <button
        type="submit"
        disabled={disabled || !file}
        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
      >
        {disabled ? "Parsing…" : "Parse statement"}
      </button>
    </form>
  );
}

import Link from "next/link";
import { PropertyCreateForm } from "./ui/property-create-form";

export default function NewPropertyPage() {
  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/properties?listing=sale"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Properties
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          New property
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add an instruction to track viewings and buyer feedback.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <PropertyCreateForm />
        </div>
      </div>
    </div>
  );
}

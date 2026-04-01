import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPropertyForCompany } from "@/lib/properties/queries";
import { NewViewingForm } from "./ui/new-viewing-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function NewViewingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }

  const { id: propertyId } = await params;
  const property = await getPropertyForCompany(
    propertyId,
    session.user.companyId,
  );
  if (!property) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/properties/${propertyId}`}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            ← {property.address}
          </Link>
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Schedule viewing
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {property.postcode} · {property.vendor_name}
        </p>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <NewViewingForm propertyId={propertyId} />
        </div>

        <p className="mt-6 text-center">
          <Link
            href={`/properties/${propertyId}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}

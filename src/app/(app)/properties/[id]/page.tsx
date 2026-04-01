import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCompanyPrequalShareTemplates } from "@/lib/companies/queries";
import { getPropertyForCompany } from "@/lib/properties/queries";
import { prequalShareTemplatesInputFromRow } from "@/lib/prequal/share-outreach";
import { PropertyViewingsCard } from "./property-viewings-card";
import { PropertyFeedbackCard } from "./property-feedback-card";
import { PropertyShareLinksCard } from "@/components/property-share-links-card";
import { PropertyHeroImageCard } from "./property-hero-image-card";
import { PropertyLettingPrequalCard } from "./property-letting-prequal-card";
import { PropertySalePrequalCard } from "./property-sale-prequal-card";
import { Suspense } from "react";
import { PropertyStatusSelect } from "@/components/property-status-select";
import { cn } from "@/lib/utils";

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }

  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab === "feedback" ? "feedback" : "overview";

  const [property, prequalShareRow] = await Promise.all([
    getPropertyForCompany(id, session.user.companyId),
    getCompanyPrequalShareTemplates(session.user.companyId),
  ]);
  if (!property) {
    notFound();
  }

  const prequalShareTemplates = prequalShareTemplatesInputFromRow(
    prequalShareRow,
    property.listing_type === "letting" ? "letting" : "sale",
  );

  const tabLinkClass = (active: boolean) =>
    cn(
      "border-b-2 pb-3 text-sm transition-colors",
      active
        ? "border-blue-600 font-medium text-zinc-900 dark:text-zinc-50"
        : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
    );

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/properties?listing=${property.listing_type}`}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Properties
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {property.address}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {property.postcode} · Vendor: {property.vendor_name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                property.listing_type === "letting"
                  ? "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200"
                  : "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
              )}
            >
              {property.listing_type === "letting" ? "To let" : "For sale"}
            </span>
            <PropertyStatusSelect
              propertyId={id}
              listingType={property.listing_type}
              currentStatus={property.status}
            />
          </div>
        </div>

        <div className="mt-10 border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex gap-8">
            <Link href={`/properties/${id}`} className={tabLinkClass(tab === "overview")}>
              Overview
            </Link>
            <Link
              href={`/properties/${id}?tab=feedback`}
              className={tabLinkClass(tab === "feedback")}
            >
              Feedback
            </Link>
          </nav>
        </div>

        {tab === "overview" ? (
          <>
            <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
              Manage scheduled viewings and buyer feedback links for this instruction.
            </p>
            <PropertyHeroImageCard
              propertyId={id}
              initialUrl={property.hero_image_url}
              propertyLine={`${property.address}, ${property.postcode}`}
            />
            <Suspense
              fallback={
                <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              }
            >
              <PropertyShareLinksCard
                vendorPortalToken={property.vendor_portal_token}
                buyerQrToken={property.buyer_qr_token}
                lettingPrequalShareToken={property.prequal_share_token}
                salePrequalShareToken={property.sale_prequal_share_token}
                listingType={property.listing_type}
                propertyLine={`${property.address}, ${property.postcode}`}
                prequalShareTemplates={prequalShareTemplates}
              />
            </Suspense>
            {property.listing_type === "letting" ? (
              <Suspense
                fallback={
                  <div className="mt-8 h-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                }
              >
                <PropertyLettingPrequalCard
                  propertyId={id}
                  companyId={session.user.companyId}
                  prequalShareToken={property.prequal_share_token}
                  propertyLine={`${property.address}, ${property.postcode}`}
                  prequalShareTemplates={prequalShareTemplates}
                />
              </Suspense>
            ) : null}
            {property.listing_type === "sale" ? (
              <Suspense
                fallback={
                  <div className="mt-8 h-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                }
              >
                <PropertySalePrequalCard
                  propertyId={id}
                  companyId={session.user.companyId}
                  salePrequalShareToken={property.sale_prequal_share_token}
                  propertyLine={`${property.address}, ${property.postcode}`}
                  prequalShareTemplates={prequalShareTemplates}
                />
              </Suspense>
            ) : null}
            <Suspense
              fallback={
                <div className="mt-8 h-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              }
            >
              <PropertyViewingsCard
                propertyId={id}
                companyId={session.user.companyId}
                propertyLine={`${property.address}, ${property.postcode}`}
              />
            </Suspense>
          </>
        ) : (
          <>
            <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
              All buyer feedback submitted for this property, newest first.
            </p>
            <Suspense
              fallback={
                <div className="mt-8 h-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              }
            >
              <PropertyFeedbackCard propertyId={id} companyId={session.user.companyId} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePropertyAction } from "@/app/(app)/properties/actions";
import { DestructiveConfirmModal } from "@/components/destructive-confirm-modal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeletePropertyButton({
  propertyId,
  address,
  postcode,
  listingType,
}: {
  propertyId: string;
  address: string;
  postcode: string;
  listingType: "sale" | "letting";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50"
        aria-label="Delete property"
        onClick={() => {
          setErr(null);
          setOpen(true);
        }}
      >
        <Trash2 className="size-3.5 shrink-0" aria-hidden />
        Delete
      </Button>
      <DestructiveConfirmModal
        open={open}
        onOpenChange={(v) => {
          if (!pending) {
            setOpen(v);
          }
        }}
        title="Delete this property?"
        description={
          <>
            <p>
              This will permanently remove{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-100">
                {address}, {postcode}
              </strong>{" "}
              and all viewings, buyer links, and feedback for this instruction. This cannot be undone.
            </p>
          </>
        }
        confirmLabel="Delete property"
        pending={pending}
        error={err}
        onConfirm={() => {
          setErr(null);
          startTransition(async () => {
            const r = await deletePropertyAction(propertyId);
            if (!r.ok) {
              setErr(r.error);
              return;
            }
            setOpen(false);
            router.push(`/properties?listing=${r.listingType}`);
            router.refresh();
          });
        }}
      />
    </>
  );
}

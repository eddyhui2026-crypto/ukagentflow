"use client";

import { Mail, Phone } from "lucide-react";
import { handleMailtoAnchorClick } from "@/lib/mailto-open";
import {
  buildTelHref,
  buildWhatsAppOpenChatUrl,
  normalizePhoneToWhatsAppDigits,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const iconClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

/**
 * Phone (tel:), WhatsApp (wa.me), and mailto shortcuts for a dashboard / table contact cell.
 */
export function ContactOutreachLinks({
  email,
  phone,
  className,
}: {
  email: string;
  phone: string | null | undefined;
  className?: string;
}) {
  const trimmedEmail = email?.trim() ?? "";
  const digits = normalizePhoneToWhatsAppDigits(phone);
  const waHref = digits ? buildWhatsAppOpenChatUrl(digits) : null;
  const telHref = buildTelHref(phone);

  if (!trimmedEmail && !waHref && !telHref) {
    return null;
  }

  const mailtoHref = `mailto:${trimmedEmail}`;

  return (
    <div
      className={cn("flex shrink-0 flex-row flex-wrap items-center gap-1", className)}
      role="group"
      aria-label="Contact shortcuts"
    >
      {telHref ? (
        <a
          href={telHref}
          className={cn(
            iconClass,
            "text-zinc-600 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400",
          )}
          aria-label="Call phone"
        >
          <Phone className="size-[18px]" strokeWidth={2} aria-hidden />
        </a>
      ) : null}
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(iconClass, "text-[#25D366] hover:text-[#128C7E]")}
          aria-label="Open WhatsApp chat"
        >
          <WhatsAppGlyph className="size-[18px]" />
        </a>
      ) : null}
      {trimmedEmail ? (
        <a
          href={mailtoHref}
          target="_top"
          rel="noreferrer"
          className={cn(
            iconClass,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
          )}
          aria-label={`Send email to ${trimmedEmail}`}
          onClick={(e) => handleMailtoAnchorClick(e, trimmedEmail)}
        >
          <Mail className="size-[18px]" strokeWidth={2} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

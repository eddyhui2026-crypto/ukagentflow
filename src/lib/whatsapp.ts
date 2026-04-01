/** Build https://wa.me/... link (opens chat with number, message prefilled). Number: digits only, country code, no +. */
export function buildWhatsAppMeUrl(e164Digits: string, message: string): string {
  const num = e164Digits.replace(/\D/g, "");
  if (!num) return "#";
  const text = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${text}`;
}

/** Open WhatsApp chat with this number only (no prefilled message). */
export function buildWhatsAppOpenChatUrl(e164Digits: string): string {
  const num = e164Digits.replace(/\D/g, "");
  if (!num) return "#";
  return `https://wa.me/${num}`;
}

/**
 * UK-focused: 07… → 447…; strips spaces. Returns null if unusable.
 */
export function normalizePhoneToWhatsAppDigits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0") && d.length >= 10) {
    d = `44${d.slice(1)}`;
  }
  if (d.startsWith("44") && d.length >= 12) return d;
  if (d.length >= 10 && d.length <= 15) return d;
  return null;
}

export function buildBuyerFeedbackWhatsAppMessage(params: {
  buyerName: string;
  propertyLine: string;
  feedbackUrl: string;
}): string {
  return `Hi ${params.buyerName}, thanks for viewing ${params.propertyLine}. Please leave your quick feedback here: ${params.feedbackUrl}`;
}

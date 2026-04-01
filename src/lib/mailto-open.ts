import type { MouseEvent } from "react";

/**
 * Open the system mail client for `mailto:`. Handles embedded iframes (e.g. in-app
 * browsers) where a plain <a href="mailto:"> often does nothing.
 */
export function handleMailtoAnchorClick(e: MouseEvent<HTMLAnchorElement>, rawEmail: string) {
  e.stopPropagation();

  const email = rawEmail.trim();
  if (!email) return;

  const href = `mailto:${email}`;

  // Let the browser handle modified clicks (new tab, etc.) using the real href.
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return;
  }

  e.preventDefault();

  if (typeof window === "undefined") return;

  const topWin = window.top;
  if (topWin && topWin !== window) {
    try {
      topWin.location.href = href;
      return;
    } catch {
      // cross-origin top window; fall through
    }
  }

  window.location.href = href;
}

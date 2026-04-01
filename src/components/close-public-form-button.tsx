"use client";

import { useCallback } from "react";

/** For buyer-facing flows: try to close the tab instead of sending people to the agent marketing homepage. */
export function ClosePublicFormButton() {
  const onClose = useCallback(() => {
    window.close();
  }, []);

  return (
    <div className="mt-8 text-center">
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        Close this page
      </button>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        You’re all set — you don’t need our website from here. If the tab doesn’t close, use your
        browser or phone to close it.
      </p>
    </div>
  );
}

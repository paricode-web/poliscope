"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          fontFamily: "inherit",
        },
      }}
    />
  );
}

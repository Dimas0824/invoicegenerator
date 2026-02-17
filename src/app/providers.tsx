"use client";

import type { ReactNode } from "react";

import { InvoiceSessionProvider } from "../context/InvoiceSessionContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <InvoiceSessionProvider>{children}</InvoiceSessionProvider>;
}

"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

import type { InvoiceData } from "../components/invoice/types";

type InvoiceSessionContextValue = {
  invoiceDraft: InvoiceData | null;
  setInvoiceDraft: Dispatch<SetStateAction<InvoiceData | null>>;
  clearInvoiceDraft: () => void;
};

const InvoiceSessionContext = createContext<InvoiceSessionContextValue | undefined>(
  undefined,
);

type InvoiceSessionProviderProps = {
  children: ReactNode;
};

export function InvoiceSessionProvider({ children }: InvoiceSessionProviderProps) {
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceData | null>(null);

  const contextValue = useMemo<InvoiceSessionContextValue>(
    () => ({
      invoiceDraft,
      setInvoiceDraft,
      clearInvoiceDraft: () => setInvoiceDraft(null),
    }),
    [invoiceDraft],
  );

  return (
    <InvoiceSessionContext.Provider value={contextValue}>
      {children}
    </InvoiceSessionContext.Provider>
  );
}

export function useInvoiceSession(): InvoiceSessionContextValue {
  const context = useContext(InvoiceSessionContext);
  if (!context) {
    throw new Error("useInvoiceSession harus dipakai di dalam InvoiceSessionProvider.");
  }

  return context;
}

import type { InvoiceItem } from "./types";
import { DEFAULT_BRAND_COLOR } from "./constants";

const MAX_BRAND_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const SUPPORTED_BRAND_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return new Date(dateString).toLocaleDateString("id-ID", options);
}

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

export function normalizeTerminNumber(value: number): number {
  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.max(2, Math.floor(value));
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(clampPercentage(value));
}

export function formatTerminLabel(terminNumber: number): string {
  return `Termin ke-${normalizeTerminNumber(terminNumber)}`;
}

export function calculateTerminAmount(
  subtotal: number,
  terminPercent: number,
): number {
  return subtotal * (clampPercentage(terminPercent) / 100);
}

export function normalizeHexColor(value: string | undefined): string {
  if (!value) {
    return DEFAULT_BRAND_COLOR;
  }

  return /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_BRAND_COLOR;
}

export function validateBrandLogoFile(file: File): string | null {
  if (!SUPPORTED_BRAND_LOGO_TYPES.has(file.type)) {
    return "Format logo harus PNG, JPG, atau WebP.";
  }

  if (file.size > MAX_BRAND_LOGO_SIZE_BYTES) {
    return "Ukuran logo maksimal 2 MB.";
  }

  return null;
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca file logo."));
    });

    reader.addEventListener("error", () => {
      reject(new Error("Gagal membaca file logo."));
    });

    reader.readAsDataURL(file);
  });
}

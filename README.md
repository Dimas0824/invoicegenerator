# Invoice & Kwitansi Generator

Aplikasi web untuk membuat invoice proyek/jasa dan menerbitkan kwitansi penerimaan dana melalui halaman khusus.

## Ringkasan

Project ini dibangun dengan Next.js App Router + TypeScript.  
Alur utama sekarang dipisah:

1. Isi dan finalisasi invoice di halaman invoice.
2. Terbitkan kwitansi dari tombol `Terbitkan Kwitansi` ke route `/kwitansi`.

## Fitur Utama

- Edit invoice langsung di halaman (WYSIWYG).
- `Edit Mode` dan `Preview Mode`.
- Export PDF otomatis (`html2pdf` CDN) + fallback `Print Manual`.
- Halaman khusus kwitansi penerimaan dana (`/kwitansi`).
- Template kwitansi legal standar Indonesia:
  - Nomor kwitansi
  - Sudah terima dari
  - Uang sejumlah (angka + terbilang)
  - Untuk pembayaran
  - Metode pembayaran (bank/rekening saat transfer)
  - Tempat/tanggal
  - Tanda tangan + placeholder materai
- Status kwitansi: `Termin Pertama`, `Termin Kedua`, `Full`.

## Route

- `/` -> Invoice Generator
- `/invoice` -> Invoice Generator
- `/kwitansi` -> Kwitansi Penerimaan Dana

## Catatan Sinkronisasi Data (State Sesi)

Data kwitansi diambil dari draft invoice melalui React Context in-memory (state sesi client):

- Data tersedia saat pindah route dalam sesi aktif.
- Data hilang saat refresh halaman penuh atau buka tab baru.
- Jika `/kwitansi` dibuka tanpa data sesi, akan muncul empty state dan CTA kembali ke `/invoice`.

## Struktur Folder Inti

```text
src/
  app/
    page.tsx                    -> Halaman utama invoice
    invoice/page.tsx            -> Route invoice tambahan
    kwitansi/page.tsx           -> Route khusus kwitansi
    providers.tsx               -> Global providers (client)
    layout.tsx                  -> Root layout + providers
  context/
    InvoiceSessionContext.tsx   -> Store sesi draft invoice
  components/
    invoice/
      InvoiceGenerator.tsx      -> Orkestrasi invoice + sinkronisasi sesi
      Toolbar.tsx               -> Kontrol invoice, print/pdf, navigasi ke /kwitansi
      InvoiceHeader.tsx
      InfoSection.tsx
      ItemsTable.tsx
      TotalsSection.tsx
      InvoiceFooter.tsx
      constants.ts
      types.ts
      utils.ts
    receipt/
      ReceiptGenerator.tsx      -> Orkestrasi kwitansi
      ReceiptToolbar.tsx        -> Kontrol status, mode, print/pdf
      ReceiptDocument.tsx       -> Template legal dokumen kwitansi
      constants.ts
      types.ts
      utils.ts                  -> Derivasi nominal + util terbilang
```

## Menjalankan Project

Prasyarat:

- Node.js LTS
- npm

Instalasi:

```bash
npm install
```

Development:

```bash
npm run dev
```

Buka:

- http://localhost:3000
- http://localhost:3000/invoice
- http://localhost:3000/kwitansi

## Scripts

- `npm run dev` -> development server
- `npm run build` -> build production
- `npm run start` -> jalankan build production
- `npm run lint` -> jalankan ESLint

## Alur Penggunaan

1. Isi data invoice di halaman invoice.
2. Atur item, subtotal, dan DP.
3. Klik `Terbitkan Kwitansi`.
4. Pilih status kwitansi (`Termin Pertama` / `Termin Kedua` / `Full`).
5. Cek hasil di `Preview Mode`.
6. Export `Download PDF (Auto)` atau `Print Manual`.

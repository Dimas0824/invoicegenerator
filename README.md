# Invoice & Kwitansi Generator

Aplikasi web berbasis Next.js untuk membuat invoice proyek/jasa dan menerbitkan kwitansi penerimaan dana dari data invoice yang sama.

## Ringkasan

Project ini menggunakan Next.js App Router, React, TypeScript, Tailwind CSS, dan React Context untuk menyimpan draft invoice selama sesi browser aktif.

Alur utama aplikasi:

1. Isi data invoice di halaman `/invoice` atau `/`.
2. Atur item pekerjaan, pembayaran, DP, termin aktif, warna brand, dan ukuran kertas.
3. Gunakan `Preview Mode` untuk melihat hasil final.
4. Cetak atau simpan PDF melalui tombol `Cetak / Simpan PDF`.
5. Klik `Terbitkan Kwitansi` untuk membuat kwitansi berdasarkan termin aktif invoice.

## Fitur Utama

- Edit invoice langsung di halaman dengan mode WYSIWYG.
- `Edit Mode` dan `Preview Mode` untuk invoice dan kwitansi.
- Cetak atau simpan PDF melalui native print dialog browser.
- Pilihan ukuran kertas invoice: `A5`, `A4`, `A3`, `Letter`, dan `Legal`.
- Pilihan orientasi invoice: `Portrait` dan `Landscape`.
- Pengaturan warna brand dokumen dari toolbar.
- Watermark logo tipis di belakang konten invoice dan kwitansi.
- Upload logo/foto pengguna untuk mengganti watermark SVG default.
- Halaman khusus kwitansi penerimaan dana di `/kwitansi`.
- Kwitansi otomatis memakai nominal termin aktif dari invoice.
- DP dicatat sebagai `Termin ke-1`; termin aktif dapat disesuaikan, misalnya `Termin ke-2` sebesar `70%`.

## Branding Dokumen

Aplikasi menyediakan branding sederhana tanpa aset gambar eksternal wajib:

- `Warna` di toolbar mengubah warna aksen header, tabel, highlight termin, tanda tangan, dan watermark.
- Watermark default dibuat dari SVG inline di `src/components/shared/DocumentWatermark.tsx`.
- Tombol `Upload Logo` menerima file `PNG`, `JPG`, atau `WebP` maksimal `2 MB`.
- Gambar upload dipakai sebagai watermark tipis di belakang teks dokumen.
- Tombol `Hapus Logo` mengembalikan watermark ke SVG default.
- Logo upload disimpan sebagai data URL di state sesi browser, bukan dikirim ke server.
- Logo SVG default tetap bisa diganti langsung di `src/components/shared/DocumentWatermark.tsx`.

> [!NOTE]
> Jika ingin logo permanen dari file proyek, simpan aset di `public/` lalu render melalui komponen watermark agar tetap konsisten saat print/PDF.

## Route

| Route | Fungsi |
| --- | --- |
| `/` | Halaman utama invoice |
| `/invoice` | Halaman invoice |
| `/kwitansi` | Halaman kwitansi penerimaan dana |

## Catatan State Sesi

Data kwitansi diambil dari draft invoice melalui React Context in-memory:

- Data tersedia selama pengguna berpindah route dalam sesi aktif.
- Data hilang saat refresh penuh atau membuka tab baru.
- Jika `/kwitansi` dibuka tanpa draft invoice, aplikasi menampilkan empty state dan tombol kembali ke `/invoice`.

## Struktur Folder Inti

```text
src/
  app/
    page.tsx                    -> Halaman utama invoice
    invoice/page.tsx            -> Route invoice
    kwitansi/page.tsx           -> Route kwitansi
    providers.tsx               -> Provider client global
    layout.tsx                  -> Root layout
  context/
    InvoiceSessionContext.tsx   -> Store sesi draft invoice
  components/
    invoice/
      InvoiceGenerator.tsx      -> Orkestrasi invoice, print, layout, dan sinkronisasi sesi
      Toolbar.tsx               -> Kontrol invoice, warna, print, kertas, dan navigasi kwitansi
      InvoiceHeader.tsx         -> Header invoice
      InfoSection.tsx           -> Info klien dan pembayaran
      ItemsTable.tsx            -> Tabel item pekerjaan
      TotalsSection.tsx         -> Total, DP, dan termin aktif
      InvoiceFooter.tsx         -> Lokasi, tanggal, dan tanda tangan
      constants.ts              -> Data awal dan opsi invoice
      types.ts                  -> Tipe data invoice termasuk warna dan logo brand
      utils.ts                  -> Format angka, tanggal, termin, warna, dan upload logo
    receipt/
      ReceiptGenerator.tsx      -> Orkestrasi kwitansi, print, dan derivasi data invoice
      ReceiptToolbar.tsx        -> Kontrol kwitansi, warna, mode, dan print
      ReceiptDocument.tsx       -> Template dokumen kwitansi
      constants.ts              -> Layout halaman kwitansi
      types.ts                  -> Tipe data kwitansi
      utils.ts                  -> Derivasi nominal dan terbilang
    shared/
      DocumentWatermark.tsx     -> Watermark reusable untuk SVG default atau logo upload
```

## Prasyarat

- Node.js LTS
- npm

## Instalasi

```bash
npm install
```

## Menjalankan Development Server

```bash
npm run dev
```

Buka salah satu route berikut:

- `http://localhost:3000`
- `http://localhost:3000/invoice`
- `http://localhost:3000/kwitansi`

## Scripts

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat build production |
| `npm run start` | Menjalankan build production |
| `npm run lint` | Menjalankan ESLint |

## Alur Penggunaan

1. Buka `/invoice`.
2. Isi data klien, tanggal, metode pembayaran, rekening, dan penerima.
3. Tambah atau ubah item pekerjaan.
4. Atur DP dan termin aktif.
5. Pilih warna brand dari kontrol `Warna`.
6. Klik `Upload Logo` jika ingin memakai logo/foto sendiri sebagai watermark.
7. Pilih ukuran dan orientasi kertas jika perlu.
8. Klik `Preview Mode` untuk melihat layout final.
9. Klik `Cetak / Simpan PDF`.
10. Pada print dialog browser, pilih printer fisik atau `Save as PDF`.
11. Klik `Terbitkan Kwitansi` untuk membuat kwitansi dari invoice aktif.

## Print dan PDF

Aplikasi tidak lagi memakai auto-download PDF berbasis `html2pdf`. Output PDF dibuat melalui native print dialog browser agar layout yang dicetak lebih konsisten dengan preview.

Saat menyimpan PDF:

1. Klik `Cetak / Simpan PDF`.
2. Pilih destination `Save as PDF` di browser.
3. Pastikan ukuran kertas di dialog print sesuai pilihan di aplikasi.
4. Nonaktifkan header/footer browser jika browser menambahkannya.
5. Simpan file PDF.

## Catatan Build

Jika `npm run build` menampilkan warning Turbopack tentang beberapa `package-lock.json`, itu berasal dari struktur workspace di luar aplikasi. Build tetap berhasil selama proses compile, TypeScript, dan static generation selesai tanpa error.

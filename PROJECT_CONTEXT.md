# Haland Petcare
## Software Requirements Specification (SRS)

---

# 1. Project Overview

## Vision
Menjadi platform manajemen klinik hewan yang menyatukan seluruh operasional — mulai dari pendaftaran pasien hingga pembayaran — dalam satu sistem yang akurat, real-time, dan mudah digunakan oleh staf non-teknis.

## Objectives
- Menghilangkan pencatatan manual/terpisah antara rekam medis, stok obat, dan keuangan
- Memberikan visibilitas penuh kepada Owner atas operasional klinik (revenue, stok, kunjungan)
- Memberikan customer akses mandiri terhadap riwayat kesehatan hewan peliharaan mereka
- Menjamin data terintegrasi otomatis: resep → stok → invoice tanpa input ganda

## Scope
Sistem mencakup: manajemen customer & pet, appointment, rekam medis, resep & farmasi, inventory, POS, grooming, pet hotel, vaksinasi, inpatient, reporting, audit log, user management, clinic settings, dan customer portal. Di luar scope: integrasi asuransi, telemedicine/video call, marketplace obat pihak ketiga.

## Core Principles
- **Single source of truth** — satu transaksi (mis. resep) hanya dicatat sekali, efeknya (stok, invoice) mengikuti otomatis lewat trigger, bukan input manual berulang
- **Role-first design** — setiap fitur dibangun dengan pertanyaan "siapa boleh akses ini" sejak awal, bukan ditambahkan belakangan
- **No public exposure** — tidak ada celah pendaftaran akun publik dalam bentuk apapun
- **Auditability** — setiap perubahan data sensitif harus bisa ditelusuri (siapa, kapan, apa)
- **Production-first** — tidak ada mock data; setiap fitur dibangun langsung terhubung ke Supabase asli

---

# 2. System Architecture

## High Level Architecture
Client (TanStack Start) → Server Functions → Supabase (PostgreSQL + Auth + RLS + Realtime) → Storage.
Tidak ada backend custom terpisah — Supabase berperan sebagai backend penuh (BaaS). Business logic kritis (stock decrement, invoice generation) ditangani di level database lewat trigger, bukan di client, agar konsisten meski diakses dari banyak sesi bersamaan.

## Technology Stack
- Frontend: TanStack Start, TanStack Query, TypeScript
- Backend: Supabase (PostgreSQL, Auth, RLS, Edge Functions bila diperlukan)
- Styling: Tailwind (asumsi default TanStack Start) + Design System kustom

## Backend
Supabase sebagai backend tunggal. Semua akses data lewat Supabase client dengan RLS aktif — tidak ada bypass lewat service role key di sisi client.

## Frontend
TanStack Start dengan server functions untuk operasi yang butuh privilege lebih (mis. create user oleh Owner). Routing berbasis role (`/_authenticated/app/*` vs `/_authenticated/portal/*`).

## Database
PostgreSQL (via Supabase), 30+ tabel relasional, RLS aktif di semua tabel, trigger untuk automation.

## Storage
Supabase Storage untuk aset seperti foto pet, dokumen medis terlampir (jika ada), dan bukti pembayaran/kwitansi.

## Authentication
Supabase Auth dikustomisasi untuk mendukung Username + PIN (bukan email/password bawaan). PIN di-hash sebelum verifikasi.

## Security
RLS di semua tabel, `has_role()` sebagai fungsi otorisasi standar, Security Definer Functions untuk operasi lintas-role, validasi session & status akun di setiap request sensitif.

---

# 3. User Roles & Permissions

## Owner
Akses penuh: Dashboard, Reports, User Management, Clinic Settings, Audit Log, Inventory, Financial Reports, seluruh modul klinik.

## Doctor
Doctor Queue, Medical Examination, Medical Records, Prescriptions, Vaccinations, Inpatient Monitoring. Tidak bisa membuat/mengubah akun user.

## Staff
Customer Registration, Customer Account Creation, Pet Registration, Appointment Management, Check-in, POS/Cashier, Grooming, Pet Hotel, Inventory. Tidak bisa membuat akun Owner/Doctor/Staff atau mengubah role.

## Customer
My Appointments, My Pets, Medical History, Vaccination History, Invoices, Online Booking — hanya lewat Customer Portal. Tidak bisa mendaftar sendiri atau membuat akun.

## Permission Matrix

| Module | Owner | Doctor | Staff | Customer |
|---|---|---|---|---|
| Dashboard & Analytics | ✅ | ❌ | ❌ | ❌ |
| Customer Registration | ✅ | ❌ | ✅ | ❌ |
| Pet Registration | ✅ | ❌ | ✅ | ❌ |
| Appointment Management | ✅ | View only | ✅ | Booking only |
| Doctor Queue | ✅ | ✅ | ❌ | ❌ |
| Medical Examination | ✅ | ✅ | ❌ | ❌ |
| Medical Records | ✅ | ✅ | ❌ | View only |
| Prescriptions | ✅ | ✅ | ❌ | View only |
| Inventory | ✅ | ❌ | ✅ | ❌ |
| POS / Cashier | ✅ | ❌ | ✅ | ❌ |
| Grooming | ✅ | ❌ | ✅ | Booking only |
| Pet Hotel | ✅ | ❌ | ✅ | Booking only |
| Vaccinations | ✅ | ✅ | ❌ | View only |
| Inpatient | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ❌ | ✅ (create) | View only |
| Reports | ✅ | ❌ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | Customer only | ❌ |
| Clinic Settings | ✅ | ❌ | ❌ | ❌ |

---

# 4. Authentication Specification

## Username + PIN
Login menggunakan Username unik dan PIN 6 digit numerik. Tidak ada metode lain (email, OAuth, social login).

## Session Management
Session divalidasi setiap request ke route terproteksi. Session expired mengarahkan ulang ke `/auth`. Tidak ada silent refresh yang melewati validasi status akun.

## Account Status
Setiap akun punya status `active` / `inactive`. Akun `inactive` tidak bisa login meskipun kredensial benar.

## PIN Reset
Hanya Owner (semua role) dan Staff (khusus role Customer) yang bisa reset PIN pengguna lain. Tidak ada mekanisme "forgot PIN" mandiri/self-service.

## Login Validation
Validasi: username exists → akun active → PIN cocok (hash match) → belum terkunci (lockout). Semua gagal → pesan generik, jangan bocorkan tahap mana yang gagal.

## Failed Login Protection
Akun terkunci otomatis setelah sejumlah percobaan gagal berturut-turut (contoh: 5x). Unlock hanya lewat Owner atau otomatis setelah cooldown period yang ditentukan.

## Logout
Menghapus session aktif dan redirect ke `/auth`. Tidak menyimpan PIN atau token sensitif di local storage sisi client.

---

# 5. User Management

## Account Creation Rules
Hanya Owner yang bisa membuat akun Owner/Doctor/Staff/Customer. Staff hanya bisa membuat akun Customer. Tidak ada jalur pembuatan akun di luar User Management module.

## Username Rules
Unik di seluruh sistem, case-insensitive, tanpa spasi, alfanumerik.

## PIN Rules
6 digit numerik, di-hash sebelum disimpan (bukan plaintext, bukan reversible encryption).

## Role Assignment
Role ditetapkan saat pembuatan akun oleh Owner. Perubahan role setelahnya hanya bisa dilakukan Owner, dan tercatat di Audit Log.

## Account Activation
Akun baru default `active` kecuali ditentukan lain oleh pembuat akun.

## Account Deactivation
Owner bisa menonaktifkan akun kapan saja. Akun nonaktif tetap ada di database (soft state), tidak dihapus.

## Account Deletion
Hanya Owner. Pertimbangkan soft delete (lihat Section 11) untuk menjaga integritas data historis (mis. appointment/invoice lama tetap merujuk ke akun yang sudah dihapus).

---

# 6. Business Rules

## Customer Rules
Satu customer bisa memiliki banyak pet. Data kontak wajib diisi minimal satu (nomor telepon).

## Pet Rules
Setiap pet wajib terhubung ke satu customer (owner). Species dan breed wajib diisi. Birth date opsional jika tidak diketahui, tapi weight wajib diisi minimal saat registrasi awal.

## Appointment Rules
Appointment bisa berupa walk-in (langsung check-in) atau scheduled (booking sebelumnya). Status mengikuti alur `Scheduled → Confirmed → Checked-in → Examined → Completed` — tidak boleh loncat status.

## Medical Record Rules
Setiap medical record terhubung ke satu appointment dan satu pet. Diagnosis dan treatment wajib diisi sebelum status appointment berubah ke `Examined`.

## Prescription Rules
Obat hanya bisa dipilih dari Inventory yang stoknya tersedia. Menyimpan prescription memicu stock decrement dan invoice item — tidak bisa dibatalkan dengan hapus biasa, harus lewat void/adjustment yang tercatat di audit.

## Inventory Rules
Stok tidak boleh negatif. Transaksi yang membuat stok jadi negatif harus ditolak di level database (bukan hanya validasi UI).

## POS Rules
Setiap transaksi POS wajib menghasilkan invoice. Kembalian otomatis dihitung untuk pembayaran cash. Split payment antar metode — tentukan didukung atau tidak sebelum implementasi (default: tidak didukung di versi awal).

## Payment Rules
Invoice berstatus `unpaid` sampai payment tercatat penuh. Payment sebagian (partial) — tentukan kebijakan sebelum implementasi (default: tidak didukung di versi awal, invoice harus lunas sekaligus).

## Grooming Rules
Booking grooming menghasilkan invoice otomatis saat status berubah menjadi Completed.

## Pet Hotel Rules
Reservasi terhubung ke room tertentu; satu room tidak bisa double-booking di rentang tanggal yang sama. Harga dihitung otomatis dari daily pricing × jumlah malam.

## Vaccination Rules
Setiap vaksinasi mencatat next due date otomatis berdasarkan jenis vaksin. Reminder dihitung otomatis dari due date tersebut.

## Inpatient Rules
Pasien rawat inap punya monitoring harian wajib. Discharge summary wajib diisi sebelum status pasien ditutup.

## Audit Rules
Semua perubahan pada: medical record, inventory adjustment, invoice void, role changes, dan user management activity — wajib tercatat otomatis, tidak bisa dinonaktifkan dari sisi aplikasi.

---

# 7. Complete System Workflow

## Customer Registration
Staff/Owner input data customer baru lewat form registrasi → tersimpan ke tabel `customers`.

## Pet Registration
Staff/Owner mendaftarkan pet dan mengaitkannya ke customer yang sudah ada.

## Appointment
Dibuat sebagai walk-in atau scheduled, status awal `Scheduled` (atau langsung `Checked-in` untuk walk-in).

## Walk-in
Customer datang tanpa booking, staff langsung membuat appointment dengan status `Checked-in`.

## Check-in
Staff mengubah status appointment scheduled menjadi `Checked-in`, pasien otomatis masuk ke Doctor Queue.

## Queue
Doctor melihat daftar pasien menunggu berdasarkan urutan check-in.

## Examination
Doctor mencatat vitals, complaint, dan melakukan pemeriksaan.

## Diagnosis
Doctor mencatat diagnosis dan treatment plan ke medical record.

## Prescription
Doctor memilih obat dari inventory, menyimpan resep memicu trigger stock decrement + invoice item.

## Inventory
Stok berkurang otomatis, tercatat di stock_movements.

## Invoice
Invoice terbentuk/ter-update otomatis dari item resep + services yang diberikan.

## Payment
Cashier memproses pembayaran di POS, invoice berubah status jadi `paid`.

## Completed
Status appointment otomatis menjadi `Completed`, customer bisa melihat hasil di Customer Portal.

---

# 8. Functional Requirements

## Dashboard
Ringkasan KPI harian: jumlah appointment, revenue hari ini, low stock alert, pasien inpatient aktif. (Owner only)

## Customers
CRUD data customer, pencarian, riwayat pet per customer.

## Pets
CRUD data pet, medical timeline per pet, filter berdasarkan customer.

## Appointments

Buat/edit/lihat appointment, filter berdasarkan tanggal & status, kalender view.

## Medical Records
Input/lihat rekam medis per appointment, timeline per pet.

## Prescriptions
Pilih obat dari inventory, atur dosis & instruksi, otomatis terhubung ke invoice.

## Pharmacy
Tampilan stok obat untuk keperluan resep, indikator stok rendah saat memilih obat.

## Inventory
CRUD produk, kategori, stock in/out/adjustment, riwayat pergerakan stok.

## Suppliers
CRUD data supplier untuk keperluan purchase order.

## Purchase Orders
Buat PO ke supplier, terima barang (stock in otomatis saat PO diterima).

## POS
Pilih service/product, hitung total, proses pembayaran, cetak/kirim kwitansi.

## Grooming
Booking, tracking progress, tandai selesai (memicu invoice).

## Pet Hotel
Manajemen room, reservasi, check-in/check-out, kalkulasi biaya otomatis.

## Vaccinations
Catat vaksinasi, lihat riwayat, reminder due date otomatis.

## Inpatient
Kelola pasien aktif, monitoring harian, medication log, discharge summary.

## Reports
Filter tanggal, export CSV untuk semua kategori report (revenue, appointment, inventory, medical, grooming, hotel).

## Audit Log
Lihat riwayat perubahan sensitif, filter berdasarkan user/tanggal/jenis aksi.

## User Management
CRUD user, reset PIN, activate/deactivate, assign role.

## Clinic Settings
Atur nama klinik, alamat, jam operasional, timezone, metode pembayaran yang aktif.

## Customer Portal
Lihat appointment, pet, riwayat medis, riwayat vaksinasi, invoice, booking online.

---

# 9. Database Specification

## Database Tables
profiles, user_roles, customers, pets, appointments, medical_records, prescriptions, prescription_items, products, stock_movements, suppliers, purchase_orders, po_items, invoices, invoice_items, payments, grooming_bookings, hotel_rooms, hotel_reservations, vaccinations, inpatient_stays, inpatient_monitoring, audit_logs, clinic_settings, services.

## Relationships
- customers 1—N pets
- pets 1—N appointments, medical_records, vaccinations
- appointments 1—1 medical_records (per kunjungan)
- medical_records 1—N prescriptions
- prescriptions 1—N prescription_items
- prescription_items N—1 products
- appointments 1—1 invoices (atau 1—N jika ada partial billing)
- invoices 1—N invoice_items, 1—N payments
- profiles 1—1 user_roles

## Constraints
- `products.stock` >= 0 (CHECK constraint)
- `pin` selalu tersimpan dalam bentuk hash (tidak ada constraint DB langsung, ditegakkan di application/trigger level)
- Status kolom (appointment, invoice) menggunakan ENUM atau CHECK constraint dengan daftar nilai valid, tidak bebas string apapun

## Indexes
Index pada foreign key utama (customer_id, pet_id, appointment_id), index pada kolom pencarian umum (username, product name), index pada kolom filter tanggal (created_at, appointment date).

## Foreign Keys
Semua relasi antar tabel menggunakan foreign key dengan `ON DELETE` policy eksplisit — gunakan `RESTRICT` untuk data transaksional penting (jangan `CASCADE` sembarangan yang bisa menghapus riwayat medis/invoice).

---

# 10. Database Automation

## Functions
`has_role(user_id, role)` — fungsi utama otorisasi RLS. Fungsi kalkulasi next vaccination due date. Fungsi kalkulasi total invoice dari invoice_items.

## Triggers
- Auto stock decrement saat prescription_items disimpan
- Auto invoice creation/update saat prescription atau grooming selesai
- Auto audit logging saat perubahan data sensitif
- Auto vaccination reminder calculation

## Views
View ringkasan untuk dashboard (mis. `v_daily_revenue`, `v_low_stock_products`, `v_active_inpatients`) agar query dashboard tidak berat di sisi client.

---

# 11. Security Specification

## RLS
Aktif di semua tabel tanpa kecuali, policy menggunakan `has_role()` secara konsisten.

## Authorization
Berbasis role yang tersimpan di `user_roles`, divalidasi ulang di server function untuk operasi sensitif (bukan hanya mengandalkan RLS client-side).

## PIN Hashing
Gunakan algoritma hashing yang sesuai (bcrypt/argon2 setara), tidak ada penyimpanan plaintext atau reversible encryption.

## Audit Trail
Setiap insert/update/delete pada tabel sensitif tercatat: siapa (user_id), apa (action + before/after jika relevan), kapan (timestamp).

## Soft Delete
Data transaksional (customer, pet, invoice, user account) tidak dihapus permanen — gunakan kolom `deleted_at` / `is_active` agar riwayat historis tetap utuh.

## Validation
Validasi input di dua lapis: client-side (UX) dan server/database-side (integrity) — jangan andalkan validasi client saja.

---

# 12. API Convention

## Naming
Server function/endpoint menggunakan penamaan konsisten: `getX`, `createX`, `updateX`, `deleteX` (atau REST-style `GET/POST/PATCH/DELETE` jika pakai route handler).

## Validation
Setiap input divalidasi dengan schema (mis. Zod) sebelum menyentuh database.

## Error Response
Format konsisten: `{ error: { code, message } }`. Jangan bocorkan detail internal (query SQL, stack trace) ke client.

## Pagination
Gunakan cursor-based atau offset-based pagination yang konsisten di seluruh list endpoint (default page size ditentukan, mis. 20).

## Search
Full-text atau ILIKE search pada kolom relevan (nama customer, nama pet, nama produk).

## Filter
Filter berbasis query param, kombinasi AND antar filter berbeda.

## Sorting
Default sort by `created_at DESC` kecuali ditentukan lain, sortable field dibatasi whitelist.

---

# 13. UI / UX Specification

## Design Language
Modern Medical SaaS — professional, clean, calm, trustworthy.

## Layout
Sidebar navigation + top bar, konsisten di seluruh modul app (bukan portal).

## Sidebar
Menu berbeda otomatis sesuai role yang login, item yang tidak diizinkan tidak ditampilkan sama sekali (bukan disabled).

## Tables
Data table dengan sorting, pagination, dan search bawaan untuk semua list view (customers, pets, products, dsb).

## Forms
Validasi inline, pesan error jelas, disable submit saat proses berjalan untuk mencegah double submit.

## Dialog
Digunakan untuk aksi cepat/konfirmasi (mis. confirm delete, reset PIN).

## Drawer
Digunakan untuk form yang lebih panjang tanpa berpindah halaman (mis. create/edit pet).

## Responsive
Mobile-friendly minimal untuk Customer Portal; app internal (staff/doctor/owner) prioritas desktop/tablet.

## Loading State
Skeleton loader untuk semua fetch data, bukan blank screen.

## Empty State
Pesan + ilustrasi/aksi jelas saat data kosong (mis. "Belum ada appointment hari ini").

## Error State
Pesan error yang actionable, bukan pesan teknis mentah.

## Toast
Notifikasi non-blocking untuk aksi sukses/gagal (create, update, delete).

---

# 14. Coding Standards

## TypeScript
Strict mode aktif, tidak ada `any` tanpa alasan eksplisit dikomentari.

## Folder Structure
Struktur berbasis fitur/modul (`/features/appointments`, `/features/inventory`, dst) bukan berbasis tipe file semata.

## Naming Convention
camelCase untuk variabel/fungsi, PascalCase untuk komponen, snake_case untuk nama tabel/kolom database.

## Reusable Components
Komponen UI umum (Table, Form, Dialog, Drawer) dibuat sekali di `/components/ui`, dipakai ulang di semua modul — jangan duplikasi per modul.

## Validation
Skema validasi (Zod) didefinisikan sekali per entity, dipakai bersama di client dan server function.

## Error Handling
Try/catch konsisten di server function, error di-log dan direspons dengan format standar (lihat Section 12).

## Server Functions
Satu server function = satu tanggung jawab jelas. Operasi yang memicu trigger (create prescription, process payment) harus atomik — gunakan transaction jika lebih dari satu statement.

---

# 15. Performance Requirements

## Dashboard
Load awal di bawah 2 detik menggunakan view/materialized query, bukan agregasi real-time berat di setiap request.

## Search
Hasil pencarian tampil di bawah 500ms untuk dataset hingga puluhan ribu baris (didukung index yang tepat).

## Pagination
Query list selalu pakai LIMIT/OFFSET atau cursor, tidak pernah fetch semua baris sekaligus.

## Database Query
Hindari N+1 query — gunakan join atau batch fetch untuk data relasional (mis. appointment + pet + customer dalam satu query).

## Realtime
Realtime subscription dipakai secukupnya (mis. Doctor Queue, notifikasi stok rendah) — bukan di semua tabel, untuk menghindari overhead berlebihan.

---

# 16. Reporting Specification

## Revenue
Total revenue per rentang tanggal, breakdown per kategori (medical, grooming, hotel, product sale).

## Inventory
Laporan stok saat ini, stok masuk/keluar per periode, produk dengan pergerakan tercepat/terlambat.

## Appointment
Jumlah appointment per status, per periode, per doctor.

## Medical
Jumlah kunjungan, diagnosis paling umum, jumlah resep per periode.

## Grooming
Jumlah booking, revenue grooming per periode.

## Hotel
Occupancy rate, revenue hotel per periode.

## CSV Export
Semua laporan di atas bisa diexport ke CSV dengan filter tanggal yang sama seperti tampilan di layar.

---

# 17. Notification Specification

## Appointment Reminder
Notifikasi ke customer (jika channel tersedia) atau tampil di dashboard staff untuk appointment mendatang.

## Vaccination Reminder
Dihitung otomatis dari next due date, muncul sebagai alert di dashboard dan/atau portal customer.

## Low Stock
Alert otomatis saat stok produk di bawah threshold yang ditentukan di Clinic Settings/Inventory.

## Invoice
Notifikasi saat invoice baru dibuat untuk customer (di portal).

## Payment
Konfirmasi otomatis setelah payment berhasil diproses.

## Grooming
Update status booking grooming (mis. "sedang dikerjakan", "selesai").

## Hotel
Reminder check-out mendekati tanggal, konfirmasi reservasi.

> Catatan: channel notifikasi (email/SMS/push/in-app) belum ditentukan — default awal adalah in-app notification/alert di dashboard, channel eksternal ditambahkan belakangan jika dibutuhkan.

---

# 18. Backup & Recovery

## Automatic Backup
Mengandalkan automatic backup bawaan Supabase (sesuai tier project) — pastikan tier yang dipakai mendukung Point-in-Time Recovery jika dibutuhkan.

## Manual Backup
Export schema + data berkala sebagai backup tambahan, terutama sebelum migration besar.

## Restore Procedure
Prosedur restore didokumentasikan dan diuji minimal sekali sebelum go-live (bukan asumsi saja bahwa backup pasti bisa direstore).

---

# 19. Testing Requirements

## Unit Test
Fungsi kalkulasi kritis (total invoice, kembalian POS, next vaccination date) wajib punya unit test.

## Integration Test

Alur trigger (prescription → stock decrement → invoice) diuji end-to-end di level database/server function.

## End-to-End Test
Alur utama (registrasi → appointment → examination → prescription → payment) diuji sebagai satu skenario penuh.

## Security Test
Uji RLS dengan mencoba akses lintas-role (mis. staff mencoba baca medical_records) — harus gagal.

## Performance Test
Uji query list/report dengan dataset besar (simulasi ribuan baris) untuk memastikan tidak ada N+1 atau full table scan.

## User Acceptance Test
Setiap modul direview oleh representasi user asli (staff/doctor/owner) sebelum dianggap selesai.

---

# 20. Production Requirements

## Environment Variables
Supabase URL & anon key di environment variable, tidak pernah di-hardcode. Service role key (jika dipakai) hanya di server-side, tidak pernah terekspos ke client.

## Logging
Log error server-side terstruktur (bukan console.log biasa), tanpa mencatat data sensitif (PIN, dsb).

## Monitoring
Monitoring uptime dan error rate dasar sebelum go-live.

## Deployment
Proses deployment terdokumentasi dan repeatable (bukan manual ad-hoc), termasuk menjalankan migration database.

## Error Reporting
Error di production ditangkap dan bisa ditelusuri (mis. lewat error tracking tool), tidak hanya tampil sebagai pesan generik ke user.

## Production Checklist
RLS aktif semua tabel — auth tidak ada celah registrasi publik — audit log berjalan — backup terkonfirmasi — environment variable aman — performa dasar sudah diuji.

---

# 21. Acceptance Criteria

Seluruh fitur, workflow, keamanan, performa, dan kualitas minimum yang harus dipenuhi sebelum aplikasi dinyatakan production-ready:

- Semua modul di Section 8 berfungsi sesuai Business Rules di Section 6
- Alur kerja inti (Section 7) berjalan end-to-end tanpa input manual ganda
- RLS aktif dan teruji di semua tabel, tidak ada celah akses lintas-role
- Tidak ada jalur registrasi publik dalam bentuk apapun
- Audit log mencatat seluruh aksi sensitif sesuai Section 6 & 11
- Reporting menghasilkan data akurat dan bisa diexport CSV
- Performa memenuhi Section 15 pada dataset realistis
- Checklist Production Requirements (Section 20) terpenuhi seluruhnya

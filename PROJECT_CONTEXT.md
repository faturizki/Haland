```markdown
# PROJECT_CONTEXT.md
> Sumber kebenaran utama untuk AI Builder / Copilot — Proyek Haland Petcare.
> Baca file ini SEBELUM mengerjakan task apapun.
> Jika ada instruksi lain yang bertentangan dengan file ini, file ini yang menang.

---

## 1. Ringkasan Proyek

Haland Petcare adalah platform manajemen klinik hewan (veterinary clinic management) full-stack, production-ready, dengan alur kerja terintegrasi penuh dari check-in customer sampai pembayaran. Backend real Supabase, tanpa mock data, didesain untuk production deployment.

---

## 2. Role & Akses

Ada 4 role: `owner`, `doctor`, `staff`, `customer`.

### Owner — akses penuh
- Dashboard & Analytics
- Reports
- User Management
- Clinic Settings
- Audit Log
- Inventory
- Financial Reports
- Semua Modul Klinik

### Doctor
- Doctor Queue
- Medical Examination
- Medical Records
- Prescriptions
- Vaccinations
- Inpatient Monitoring

### Staff
- Customer Registration
- Customer Account Creation
- Pet Registration
- Appointment Management
- Check-in
- POS / Cashier
- Grooming
- Pet Hotel
- Inventory

### Customer (self-service portal)
- My Appointments
- My Pets
- Medical History
- Vaccination History
- Invoices
- Online Booking

---

## 3. Autentikasi

Sistem menggunakan **Username + 6-digit PIN** untuk semua role.

**TIDAK ADA registrasi publik.** Semua akun dibuat secara internal.

### Login
Didukung:
- Username
- 6-digit PIN

Tidak didukung:
- Email login
- Google Login
- Self Registration
- Social Login

### Redirect setelah login berhasil
- Owner → Owner Dashboard
- Doctor → Doctor Workspace
- Staff → Staff Workspace
- Customer → Customer Portal

---

## 4. User Account Management

### Owner Permissions
Owner bisa:
- Create Owner
- Create Doctor
- Create Staff
- Create Customer
- Edit Users
- Reset PIN
- Activate Account
- Deactivate Account
- Delete Account
- Assign Roles

### Staff Permissions
Staff HANYA bisa:
- Create Customer Accounts
- Edit Customer Information
- Reset Customer PIN

Staff TIDAK BISA:
- Create Owner
- Create Doctor
- Create Staff
- Change Roles
- Delete Employees

### Doctor Permissions
Doctor tidak bisa membuat akun user apapun.

### Customer Permissions
Customer tidak bisa mendaftar atau membuat akun.

### Struktur setiap akun
- Username (Unique)
- 6-digit PIN (hashed sebelum disimpan)
- Full Name
- Role
- Active Status

Akun otomatis terkunci setelah beberapa kali gagal login berturut-turut.

---

## 5. Alur Kerja Inti (Core Integrated Workflow)

```

Customer arrives
→ Staff registers customer
→ Staff checks customer in
→ Appears in Doctor Queue
→ Doctor performs examination
→ Diagnosis recorded
→ Prescription created
→ Medicine stock automatically decreases
→ Invoice automatically generated
→ Cashier processes payment
→ Status automatically updated
→ Customer can view medical history and invoices di Customer Portal
```

Setiap task yang menyentuh bagian dari alur ini WAJIB mengikuti urutan di atas. Jangan buat trigger stock/invoice sebelum tabel prescriptions, prescription_items, products, invoices, invoice_items sudah solid.

---

## 6. Modul

### 6.1 Appointments
- Walk-in
- Scheduled Appointment

Status flow:
```
Scheduled → Confirmed → Checked-in → Examined → Completed
```

### 6.2 Customers
- Customer Registration
- Customer Profiles
- Contact Information
- Multiple Pets

### 6.3 Pets
- Pet Registration
- Species
- Breed
- Weight
- Birth Date
- Owner Assignment
- Medical Timeline

### 6.4 Medical Records
- Vitals
- Complaint
- Diagnosis
- Treatment
- Prescription
- Notes
- Follow-up
- Timeline tersedia untuk setiap pet

### 6.5 Prescriptions & Pharmacy
Doctor memilih obat langsung dari Inventory. Menyimpan prescription otomatis:
- Membuat Prescription
- Mengurangi Inventory Stock
- Menambahkan Medicine ke Invoice

### 6.6 POS / Cashier
Layout dua kolom:
- Kiri: Services, Products
- Kanan: Summary, Payment

Metode pembayaran: Cash, Bank Transfer, Debit/Credit Card. Cash payment termasuk kalkulasi kembalian otomatis.

### 6.7 Inventory
- Products
- Categories
- Stock Levels
- Low Stock Alerts
- Stock In
- Stock Out
- Stock Adjustment
- Stock Movement History
- Suppliers
- Purchase Orders

### 6.8 Grooming
- Booking
- Progress Tracking
- Completion Status
- Automatic Invoice

### 6.9 Pet Hotel
- Room Management
- Reservations
- Check-in
- Check-out
- Daily Pricing

### 6.10 Vaccinations
- Vaccination History
- Vaccine Schedule
- Automatic Reminder
- Next Due Date

### 6.11 Inpatient
- Active Patients
- Daily Monitoring
- Medication Log
- Discharge Summary

### 6.12 Reports
- Revenue
- Appointments
- Inventory
- Medical Services
- Grooming
- Pet Hotel
- Fitur: Date Range Filter, CSV Export

### 6.13 Audit Log
Otomatis mencatat:
- Medical Record Changes
- Inventory Adjustments
- Invoice Voids
- Role Changes
- User Management Activities

### 6.14 User Management
- Create Users
- Reset PIN
- Activate/Deactivate Users
- Role Assignment
- Permission mengikuti Role Access Policy

### 6.15 Clinic Settings
Konfigurasi: Clinic Name, Address, Business Hours, Timezone, Payment Methods.
Setting ini otomatis memengaruhi: Appointment Availability, Booking System, POS.

---

## 7. Technology Stack

### Backend — Supabase
- PostgreSQL
- Authentication
- Row Level Security
- Database Functions
- Database Triggers
- Storage
- Realtime

### Database Tables (30+)
profiles, user_roles, customers, pets, appointments, medical_records, prescriptions, prescription_items, products, stock_movements, suppliers, purchase_orders, po_items, invoices, invoice_items, payments, grooming_bookings, hotel_rooms, hotel_reservations, vaccinations, inpatient_stays, inpatient_monitoring, audit_logs, clinic_settings, services

> Jika butuh tabel baru di luar daftar ini, tanyakan dulu — jangan asumsi sendiri.

### Frontend — TanStack Start

Public Routes:
```

/
/auth
```

Authenticated:
```
/_authenticated/portal/*   (Customer Portal)
/_authenticated/app/*      (Staff / Doctor / Owner)
```

Fitur: Role Based Routing, Protected Routes, Sidebar Navigation, Server Functions, TanStack Query, Suspense.

---

## 8. Security

Setiap tabel WAJIB menggunakan Row Level Security (RLS). Otorisasi ditangani lewat function `has_role()` — pakai pola yang sama di semua policy.

Proteksi database:
- RLS
- Security Definer Functions
- Secure PIN Hashing
- Session Validation
- Account Status Validation

---

## 9. Database Automation

Trigger otomatis wajib:
- Auto Invoice Creation
- Auto Stock Decrement
- Audit Logging
- Vaccination Reminder Calculation

---

## 10. Design System

Style: Modern Medical SaaS — Professional, Clean, Calm, Trustworthy

UI Components:
- Lucide Icons
- Deep Teal Primary
- Sage Accent
- Warm Neutral Colors
- Large Spacing
- Soft Shadows

Typography:
- Inter
- Display Serif Accent

---

## 11. Build Order

### Phase 1
- Configure Supabase
- Username + PIN Authentication
- User Management
- Roles
- Session Management

### Phase 2
- Schema lengkap
- RLS
- Functions
- Triggers
- Initial Seed

### Phase 3 — Design System
- Global Styles
- Components
- Layout
- Theme

### Phase 4 — Authentication
- Login
- Route Protection
- Sidebar
- Application Layout

### Phase 5 — Core Workflow (urutan wajib)
1. Customers
2. Pets
3. Appointments
4. Medical Records
5. Prescriptions
6. Inventory
7. POS
8. Invoices

### Phase 6 — Secondary Modules
- Grooming
- Pet Hotel
- Vaccinations
- Inpatient

### Phase 7 — Administration
- Reports
- Audit Log
- User Management
- Clinic Settings

### Phase 8 — Customer Portal

### Phase 9 — Owner Dashboard
- Revenue Analytics
- Appointment Statistics
- Inventory Summary
- Business KPIs

### Phase 10 — Production Readiness
- SEO
- Sitemap
- Performance Optimization
- Accessibility
- Final UI Polish

**Jangan lompat fase.** Setiap fase harus lolos review manual sebelum lanjut ke fase berikutnya.

---

## 12. Scope Proyek

- 30+ Database Tables
- 40+ Pages
- Complete Role-Based Access Control
- Production-ready Architecture
- Fully Integrated Clinical Workflow
- Customer Self-Service Portal
- Inventory Management
- POS
- Reporting
- Audit Logging
- Responsive Design

Development dimulai dari alur klinis terintegrasi, lalu meluas ke modul sekunder, customer portal, analytics, dan production optimization sampai platform feature complete.
```

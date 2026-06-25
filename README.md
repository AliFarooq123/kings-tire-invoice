# Kings Tire Invoice App

A full-stack web application built for **Kings Tire Wheels & Auto Repair** (6150 Watt Ave., North Highlands, CA) to replace paper invoices with a fast, searchable digital system. Shop employees take customer information verbally, enter it into a digital receipt that matches the shop's physical form, and save and print in one click.

**Live demo:** [https://kings-tire-invoice.vercel.app/](https://kings-tire-invoice.vercel.app/)  
**Backend API:** [https://kings-tire-invoice-production.up.railway.app/](https://kings-tire-invoice-production.up.railway.app/)

Built by **Ali Farooq**, CS student at Sacramento State University.

---

## Tech Stack

- **Frontend:** React + Vite + React Router (deployed on Vercel)
- **Backend:** Node.js + Express (deployed on Railway)
- **Database:** PostgreSQL (Railway)
- **Auth:** JWT (8-hour tokens, stored in `localStorage`)

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SHOP_USERNAME` | Login username for shop workers |
| `SHOP_PASSWORD` | Login password for shop workers |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `PORT` | Server port (default `3001`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (e.g. `https://kings-tire-invoice-production.up.railway.app`) — leave blank for local dev (Vite proxy handles it) |

---

## Pages

### Login (`/login`)
Shop workers sign in with username and password. A JWT token is issued and stored in `localStorage`. Logout is available in the nav bar. All invoice routes are protected — unauthenticated requests are redirected to `/login`.

### New Invoice (`/`)
Interactive digital receipt matching the shop's physical invoice layout exactly. Workers fill in customer info, vehicle details, line items, payment method, special-order checkboxes, and totals. A live **suggestion panel** shows calculated subtotal, tax, and total based on line items — workers enter totals manually. **Save & Print** saves to the database, assigns an auto-incremented ARD number, and opens the print dialog.

### Search Invoices (`/search`)
Two independent search panels side by side:
- **Date range search** — From / To date pickers return all invoices in the range.
- **Text search** — searches by customer name, phone, license plate, VIN, or ARD number.

Results show customer, ARD number, date, vehicle, and total. Click a result to open it; **Delete** removes an invoice after confirmation.

### Invoice Detail (`/invoices/:id`)
View and **edit** any saved invoice — same editable form as New Invoice. **Save Changes** updates the record. **Print** reprints the receipt. Auto-prints on first load when arriving from Save & Print (`?print=1`).

---

## Current Features

- Digital receipt matching the shop's exact physical layout (logo, shop header, customer info grid, payment checkboxes, 16 line-item rows, special-order checklist, totals column, legal text, signature line)
- **JWT authentication** — all routes protected; tokens expire after 8 hours
- **Login page** with shop credentials set via environment variables
- Auto-incrementing **ARD number** displayed in the receipt header
- Manual totals entry (LABOR, SUB TOTAL, SALES TAX, NEW TIRE FEE, TIRE/OIL DISPOSAL, TOTAL, DEPOSIT, BALANCE DUE)
- Live **suggestion panel** for calculated totals (7.75% tax on parts — suggestions only, never auto-filled)
- **Save & Print** creates a new invoice and triggers the browser print dialog
- **Editable invoices** — reopen any saved invoice, make changes, and save
- **Delete invoices** with confirmation
- **Date range search** and **text search** (name, phone, plate, VIN, ARD)
- Letter-size (8.5 × 11) print layout with all inputs hidden in print mode
- Clean date display (MM/DD/YYYY) with date picker in edit mode
- Responsive suggestion panel (fixed sidebar on wide screens, inline on narrow)

---

## Business Logic (Suggestion Panel)

The suggestion panel computes totals for reference — workers always type the final values manually:

- Line total = qty × unit price
- Subtotal = sum of all line totals
- Sales tax = subtotal × 7.75%
- Total = subtotal + sales tax + labor + new tire fee + tire/oil disposal
- Balance due = total − deposit

---

## API Routes

All `/invoices` routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `POST` | `/invoices` | Create new invoice |
| `GET` | `/invoices/search?q=&start_date=&end_date=` | Search by text and/or date range |
| `GET` | `/invoices/:id` | Fetch invoice with line items |
| `PUT` | `/invoices/:id` | Update invoice (replaces all fields and items) |
| `DELETE` | `/invoices/:id` | Delete invoice |

---

## Running Locally

```bash
# Server
cd server && npm install && node index.js

# Client (separate terminal)
cd client && npm install && npm run dev
```

Client runs at `http://localhost:5173`, API at `http://localhost:3001` (proxied via Vite — no `VITE_API_URL` needed locally).

---

## Planned Features (v2)

- PDF export
- Customer history page (all invoices for one customer)
- Revenue and analytics dashboard
- SMS receipt to customer
- Multi-user support with individual employee accounts
- Audit log of who created or edited invoices
- OCR receipt scanning
- bcrypt password hashing and users table

---

## Project Status

**Deployed and actively used by Kings Tire Wheels & Auto Repair.**

## Project Goal

Replace manual paper records at a real working auto shop with a fast, reliable digital system built directly from the shop's existing physical receipt format.

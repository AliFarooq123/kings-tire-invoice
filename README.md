# Kings Tire Invoice App

A full-stack web application built for **Kings Tire Wheels & Auto Repair** (6150 Watt Ave., North Highlands, CA) to replace paper invoices with a fast, searchable digital system. Shop employees take customer information verbally, enter it into a digital receipt that matches the shop's physical form, and save and print in one click.

## Tech Stack

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Hosting:** Railway (accessible from any computer in the shop via live URL)

## Environment Variables

Set these in `server/.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SHOP_USERNAME` | Login username for shop workers |
| `SHOP_PASSWORD` | Login password for shop workers |
| `PORT` | Server port (default `3001`) |

## Pages

### Login (`/login`)
Shop workers sign in with username and password before accessing the app. Session is stored in `localStorage`. Logout is available in the nav bar.

### New Invoice (`/`)
Interactive digital receipt matching the shop's physical invoice layout. Workers click each field and type customer info, vehicle details, line items, checkboxes, and totals. An on-screen **suggestion panel** shows calculated subtotal, tax, and total based on line items — workers enter totals manually. **Save & Print** saves to the database and opens the print dialog.

### Search Invoices (`/search`)
Search by name, phone, license plate, VIN, or ARD number. Filter by **date range** (From / To) alongside text search. Results show customer, ARD number, date, vehicle, and total. Click a result to open it; **Delete** removes an invoice after confirmation.

### Invoice Detail (`/invoices/:id`)
View and **edit** any saved invoice — same editable form as New Invoice. **Save Changes** updates the record via PUT. **Print** reprints the receipt. Auto-prints when arriving from Save & Print (`?print=1`).

## Current Features (v1)

- Digital receipt matching the shop's exact physical layout (logo, header, customer grid, payment row, 15 line-item rows, special order checkboxes, totals with cents divider, legal text, signature line)
- Auto-incrementing **ARD number** displayed in the top-right box (e.g. `ARD00000001`)
- Manual totals entry with live **suggestion panel** (7.75% tax on parts only — suggestions only, never auto-filled)
- Save & Print, reprint, and edit existing invoices
- Search by text + date range; delete invoices
- Shop login gate (env-based credentials)
- Letter-size (8.5 × 11) print layout
- Clean date display (MM/DD/YYYY) and date picker on new/edit forms

## Business Logic (Suggestions)

The suggestion panel uses these formulas (workers type totals manually):

- Line total = qty × unit price
- Subtotal = sum of line totals (labor excluded)
- Sales tax = subtotal × 7.75%
- Total = subtotal + sales tax + labor + new tire fee + tire/oil disposal
- Balance due = total − deposit

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/login` | Shop login |
| POST | `/invoices` | Create invoice |
| GET | `/invoices/search?q=&start_date=&end_date=` | Search + date filter |
| GET | `/invoices/:id` | Get invoice with items |
| PUT | `/invoices/:id` | Update invoice (replace all fields + items) |
| DELETE | `/invoices/:id` | Delete invoice |

## Running Locally

```bash
# Server
cd server && npm install && node index.js

# Client (separate terminal)
cd client && npm install && npm run dev
```

Client runs at `http://localhost:5173`, API at `http://localhost:3001` (proxied via Vite).

## Planned Features (v2)

- JWT authentication with bcrypt password hashing and users table
- PDF export
- Customer history page (all visits for one customer)
- Revenue and analytics dashboard
- SMS receipt to customer
- Multi-user support with employee accounts
- Audit log of who created or deleted invoices
- OCR receipt scanning

## Project Goal

Replace manual paper records at a real working auto shop with a fast, reliable digital system built directly from the shop's existing physical receipt format.

## Status

In active development and deployed for shop use.

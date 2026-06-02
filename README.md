# Kings Tire Invoice App

A full-stack web application built for Kings Tire auto shop to replace paper invoices with a fast, searchable digital system. Shop employees take customer information verbally, enter it into the app, and save and print a clean receipt in one click — no paper, no lost records.

The digital invoice form is built to match the shop's exact physical receipt — same fields, same layout — based on a scanned copy of the real receipt currently used by the shop. Workers fill it out by clicking each field and typing.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Hosting:** Railway (accessible from any computer in the shop via live URL)

## Pages

### New Invoice
Matches the layout of the shop's actual paper receipt. Worker fills out customer name, phone number, vehicle info (year, make, model, license plate, VIN, mileage), and service line items with parts and labor costs by clicking each field and typing. Totals calculate automatically. Hit **Save & Print** to save to the database and print the receipt in one step — no need to search for it after.

### Search Invoices
Look up any past invoice by phone number, license plate, or VIN. Results show customer name, date, vehicle, and total. Click any result to open the full invoice.

### Invoice Detail
Full view of any saved invoice. Matches the layout of the shop's original paper receipt. Includes a reprint button for returning customers or lost receipts.

## Features

### Core (v1)
- Digital form built to match the shop's exact physical receipt — same fields, same layout
- Workers fill it out verbally from the customer — click each field and type
- Add multiple service line items with parts and labor costs
- Auto-calculated subtotal, tax, and total
- Save & Print in one click — saves to database and opens print dialog instantly
- Clean 8.5 × 11 print layout matching the original receipt
- Search invoice history by phone number, license plate, or VIN
- View and reprint any past invoice
- Accessible from any computer in the shop via live URL

### Advanced (v2)
- PDF export
- Full customer history — every past visit tied to one customer in one view
- Employee login and authentication — so only shop workers can access it
- Mobile and tablet friendly layout

## Project Goal

Replace manual paper records at a real working auto shop with a fast, reliable digital system. Built directly from the shop's existing physical receipt format and deployed for active business use.

## Status
🚧 In active development

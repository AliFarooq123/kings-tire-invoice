# Kings Tire Invoice App

A full-stack web application built for Kings Tire auto shop to replace paper invoices with a fast, searchable digital system. Shop employees take customer information verbally, enter it into the app, and print a clean receipt in one step — no paper, no lost records.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Hosting:** Railway (accessible from any computer in the shop)

## Pages

### New Invoice
Fill out customer name, phone, vehicle info (year, make, model, license plate, VIN, mileage), and service line items with parts and labor costs. Totals calculate automatically. Hit **Save & Print** to save to the database and print the receipt in one step.

### Search Invoices
Search past invoices by phone number, license plate, or VIN. Results show customer name, date, vehicle, and total.

### Invoice Detail
Full view of any saved invoice. Matches the layout of the shop's original paper receipt. Includes a reprint button.

## Features

### Core (v1)
- Create invoices based on the shop's actual receipt format
- Add multiple service line items
- Auto-calculated subtotal, tax, and total
- Save & Print in one click
- Search invoice history by phone, license plate, or VIN
- Clean 8.5 × 11 print layout
- Accessible from any computer via live URL

### Advanced (v2)
- PDF export
- Full customer history — every past visit in one view
- Employee login and authentication
- Mobile/tablet friendly layout

## Project Goal

Replace manual paper records at a real working auto shop with a fast, reliable digital system. Built and deployed for active business use.

## Status
🚧 In active development

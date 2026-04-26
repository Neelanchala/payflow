# PayFlow — Lightweight Digital Ledger & Inventory System for Small Retailers

PayFlow is a full-stack web application designed to help small shop owners manage daily business operations—sales, inventory, customers, and dues—without relying on complex or expensive software.

It focuses on simplicity, speed, and real-world usability for local merchants who primarily operate with cash and UPI payments.

---

## 🚀 Live Demo

https://payflow-iuht.onrender.com

> Note: The backend is hosted on a free tier and may take ~30–60 seconds to wake up after inactivity.

---

## 📌 Problem Statement

Small retailers and local vendors often face these issues:

* No structured way to track daily sales
* Difficulty managing customer credit (udhaar)
* Manual inventory tracking leading to stock errors
* Lack of simple, affordable digital tools

Most existing solutions are either:

* Too complex
* Mobile-only with limited flexibility
* Not tailored for lightweight usage

---

## 💡 Solution

PayFlow provides a **minimal, web-based business management system** that allows shop owners to:

* Record sales transactions quickly
* Track customer dues and payments
* Manage product inventory
* Generate UPI payment requests via QR codes
* View basic business insights

---

## 👤 Target Users

* Small shop owners
* Local vendors
* Independent sellers
* Students exploring business/data systems

---

## ⚙️ Core Features

### 📊 Dashboard

* Overview of revenue, expenses, and profit
* Recent transaction history
* Low-stock indicators

### 📦 Inventory Management

* Add/edit/delete products
* Track stock levels
* Update pricing

### 👥 Customer Management

* Maintain customer records
* Track credit and payment history

### 💰 Sales System

* Record transactions
* Associate sales with customers
* Automatic stock updates

### 📱 UPI Payment Requests

* Generate QR codes using UPI ID
* Share payment links (e.g., via WhatsApp)
* No direct payment processing (client-side UPI flow)

### 📤 Data Export

* Export transactions as CSV
* Export expenses as CSV

---
## 📸 Screenshots

- Dashboard View
  

<img width="1918" height="969" alt="image" src="https://github.com/user-attachments/assets/3a46cd3a-0b13-4590-85c8-ec12d9983084" />



<img width="1918" height="971" alt="image" src="https://github.com/user-attachments/assets/7d90a1ea-7c97-41f5-beed-32633c095ba7" />

- Inventory page
  

<img width="1895" height="970" alt="image" src="https://github.com/user-attachments/assets/596868b3-1030-44c4-b822-5f935a93207d" />



<img width="1868" height="931" alt="image" src="https://github.com/user-attachments/assets/4d48a8d8-1531-4272-afc3-481b6c951e0e" />


- Sell page
  
  
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/5967d9bb-2c4e-4b7e-957e-99c5745ce2ab" />



<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/f21b16b0-fde8-4d02-b4b8-ea7b729653f1" />

- Payment QR interface
  

<img width="1904" height="971" alt="image" src="https://github.com/user-attachments/assets/597541c0-a565-4e2d-b9b3-d73e6f2da75c" />



<img width="1903" height="970" alt="image" src="https://github.com/user-attachments/assets/36795731-77ef-46f9-8547-a093ce48af5e" />


-----
## 🧱 System Architecture

Client (Frontend)
↓
REST API (Node.js + Express)
↓
SQLite Database

---

## 🛠 Tech Stack

### Frontend

* HTML
* CSS
* Vanilla JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite

### Authentication

* JWT-based authentication
* Google OAuth integration

### Integrations

* UPI deep links
* QR code generation

---

## 🔐 Authentication Flow

* User login via JWT or Google OAuth
* Token-based session handling
* Protected API routes

> Note: Basic implementation. Not production-hardened (no refresh tokens or advanced security layers).

---

## 📡 API Design

* RESTful architecture
* Route separation using controllers
* Middleware for authentication and validation

Example:

GET /api/products
POST /api/sales
GET /api/customers

---

## 📂 Project Structure

/routes        → API endpoints
/controllers   → Business logic
/models        → Database interactions
/middleware    → Auth & validation
/public        → Frontend assets

---

## ⚠️ Limitations

* SQLite limits concurrent multi-user scalability
* No real payment verification (UPI handled externally)
* Basic authentication (no refresh tokens, rate limiting)
* Hosted on free tier (cold starts, limited performance)

---

## 📈 Future Improvements

* Role-based access (admin/staff)
* Migration to PostgreSQL or MongoDB
* Payment gateway integration (Razorpay/Stripe)
* Mobile-first redesign
* Offline support for low-connectivity environments

---

## 🧪 Key Learnings

* Designing and structuring REST APIs
* Implementing authentication (JWT + OAuth)
* Managing full-stack data flow
* Building end-to-end deployable applications

---

## 📬 Contact

Neelanchala Nayak
Email: [nayakneelanchala2007@gmail.com](mailto:nayakneelanchala2007@gmail.com)
GitHub: https://github.com/Neelanchala

---

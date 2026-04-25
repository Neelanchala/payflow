# PayFlow – Merchant Management & Payment System

## 🚀 Live Demo
👉 https://payflow-iuht.onrender.com  

> ⚠️ Note: If the app takes time to load, it may be due to free-tier backend cold starts.

---

## 📌 Overview
PayFlow is a full-stack merchant dashboard designed to manage business operations including inventory, sales, customers, expenses, and UPI-based payments.  
It provides real-time analytics and a unified interface for small business management.

---

## 🧠 Key Features
- 🔐 Secure authentication using JWT + Google OAuth
- 📦 Inventory management with real-time stock updates  
- 💳 UPI payment integration with QR code generation  
- 📊 Real-time analytics (daily, weekly, monthly insights)  
- 👥 Customer management with credit tracking  
- 💰 Expense tracking with automatic profit calculation  
- 📤 Export data as CSV reports  
- 🔔 Notification system (low stock alerts, reminders)  
- 📱 Responsive dashboard UI  

---

## 🛠 Tech Stack

**Frontend**
- HTML, CSS, JavaScript (Vanilla)

**Backend**
- Node.js, Express.js  

**Database**
- SQLite  

**Authentication**
- JWT  
- Google OAuth  

**Payments**
- UPI Deep Links  
- QR Code Generation  

**Tools & APIs**
- REST APIs  
- Fetch API  
- LocalStorage


Client (Frontend)
↓
REST API (Express Server)
↓
SQLite Database

-----------

## ⚙️ Installation & Setup

###  Clone the repository
```bash
git clone https://github.com/Neelanchala/payflow.git
cd payflow

Install dependencies
npm install

Start the server
node server.js

Open in browser
http://localhost:3000


📂 Project Structure
/routes        → API routes  
/controllers   → Business logic  
/models        → Database logic  
/middleware    → Auth & validation  
/public        → Frontend files  

---

📈 Future Improvements
Role-based access control (admin/staff)
Cloud database (PostgreSQL / MongoDB)
Payment gateway integration (Razorpay / Stripe)
Mobile app version


🧪 Key Learnings
Designing scalable REST APIs
Implementing authentication flows (JWT & OAuth)
Managing real-time data updates
Structuring full-stack applications


⚠️ Honest Limitations
Hosted on free tier → may have cold start delays
Not optimized for high-scale production yet



📬 Contact

Neelanchala Nayak
📧 nayakneelanchala2007@gmail.com
🔗 https://github.com/Neelanchala

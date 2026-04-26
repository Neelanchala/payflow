# PayFlow – Merchant Management & Payment System

PayFlow is a simple merchant management system that helps small businesses track sales, manage customers, and collect payments using UPI.

------
## 🚀 Live Demo
👉 https://payflow-iuht.onrender.com  

> ⚠️ Note: If the app takes time to load, it may be due to free-tier backend cold starts.

-----
🚨 Problem It Solves:

Small shop owners often:

Don’t track daily sales properly
Forget customer dues
Have no simple digital system
-----

PayFlow solves this by providing a lightweight dashboard to manage everything in one place.

👤 Who It’s For:

Small shop owners
Local vendors
Students learning business/data systems
Anyone needing a simple sales tracker

------

⚙️ Features 

📊 Dashboard
View total revenue, profit, expenses
Track recent transactions
Monitor low stock items
📦 Inventory Management
Add and manage products
Track quantity and pricing
👥 Customer Management
Add customers
Track purchases and dues
💰 Sales System
Record transactions
Associate with customers
📱 UPI Payments
Save UPI ID
Generate QR payment links
Send payment via WhatsApp
📤 Export Data
Export transactions as CSV
Export expenses as CSV

----

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



------------

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

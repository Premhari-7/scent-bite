# Scent Bite – Full-Stack Perfume Shop Management System

Scent Bite is a full-stack web application developed as a Capstone Project to manage perfume shop operations including inventory control, billing, employee management, customer tracking, and order processing.

Capstone Project – Scored 100/100

---

## Project Overview

This system provides an integrated platform for managing retail perfume shop activities. It enables secure authentication, product inventory handling, automated billing, stock management, and structured data storage using MongoDB.

The application follows a full-stack architecture using React for the frontend and Node.js with Express for the backend.

---

## Key Features

### Authentication System
- Employee registration
- Secure login with password hashing (bcrypt)
- Unique employee ID generation (EMP001, EMP002, etc.)

### Product Management
- Add new products
- Auto-generate product IDs (PROD001, PROD002, etc.)
- Update product stock
- Delete products
- Fetch all products from database

### Billing and Orders
- Create customer orders
- Automatically reduce product stock after purchase
- Store billing details including payment method
- Retrieve order history

### Employee Management
- Update employee details
- Delete employee records
- View all employees

### Customer Management
- Add customers
- View customer records
- Delete customer entries

---

## Technologies Used

### Frontend
- React.js
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Local MongoDB and MongoDB Atlas supported)
- Mongoose ODM

### Security and Middleware
- bcryptjs for password hashing
- CORS
- Express JSON middleware

---

## Installation and Setup

### 1. Clone the Repository

git clone https://github.com/Premhari-7/scent-bite-capstone.git
cd scent-bite-capstone

### 2. Install Dependencies

npm install

### 3. Start Backend Server

cd src/server
node Server.cjs

Backend runs at:
http://localhost:5000

### 4. Start Frontend Application

npm run dev

Frontend runs at:
http://localhost:5173

## Database Configuration

Local MongoDB:
mongodb://localhost:27017/UserDB

MongoDB Atlas:
Configure using environment variables for production use.

---

## Developer

Prem Hari S
Full-Stack Developer  

Capstone Project – Scored 100/100  
Completed over a period of 3 months as part of academic evaluation.

## License

Copyright (c) 2026 Prem Hari S

This project is the intellectual property of Prem Hari S.
Unauthorized reproduction, redistribution, or commercial use
without explicit permission is strictly prohibited.


## Project Structure


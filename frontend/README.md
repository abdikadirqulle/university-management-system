# University Management System (UMS) Frontend

## 🚀 Overview

The **University Management System (UMS) Frontend** is a web-based interface that provides a user-friendly experience for managing academic administration, student management, course registration, exams, and financial operations. The system is designed to support multiple user roles, including admins, faculty, and students, ensuring efficient university operations.

## 📌 Features

- **User Management** (Admins, Students, Faculty, Staff)
- **Student Enrollment & Management**
- **Course & Class Management**
- **Faculty & Staff Management**
- **Exams & Results Management**
- **Fee & Finance Management**
- **Authentication & Role-Based Access**
- **Real-time Data Handling with React Query**

## 👥 User Roles & Permissions

### 1️⃣ **Super Admin (Academic)**

- Manages academic calendar
- Creates staff accounts
- Manages courses and classes

### 2️⃣ **Normal Admins**

- **Exam Admin** → Manages exams & results
- **Finance Admin** → Handles student payments & invoices
- **Student Enrollment Admin** → Registers students
- **Staff (Deans)** → Creates lectures & assigns courses
- **Staff (Lecturers)** → Adds exam results, views assigned courses

### 3️⃣ **Students**

- Registers for courses
- Views grades and results
- Pays fees

## 🛠 Tech Stack

### **Frontend**

- **Vite + React.js** (Fast Development)
- **Tailwind CSS + Shadcn UI** (Modern UI Design)
- **React Query** (Efficient Data Fetching)

### **Deployment**

- **Frontend:** Vercel

## 🚀 Getting Started

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/abdikadirqulle/university-management-system.git
cd university-management-system
```

### **2️⃣ Install Dependencies**

```sh
# Frontend
cd frontend
npm install
```

### **3️⃣ Set Up Environment Variables**

Create a `.env` file in the `backend/` directory (if not already present):

```env
PORT=5000
DATABASE_URL=mongodb+srv://your-mongo-db-url
JWT_SECRET=your-secret-key
```

### **4️⃣ Start the Application**

```sh
# Run frontend
cd frontend
npm run dev
```

## 🚀 Deployment

### **Frontend Deployment (Vercel)**

```sh
npm install -g vercel
vercel
```

## 🛠 Contributors

- **[Abdikadir Qulle](https://github.com/abdikadirqulle)** (Lead Developer)
- **Your Team Members (if any)**

## 📜 License

This project is licensed under the [MIT License](LICENSE).

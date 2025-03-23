# University Management System (UMS)

## 🚀 Overview

The **University Management System (UMS)** is a web-based platform that streamlines academic administration, student management, course registration, exams, and financial operations. The system supports multiple user roles, including admins, faculty, and students, to ensure efficient university operations.

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

### **Backend**

- **Node.js + Express.js** (REST API)
- **Prisma ORM** (Database Management)
- **MongoDB** (NoSQL Database)
- **JWT Authentication** (Secure Login & Access Control)

### **Deployment**

- **Frontend:** Vercel
- **Backend:** Render

## 📂 Folder Structure

```
/ums-project
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│
├── backend/ (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── server.js
│   ├── prisma/
│   ├── .env
│   ├── package.json
│
├── README.md
```

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

# Backend
cd ../backend
npm install
```

### **3️⃣ Set Up Environment Variables**

Create a `.env` file in the `backend/` directory:

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

# Run backend
cd ../backend
npm run dev
```

## 🚀 Deployment

### **Frontend Deployment (Vercel)**

```sh
npm install -g vercel
vercel
```

### **Backend Deployment (Render)**

1. Go to [Render](https://render.com/).
2. Create a new Web Service and connect your GitHub repository.
3. Set the **Root Directory** as `backend/`.
4. Use the following commands:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `npm start`

## 📌 Next Steps

- 🔐 **Implement Role-Based Access Control (RBAC)**
- 📚 **Develop Student Dashboard**
- 🏫 **Enhance Admin & Faculty Features**

## 🛠 Contributors

- **[Abdikadir Qulle](https://github.com/abdikadirqulle)** (Lead Developer)
- **Your Team Members (if any)**

## 📜 License

This project is licensed under the [MIT License](LICENSE).

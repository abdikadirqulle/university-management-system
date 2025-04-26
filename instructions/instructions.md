## 1. Product Requirements Document (PRD)

### Project Overview

The University Management System (UMS) is a web-based application designed to manage students, faculty, courses, and financial transactions efficiently. It includes role-based authentication and a structured database to handle complex university operations.

### Core Features

- **User Management**: Register, authenticate, and manage different roles (Admin, Student, Faculty, Staff).
- **Student Management**: Maintain student profiles, enrollments, and academic records.
- **Course & Class Management**: Manage courses, faculty assignments, and class schedules.
- **Faculty & Staff Management**: Handle faculty information and course assignments.
- **Fee & Finance Management**: Process payments, track pending fees, and manage financial records.

### User Roles

1. **Admin**: Full system access, including managing users, courses, and finances.
2. **Student**: Limited access to their profile, courses, and payments.
3. **Faculty**: Access to assigned courses and student lists.
4. **Staff**: Manages administrative tasks related to students and courses.

---

## 2. Tech Stack Overview

### Frontend

- **Framework**: React.js
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Query
- **Deployment**: Vercel

### Backend

- **Framework**: Node.js (Express.js)
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: JWT-based authentication
- **Deployment**: Digital Ocean

---

## 3. Current File Structures

### Frontend (`/ums-frontend`)

```
📂 ums-frontend
 ┣ 📂 src
 ┃ ┣ 📂 components   # UI Components (Button, Input, Modal, etc.)
 ┃ ┣ 📂 hooks        # Custom hooks (useAuth, useFetch)
 ┃ ┣ 📂 pages        # Pages (Dashboard, Login, Register)
 ┃ ┣ 📂 layouts      # Layout components (AdminLayout, StudentLayout)
 ┃ ┣ 📂 utils        # Helper functions (formatDate, debounce)
 ┃ ┣ 📂 services     # API requests (authService, studentService)
 ┃ ┣ 📂 store        # Zustand global state management
 ┃ ┣ 📂 assets       # Static assets (icons, images)
 ┣ 📜 package.json
 ┣ 📜 tailwind.config.ts
 ┣ 📜 tsconfig.json
 ┣ 📜 vite.config.ts
 ┣ 📜 .gitignore
```

### Backend (`/ums-backend`)

```
📂 ums-backend
 ┣ 📂 src
 ┃ ┣ 📂 config        # Database & server configuration
 ┃ ┣ 📂 controllers   # API controllers (business logic)
 ┃ ┣ 📂 middleware    # Middleware (auth, validation)
 ┃ ┣ 📂 prisma        # Prisma schema & database models
 ┃ ┣ 📂 routes        # API route handlers
 ┃ ┣ 📂 services      # Business logic & integrations
 ┃ ┣ 📂 utils         # Helper functions
 ┃ ┣ 📜 server.js     # Entry point
 ┣ 📜 .env
 ┣ 📜 package.json
 ┣ 📜 prisma/schema.prisma
 ┣ 📜 nodemon.json
 ┣ 📜 .gitignore

```

---

## 4. Frontend/Backend Guidelines

### Frontend Guidelines

- Use **React Query** for data fetching.
- Maintain reusable **components** in `/components`.
- Follow **Tailwind CSS** best practices for styling.
- Keep API calls in **services/** directory.
- Use **Context API** where necessary.

### Backend Guidelines

- Use **Prisma** for database interactions.
- Validate inputs using **express-validator**.
- Secure routes with **JWT authentication**.
- Use **middleware** for authentication & role-based access control.
- Follow RESTful API design.

---

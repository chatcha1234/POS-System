# Real-time POS & Business Management System 📊🚀

A modern, scalable Point of Sale (POS) system designed for real-time inventory tracking and seamless business operations. Built with a focus on data accuracy and intuitive user experience.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

## 🌟 Key Features

- **Real-time Inventory Management**: Track stock levels across different categories with automatic low-stock alerts.
- **Sales Analytics Dashboard**: Visualize daily, weekly, and monthly revenue with interactive charts.
- **Secure Authentication**: Role-based access control (RBAC) ensuring only authorized personnel can manage sensitive data.
- **Responsive Transaction System**: Optimized for both desktop and tablet use for fast checkouts.
- **Modular Component Library**: Custom-built UI components using Shadcn UI for a consistent look and feel.

## 🏗️ Technical Architecture

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/)
- **UI/UX**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [Auth.js](https://authjs.dev/) (NextAuth)
- **State Management**: React Server Components & Optimized Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL instance (Local or Cloud like Railway/Supabase)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/chatcha1234/POS-System.git
   cd POS-System
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
   AUTH_SECRET="your-secret-key"
   ```

4. **Database Migration**

   ```bash
   npx prisma migrate dev
   # npm run seed (if available)
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🛠️ Project Structure

```
├── app/              # Next.js App Router (Pages & API)
├── components/       # Reusable UI components (Shadcn)
├── lib/              # Utility functions and Prisma client
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── types/            # TypeScript interface definitions
```

---

_This project represents a full-stack implementation of a business-critical application, showcasing expertise in modern web frameworks and database management._

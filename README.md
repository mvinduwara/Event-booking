# Eventify - Full-Stack Event Booking Platform 🎟️

Eventify is a comprehensive, production-ready event management and ticketing platform. Built with a modern microservice-inspired monorepo architecture, it handles everything from secure user authentication and interactive event filtering to real money processing and automated digital ticket delivery.

## 🚀 Key Features

* **Secure Authentication:** Integrated NextAuth.js with a custom credentials provider, auto-registration, and encrypted session management.
* **Real Payment Processing:** Fully integrated Stripe Checkout with secure webhook verification for ticket purchases.
* **Digital PDF Tickets:** Client-side generation of beautiful, downloadable PDF tickets using `jsPDF`.
* **Automated Email Confirmations:** Backend integration with `nodemailer` to instantly email HTML receipts upon successful payment.
* **Admin Dashboard:** Complete management portal to register new venues and create events with local image uploads (`multer`).
* **Interactive Discovery:** Search and filter events dynamically by keyword or category.
* **User Profiles:** Personalized user dashboards to track booking history, download tickets, and update contact information.

## 💻 Tech Stack

**Frontend (Client Service):**
* [Next.js 16 (Turbopack)](https://nextjs.org/) - React framework
* [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) - Styling and components
* [NextAuth.js](https://next-auth.js.org/) - Session management
* [jsPDF](https://parall.ax/products/jspdf) - Client-side PDF generation

**Backend (API Services):**
* [Express.js](https://expressjs.com/) (Node.js) - REST API architecture
* [Prisma ORM v7](https://www.prisma.io/) - Database modeling and migrations
* [PostgreSQL 16](https://www.postgresql.org/) - Primary database
* [Stripe Node SDK](https://stripe.com/docs/api) - Payment gateway
* [Multer](https://github.com/expressjs/multer) & [Nodemailer](https://nodemailer.com/) - File uploads and email services

<img width="1919" height="914" alt="Screenshot 2026-05-08 174003" src="https://github.com/user-attachments/assets/e0024552-2642-4c32-a770-53c2400d6072" />
<hr>
<img width="1919" height="908" alt="Screenshot 2026-05-08 174022" src="https://github.com/user-attachments/assets/6b347b73-d660-44f6-82bb-ac5d64abd802" />

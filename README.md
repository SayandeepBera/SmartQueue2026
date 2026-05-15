# SmartQueue — Intelligent Queue Management Platform
 
> A full-stack web application that digitizes and streamlines queue management for hospitals, banks, government offices, clinics, and other service-based organizations. Users book virtual tokens, track their position in real time, and organizations manage their counters from a purpose-built dashboard.

---

# Tech Stack

1. Frontend: React, Tailwind CSS, Framer Motion, React Router, Axios, React Toastify
2. Backend: Node.js, Express.js, MongoDB, Mongoose
3. Auth & Security: JWT, bcrypt, OTP-based password reset
4. File Storage: Cloudinary (documents, logos, images)
5. Email: Brevo
6. Other: Multer (file uploads), Express Validator

---

# Core Features

## 1. For Users
- Browse approved organizations and their services on an interactive map
- Book virtual queue tokens with estimated wait times
- Track real-time queue position
- View token history and activity
- Live chat with support team
- Submit support inquiries

## 2. For Organization Admins
- Multi-step organization registration with document verification
- Manage service counters (create, edit, delete)
- Real-time queue management — serve, skip, promote, mark no-show tokens
- Pause or close counters
- Reset daily stats
- Analytics dashboard
- Live chat support panel

## 3. For Super Admin
- Approve, reject, suspend, or reactivate organizations
- Manage all platform users (suspend, restore, delete)
- Manage subscription plans
- View platform-wide activity logs
- Manage support channels, live chat conversations, and contact inquiries
- Configure quick-link channels dynamically

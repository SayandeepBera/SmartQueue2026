<div align="center">

<img src="https://img.shields.io/badge/SmartQueue-Intelligent%20Queue%20Management-0077B5?style=for-the-badge" alt="SmartQueue" />

# 🏥 SmartQueue — Intelligent Queue Management Platform

**Digitize. Streamline. Serve Smarter.**

A full-stack web application that eliminates physical queues for hospitals, banks, clinics, government offices, and other service-based organizations. Users book virtual tokens and track their position in real time — organizations manage everything from a purpose-built dashboard.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-SmartQueue-0077B5?style=for-the-badge)](https://smartqueue2026.onrender.com/)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)

</div>

---

## 🧭 Overview

SmartQueue replaces physical waiting lines with a fully digital queue system. Organizations register on the platform, set up service counters, and manage token flow in real time. Users browse available organizations, book virtual tokens, and track their live queue position — all from a browser.

Built for real-world service environments including:
- 🏥 Hospitals & Clinics
- 🏦 Banks & Financial Offices
- 🏛️ Government & Municipal Offices
- 🏢 Any service-based organization with walk-in queues

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Tailwind CSS | Styling & responsive design |
| Framer Motion | Animations & transitions |
| React Router | Client-side routing |
| Axios | HTTP client |
| React Toastify | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication & authorization |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Express Validator | Request validation |

### Services & Integrations
| Service | Purpose |
|---|---|
| Cloudinary | Document, logo & image storage |
| Brevo (Sendinblue) | Transactional email & OTP delivery |

---

## ✨ Features

### 👤 For Users
- 🗺️ Browse approved organizations on an **interactive map**
- 🎫 Book **virtual queue tokens** with estimated wait times
- 📍 Track **real-time queue position** live
- 📋 View full **token history & activity**
- 💬 **Live chat** with organization support team
- 📨 Submit **support inquiries**

### 🏢 For Organization Admins
- 📝 **Multi-step registration** with document verification workflow
- 🔧 Manage **service counters** — create, edit, delete
- ⚡ **Real-time queue management** — serve, skip, promote, or mark no-show tokens
- ⏸️ Pause or close counters on demand
- 🔄 **Reset daily stats** with one click
- 📊 **Analytics dashboard** — track service performance
- 💬 **Live chat support panel** to assist users

### 🛡️ For Super Admin
- ✅ **Approve, reject, suspend, or reactivate** organizations
- 👥 **Manage all platform users** — suspend, restore, delete
- 💳 Manage **subscription plans**
- 📜 View **platform-wide activity logs**
- 💬 Manage **support channels**, live chat conversations & contact inquiries
- ⚙️ Configure **quick-link channels** dynamically

---

## 👥 System Roles

```
SmartQueue
├── Super Admin       → Full platform control
├── Organization Admin → Manage own org, counters & queues
└── User              → Book tokens, track queue, chat support
```

Each role has its own protected dashboard with role-based JWT authorization enforced on both frontend routes and backend API endpoints.

---

## 📁 Project Structure

```
smartqueue/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── context/         # Auth & global state
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Axios instance, helpers
│   └── public/
│
└── server/                  # Express backend
    ├── models/              # Mongoose schemas
    ├── routes/              # API route definitions
    ├── middleware/          # Auth, validation, upload
    ├── utils/               # Email, Cloudinary helpers
    └── config/              # DB & env config
```

## 👨‍💻 Author

**Sayandeep Bera**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/sayandeep-bera)
[![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:sayandeepbera10@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/SayandeepBera)

---

<div align="center">
  <i>Built with ❤️ to eliminate waiting lines, one token at a time.</i>
</div>

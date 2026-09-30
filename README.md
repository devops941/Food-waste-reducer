# 🌱 Pantry Fresh (Food Waste Reducer)

> **"Cook what you have. Waste less."**  
> A serene, modern zero-waste kitchen and pantry assistant built with the **MERN** stack, **Tailwind CSS**, **Groq AI (LLM)**, and **Meta WhatsApp Business Messaging**.

---

## ✨ Features

- **🌿 Color-Coded Pantry Management**: Real-time expiration tracking with automated badges (*Fresh*, *Expiring Soon*, *Expired*).
- **🤖 Zero-Waste AI Recipe Studio**: Powered by Groq LLM to turn near-expiry ingredients into delicious meals tailored to user dietary preferences.
- **📲 Multi-Channel Reminders**:
  - Daily 8:00 AM scheduled background job (`node-cron`).
  - HTML email digests via **Nodemailer**.
  - Instant mobile alerts via **Meta WhatsApp Business Cloud API**.
- **📊 Household Impact & Savings Insights**: Interactive Recharts analytics tracking dollars saved, food rescued, and carbon footprint diverted.
- **🛒 Smart Shopping List**: Fast grocery checklist with 1-click recipe missing ingredient addition and *"Move to Pantry"* transfer.
- **🎨 Organic Design System**: Custom warm cream & sage palette, soft shadows, Playfair Display typography, responsive mobile-first UI.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Dotenv, CORS
- **AI & Integrations**: Groq LLM API, Meta WhatsApp Business Cloud API, Node-Cron, Nodemailer

---

## 📁 Project Structure

```
Food Waste Reducer/
├── client/                     # Frontend React (Vite) Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # ExpiryMiniChart, UseTheseFirstList
│   │   │   ├── layout/         # AppLayout, Navbar, Footer, ProtectedRoute
│   │   │   ├── pantry/         # PantryItemCard, PantryItemModal
│   │   │   ├── recipes/        # RecipeCard, RecipeDetailModal
│   │   │   └── ui/             # Reusable design system components
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── hooks/              # useAuth, usePantry, useToast
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Pantry, Recipes, Shopping, Insights, Profile
│   │   ├── services/           # Axios API modules (auth, pantry, recipes, shopping, stats)
│   │   └── utils/              # cn, dateUtils, currency formatters
│   ├── tailwind.config.js      # Curated color tokens & styling rules
│   └── package.json
│
└── server/                     # Backend Express REST API
    ├── config/                 # MongoDB database connection
    ├── controllers/            # Auth, Pantry, Recipe, Shopping, Stats controllers
    ├── jobs/                   # Node-cron daily 8 AM reminder scheduler
    ├── middleware/             # JWT auth & centralized error handler
    ├── models/                 # User, PantryItem, SavedRecipe, ShoppingItem, WasteStat
    ├── routes/                 # Express API routes
    ├── scripts/                # Database seed script (10 realistic pantry items)
    ├── services/               # Groq LLM, WhatsApp Cloud API, Nodemailer
    └── server.js               # Main Express entry point
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local MongoDB instance

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `/server` based on `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Groq LLM AI Recipe Generator
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Meta WhatsApp Business Messaging API
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ID=1636399334744443
WHATSAPP_API_VERSION=v20.0

# Email Reminders (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM="Pantry Fresh" <no-reply@pantryfresh.app>
```

#### Run Database Seed Script
Populate the database with a pre-configured demo user and 10 realistic pantry items:

```bash
npm run seed
```

*Demo Login Credentials:*
- **Email:** `demo@pantryfresh.app`
- **Password:** `password123`

#### Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
# Client runs on http://localhost:5173
```

---

## 📱 WhatsApp Business API Integration

The app supports automated expiry reminders sent directly to WhatsApp via the Meta Cloud API.
1. Enter your phone number in the **Register** or **Profile** page (e.g. `+1234567890`).
2. Toggle on **"WhatsApp Instant Reminder"**.
3. Use the **"Test WhatsApp API"** button in `/profile` to verify real-time message delivery.

---

## 🧪 Production Build Verification

To test and verify production bundles:
```bash
# In /client
npm run build
```

---

## 📄 License
MIT License. Built for mindful kitchens and a greener planet. 🌿

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6C63FF&height=200&section=header&text=CampusLink&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=The%20All-In-One%20Digital%20Campus%20Companion&descAlignY=58&descAlign=50" width="100%"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-campus--link--rosy.vercel.app-6C63FF?style=for-the-badge&logoColor=white)](https://campus-link-rosy.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

> **CampusLink** is a full-stack platform built for Thapar University students — connecting peers through ride-sharing, tutoring, a campus marketplace, team discovery, and real-time messaging, all in one unified dashboard.

<br/>

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🚗 **Ride Sharing** | Find peers traveling to the same destination — split costs, reduce footprint |
| 📚 **Peer Tutoring** | Connect with senior students for academic help, or offer your expertise |
| 🛒 **Campus Marketplace** | Buy & sell books, electronics, and dorm essentials within the campus community |
| 🤝 **Team Finder** | Discover collaborators for hackathons, projects, and ventures based on skills |
| 🚀 **Campus Ventures** | Showcase student startups and find early supporters or co-founders |
| 💬 **Real-time Chat** | Integrated messaging for seamless coordination across all services |

---

## 🛠️ Tech Stack

```
Frontend   →  Next.js 16 (App Router) · TypeScript · Tailwind CSS · Framer Motion
Backend    →  Next.js Server Actions · NextAuth.js (Google OAuth)
Database   →  PostgreSQL (NeonDB) · Prisma ORM
Storage    →  UploadThing (image/file uploads)
Deployment →  Vercel
```

---

## 📁 Project Structure

```
CampusLink/
├── app/                    # Next.js App Router (pages & API routes)
├── components/             # Reusable UI components
├── lib/                    # Utility functions & helpers
├── prisma/                 # Prisma schema & migrations
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
├── auth.ts                 # NextAuth configuration
└── tailwind.config.ts      # Tailwind configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [NeonDB](https://neon.tech) free tier)
- Google OAuth credentials

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Tanyaagarg/CampusLink.git
cd CampusLink

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database (NeonDB / PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="your-auth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### Run Locally

```bash
# Push Prisma schema to your database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🗄️ Database Schema

The schema (defined in `prisma/schema.prisma`) covers:

- **User** — profile, auth via Google OAuth
- **RidePost** — ride-share listings with route & timing
- **TutorPost** — tutoring offers with subject & availability
- **MarketplaceListing** — product listings with images
- **TeamPost** — team/project discovery posts
- **Venture** — startup showcases
- **Message / Conversation** — real-time chat between users

---

## 🌐 Deployment

The app is deployed on **Vercel** with **NeonDB** as the serverless PostgreSQL provider.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tanyaagarg/CampusLink)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for Thapar University students

<br/>

**[⬆ Back to top](#)**

<img src="https://capsule-render.vercel.app/api?type=waving&color=6C63FF&height=100&section=footer" width="100%"/>

</div>

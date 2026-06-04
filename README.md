<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563EB,50:7C3AED,100:4F46E5&height=220&section=header&text=CampusLink&fontSize=75&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=The%20All-In-One%20Digital%20Campus%20Companion%20%F0%9F%8E%93&descAlignY=58&descAlign=50" width="100%"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-campus--link--phi.vercel.app-6C63FF?style=for-the-badge)](https://campus-link-phi.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=6C63FF&center=true&vCenter=true&width=600&lines=Ride+together+%F0%9F%9A%97;Learn+from+each+other+%F0%9F%93%9A;Build+teams+that+ship+%F0%9F%9A%80;Buy+%26+sell+on+campus+%F0%9F%9B%92;All+in+one+dashboard+%E2%9C%A8" alt="Typing SVG" />
</p>

<br/>

<blockquote>
<strong>CampusLink</strong> is a full-stack web platform built for Thapar University students — connecting peers through ride-sharing, tutoring, a campus marketplace, team discovery, and real-time messaging, all in one unified dashboard.
</blockquote>

<br/>

</div>

---

## 🌟 Features

<table>
  <tr>
    <td align="center" width="200">🚗<br/><strong>Ride Sharing</strong><br/><sub>Find peers going your way — split costs & reduce carbon footprint</sub></td>
    <td align="center" width="200">📚<br/><strong>Peer Tutoring</strong><br/><sub>Get academic help from seniors or offer your own expertise</sub></td>
    <td align="center" width="200">🛒<br/><strong>Marketplace</strong><br/><sub>Buy & sell books, electronics, and dorm essentials on campus</sub></td>
  </tr>
  <tr>
    <td align="center" width="200">🤝<br/><strong>Team Finder</strong><br/><sub>Discover collaborators for hackathons & projects by skill</sub></td>
    <td align="center" width="200">🚀<br/><strong>Campus Ventures</strong><br/><sub>Showcase student startups and find co-founders or supporters</sub></td>
    <td align="center" width="200">💬<br/><strong>Real-time Chat</strong><br/><sub>Integrated messaging to coordinate across every service</sub></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 — App Router + Server Actions |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS · Framer Motion |
| **Auth** | NextAuth.js (Google OAuth) |
| **Database** | PostgreSQL via NeonDB |
| **ORM** | Prisma |
| **File Storage** | UploadThing |
| **Deployment** | Vercel |

</div>

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## 🤝 Contributing

Contributions are welcome! Here's how:

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

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563EB,50:7C3AED,100:4F46E5&height=120&section=footer" width="100%"/>

<sub>Made with ❤️ for Thapar University students</sub>

</div>

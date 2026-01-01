# CampusLink 🎓

**The All-In-One Digital Campus Companion for Thapar University**

CampusLink is a comprehensive platform designed to bridge the gap between students by integrating essential campus utilities into a single, unified dashboard. Whether you need a ride home, a study partner, a textbook, or a team for your next hackathon, CampusLink has you covered.

## 🚀 Key Features

- **🚗 Ride Sharing**: Find peers traveling to the same destination to split costs and reduce carbon footprint.
- **📚 Peer Tutoring**: Connect with senior students for academic help or offer your expertise as a tutor.
- **🛒 Campus Marketplace**: Buy and sell dorm essentials, books, and electronics safely within the campus community.
- **🤝 Team Finder**: Discover collaborators for projects, hackathons, and ventures based on skills and interests.
- **🚀 Campus Ventures**: Showcase student startups and find early supporters or co-founders.
- **💬 Real-time Chat**: Integrated messaging to facilitate seamless coordination for all the above services.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via NeonDB)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Google OAuth)
- **Real-time**: Custom polling / Server Actions

## 📦 Getting Started

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/your-username/campuslink.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env` file with `DATABASE_URL`, `AUTH_SECRET`, and Google Auth credentials.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

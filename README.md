# MemeHub - The Internet's Playground for Memes


MemeHub is a full-stack meme sharing platform where users can create, share, and track viral memes. It provides a comprehensive ecosystem for meme enthusiasts to showcase their creativity, engage with other creators, and compete for recognition on the leaderboard.

## ✨ Features

- **User Authentication** - Secure registration and login system
- **Meme Creation Studio** - Upload images or use templates to create memes
- **AI-Powered Captions** - Generate captions for your memes using AI
- **Social Interactions** - Upvote, downvote, and comment on memes
- **Personalized Dashboard** - Track your meme performance and statistics
- **Leaderboard System** - Compete with other creators for top spots
- **Achievement Badges** - Earn badges for various accomplishments
- **Responsive Design** - Fully responsive UI that works on all devices
- **Dark Mode Support** - Toggle between light and dark themes

## 🛠️ Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- react-oauth/google (Google OAuth client)

### Backend
- Node.js with Express
- MongoDB for database
- Mongoose for object modeling
- JWT for authentication
- Cloudinary for image storage
- Rate limiting, input validation, and basic protections (CORS, helmet)
- RESTful API architecture
- Google Oauth for login

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Google Cloud Console project for OAuth credentials (OAuth 2.0 Client ID)

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/memehub.git
   cd memehub
2. install client deps
   cd ../client
   npm install
   cd client
   npm run dev

### Backend Setup

3. install server deps
   cd ../server
   npm install
   cd server
   npm run dev

###🧑‍💻 Contribute

Fork the repo → create a feature branch → open a PR.

Keep PRs small and focused; add unit/integration tests where possible.

###🧾 License

MIT License — feel free to reuse and adapt.


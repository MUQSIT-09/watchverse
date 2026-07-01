# WatchVerse

WatchVerse is a modern full-stack movie & TV tracking platform where users can discover shows, track watch progress, manage their personal library, rate episodes, and maintain viewing history across devices.

Built with React, Node.js, Express, MongoDB Atlas, and Firebase Authentication.

---

## 🚀 Live Links

- Frontend (Vercel): https://watchverse-three.vercel.app  
- Backend (Render): https://watchverse-twq7.onrender.com  

---

## ✨ Features

### 🔐 Authentication (Firebase)
- Google Login
- Email Login / Signup
- Guest mode support
- Authorized domain handling for secure login

---

### 📊 Dashboard (Smart Discovery)
- Trending Shows
- Top Movies
- Top Series
- Recently Released
- Upcoming Releases
- Continue Watching
- Plan To Watch
- On Hold Shows
- Personalized hero section greeting
- Monthly activity stats (watch time, streaks, completed shows)

---

### 📚 Library System (Core Feature)
User’s personal watch tracking system with advanced features:

#### 🎬 Watch Status System
- Watching
- Completed
- Plan To Watch
- On Hold
- Rewatch / Restart Support

#### 📈 Progress Tracking
- Resume watching from last saved time
- Episode-by-episode tracking (TV shows)
- Season-based tracking system
- Auto-save watch progress

#### ⏱ Watch History System
- Stores every episode watch entry
- Tracks:
  - Season number
  - Episode number
  - Watch time
  - Start time
  - Completion time
  - Last watched timestamp

#### ⭐ Ratings & Reviews
- Rate movies & episodes
- Write personal reviews per episode
- Store feedback inside library system

#### ⏳ Duration System
- Automatic runtime normalization
- Supports both minutes & seconds conversion
- Detects completion when watch time reaches full runtime

---

### 📺 Smart TV Show Tracking
- Start Season 1 Episode 1 automatically
- Next episode progression system (S1E1 → S1E2 → …)
- Finish season button:
  - Marks season as completed
  - Auto-creates next season
  - Resets episode to 1
- Season history tracking for every show

---

### 🎞 Movie Tracking
- Mark as watched automatically when runtime completes
- Resume progress support
- Completion tracking

---

### 🎨 UI / UX System
- Fully responsive design (Mobile + Desktop)
- Horizontal scroll sliders
- Hover animations & glowing UI cards
- Skeleton loaders for smooth UX
- Clean cinematic dark theme

---

### 🎯 Sliders / Browsing Sections
- Trending Now
- Top Series
- Top Movies
- Recently Released
- Upcoming Releases

Each card:
- Shows poster, title, year, type
- Has hover effects
- Shows media metadata badges
- Optimized for performance

---

### 🧠 Smart State Handling
- Prevents navigation bugs in sliders
- Safe library sync between frontend & backend
- Auto sync with MongoDB Atlas
- Firebase UID linked database structure

---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Context API (Auth)
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB Atlas (Mongoose)
- REST API architecture

### Authentication
- Firebase Auth (Google + Email)

---

## 🧩 Core Architecture

- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB Atlas database cluster
- Firebase Authentication layer
- Fully synced watch library across devices

---

## 📦 API Features

- `/api/users/sync` → Sync Firebase user
- `/api/library/save` → Save/update library item
- `/api/library/:uid` → Get user library

---

## 🔥 Advanced Features (Highlights)

- Smart episode tracking system
- Season-based progress management
- Auto resume system
- Real-time watch history update
- Cross-device sync support
- Fully dynamic dashboard system
- Runtime normalization engine
- Safe API layer with error handling + timeout control

---

## 🧪 Future Improvements (Planned)

- AI-based recommendations
- Social sharing of watch progress
- Friends watch activity feed
- Watch parties
- Advanced analytics dashboard

---

## 📌 Summary

WatchVerse is not just a streaming tracker — it is a **complete entertainment management system** that helps users track:

- What they watch  
- Where they stopped  
- What they plan next  
- How much they have watched  
- Their entire viewing journey in a structured way  

---

## 🏁 Setup Instructions

```bash
# Install dependencies
npm install

# Start frontend
npm run dev

# Backend
cd watchverse-backend
npm install
node server.js

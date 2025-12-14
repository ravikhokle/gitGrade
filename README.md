# GitGrade

Evaluate any public GitHub repository and get a score, summary, and personalized roadmap.

Check Live: https://gitgradefront.onrender.com

Video Link of website working: https://drive.google.com/file/d/16a_e6sIsFLWLBg6F7O93SpFjbURbJYsc/view?usp=sharing

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **AI**: Google Gemini API

## Setup

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend (.env)**
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_secret
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5173
```

## Features

- GitHub repository analysis
- Score (0-100) with skill level
- AI-generated summary and roadmap
- User authentication (signup/login)
- Save evaluation results


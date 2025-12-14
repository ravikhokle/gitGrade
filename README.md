# GitGrade

GitHub repository evaluator that generates scores, summaries, and personalized roadmaps.

Ìºê **Live:** https://gitgradefront.onrender.com

Ìæ• **Demo:** https://drive.google.com/file/d/16a_e6sIsFLWLBg6F7O93SpFjbURbJYsc/view

## Approach

1. **Input Validation** - Validate GitHub URL format
2. **Data Collection** - Fetch repo metadata via GitHub API (commits, branches, PRs, languages)
3. **Static Analysis** - Clone repo and analyze structure (README quality, tests, CI/CD, license)
4. **Scoring Engine** - Calculate weighted score across 6 dimensions:
   - Code Structure (20 pts)
   - Documentation (20 pts)
   - Testing (15 pts)
   - Version Control (15 pts)
   - Project Setup (15 pts)
   - Community (15 pts)
5. **AI Summary** - Gemini API generates honest feedback and actionable roadmap (no source code sent, only metadata)

## Features

- Analyze any public GitHub repository
- Score (0-100) with skill level (Beginner/Intermediate/Advanced)
- AI-generated summary and improvement roadmap
- User authentication (signup/login)
- Save evaluation results

## Tech Stack

| Frontend | Backend | AI |
|----------|---------|-----|
| React | Node.js | Gemini API |
| Tailwind CSS | Express | |
| Vite | MongoDB | |

## Quick Start

```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables

**Backend**
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_secret
```

**Frontend**
```
VITE_API_URL=http://localhost:5000
```

# GitGrade

A MERN stack application that evaluates public GitHub repositories and generates developer scores, summaries, and personalized improvement roadmaps using the Gemini API.

## 🎯 Problem Solved

Students often don't know how their GitHub repositories appear to recruiters or mentors. GitGrade acts as a "Repository Mirror" - reflecting the real strengths and weaknesses of a project based entirely on its GitHub data.

## 🧠 Approach & Architecture

### Data Flow
```
User Input (GitHub URL)
       ↓
   Validation (Joi)
       ↓
   GitHub API (Octokit)
   - Repository metadata
   - Languages
   - Commits
   - Contributors  
   - Branches
   - Pull Requests
       ↓
   Git Clone → Static Analysis
   - File/folder structure
   - README quality
   - Test detection
   - CI/CD presence
   - License, .gitignore
       ↓
   Scoring Engine (Weighted)
   - Code Structure: 20 pts
   - Documentation: 20 pts
   - Testing: 15 pts
   - Version Control: 15 pts
   - Project Setup: 15 pts
   - Community: 15 pts
       ↓
   Gemini API (Metadata Only)
   - Honest summary
   - Actionable roadmap
       ↓
   Output: Score + Level + Summary + Roadmap
```

### Key Design Decisions

1. **Separation of Concerns**: Rule-based analysis is separate from AI reasoning
2. **Privacy-First**: No source code sent to AI - only structured metadata
3. **Transparent Scoring**: Weighted dimensions with clear categories
4. **Caching**: MongoDB stores evaluations to avoid re-processing
5. **Honest Feedback**: AI prompt designed for recruiter-style honest assessment

## ✅ Features

| Requirement | Implementation |
|-------------|----------------|
| GitHub URL Input | ✅ Validated input field |
| File/Folder Analysis | ✅ Recursive traversal |
| README Quality | ✅ Sections, code blocks, badges detection |
| Test Detection | ✅ Test files and folders |
| Commit History | ✅ Count + frequency analysis |
| Branch/PR Detection | ✅ GitHub API integration |
| Language Usage | ✅ GitHub API languages |
| CI/CD Detection | ✅ .github/workflows, .circleci |
| Score (0-100) | ✅ Weighted scoring engine |
| Skill Level | ✅ Beginner/Intermediate/Advanced |
| Written Summary | ✅ AI-generated honest evaluation |
| Personalized Roadmap | ✅ Step-by-step mentor guidance |
| User Authentication | ✅ JWT + bcrypt |
| Save Results | ✅ Logged users can save evaluations |

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI**: Google Gemini API (gemini-1.5-flash)
- **APIs**: GitHub API (Octokit), simple-git

## 🚀 Setup

### Backend
```bash
cd backend
npm install
```

Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/gitgrade
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

### Frontend
```bash
cd frontend
npm install
```

### Run
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

## 📊 Scoring Dimensions

| Dimension | Weight | Metrics |
|-----------|--------|---------|
| Code Structure | 20% | File count, folder organization, depth |
| Documentation | 20% | README presence, quality, length |
| Testing | 15% | Test files, test folders |
| Version Control | 15% | .gitignore, commits, branches, PRs |
| Project Setup | 15% | Package manager, license, CI/CD |
| Community | 15% | Stars, forks, contributors |

## 📝 API

### POST /api/repos/evaluate
```json
Request: { "url": "https://github.com/user/repo" }
Response: { "score": 75, "skillLevel": "Advanced", "summary": "...", "roadmap": "..." }
```

### POST /api/auth/signup
### POST /api/auth/login
### GET/POST/DELETE /api/saved

## 🎥 Demo

[Screen recording link - to be added]

## 👨‍💻 Author

Built for GitGrade Hackathon by UnsaidTalks
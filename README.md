# SmartCV

> AI-powered resume tailoring, ATS optimization, and resume management platform built using Next.js, FastAPI, Google Gemini, and MongoDB Atlas.

SmartCV helps users:

- Upload existing resumes
- Parse resumes into structured editable sections
- Tailor resumes for different job descriptions using AI
- Analyze ATS compatibility
- Export professional ATS-friendly PDFs
- Save and manage resumes in the cloud
- Maintain multiple resume versions for different roles

---

# ✨ Features

## 📄 Resume Upload & Parsing

- Upload PDF resumes
- Extract text using PyMuPDF
- Parse resumes into structured sections:
  - Contact Information
  - Professional Summary
  - Education
  - Experience
  - Projects
  - Skills

Supports extraction of:

- Company names
- Job titles
- Education timelines
- Project links
- GitHub repositories
- LinkedIn profiles
- Technical skills

---

## 🧠 Structured Resume Engine

Converts unstructured resumes into strongly typed data models.

Core models:

- ResumeData
- ContactInfo
- ExperienceItem
- EducationItem
- ProjectItem

Benefits:

- Reliable editing
- ATS analysis
- AI tailoring
- PDF generation
- Version control

---

## ✍️ Interactive Resume Editor

Features:

- Live editing
- Dynamic sections
- Add / Remove experiences
- Add / Remove projects
- Bullet management
- Skill management
- Real-time updates

---

## 🤖 AI Resume Tailoring

Powered by Google Gemini.

Features:

- ATS keyword alignment
- Job-specific tailoring
- Improved professional wording
- Resume optimization for different roles
- Summary enhancement
- Experience bullet refinement
- Project optimization

Safety Constraints:

- No hallucinated employers
- No fake projects
- No fabricated achievements
- No invented technologies
- Factual information preserved

---

## 📊 ATS Scoring Engine

Analyze resumes against job descriptions.

Scoring Includes:

- Keyword Matching
- JD Match Percentage
- Missing Keywords
- Resume Strengths
- Resume Weaknesses
- ATS Recommendations
- Score Breakdown
- Resume Health Metrics

Provides actionable recommendations for improving resume quality.

---

## 📚 Resume Library

Store resumes in MongoDB Atlas.

Features:

- Save resumes
- Load resumes
- Delete resumes
- Persistent cloud storage
- Resume management dashboard

---

## 🕒 Resume Version History

Maintain multiple versions of resumes.

Supports:

- Original Resume
- Tailored Resume Versions
- ATS-Optimized Variants
- Role-Specific Resume Copies

Useful for:

- AI Engineer roles
- Backend Engineer roles
- Data Analyst roles
- Internship applications

---

## 📑 Professional PDF Export

Generate polished resumes from structured data.

Templates:

- ATS Template
- Professional Template
- Modern Template

Features:

- A4 optimized export
- Multi-page support
- Print-safe rendering
- ATS-friendly formatting

---

# 🏗️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- Python
- Pydantic

## Database

- MongoDB Atlas
- Motor (Async MongoDB Driver)

## AI

- Google Gemini API

## PDF / Parsing

- PyMuPDF
- html2pdf.js

---

# 📂 Project Architecture

```bash
SmartCV/
│
├── backend/
│   ├── api/
│   ├── db/
│   ├── extractors/
│   ├── parsers/
│   ├── schemas/
│   ├── services/
│   ├── uploads/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── templates/
│   │   ├── lib/
│   │   └── styles/
│
└── README.md
```

---

# ⚙️ Core Workflow

```text
PDF Upload
    ↓
Text Extraction
    ↓
Section Parsing
    ↓
ResumeData Model
    ↓
Interactive Resume Editor
    ↓
ATS Analysis
    ↓
AI Tailoring
    ↓
Resume Versioning
    ↓
MongoDB Storage
    ↓
PDF Export
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Ironpatriot06/SmartCV.git

cd SmartCV
```

## 2. Backend Setup

```bash
cd backend

python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-2.5-flash

GEMINI_TIMEOUT_SECONDS=60

GEMINI_USE_REST=true

MONGODB_URI=your_mongodb_connection_string
```

Run Backend

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 📌 Example Workflow

1. Upload Resume PDF
2. Parse Resume
3. Edit Resume
4. Paste Job Description
5. Run ATS Analysis
6. Tailor Resume
7. Save Resume
8. Create Resume Versions
9. Export PDF

---

# 🔥 Future Roadmap

## Authentication

- Google Login
- User Profiles
- Secure Resume Ownership

## Advanced AI Features

- Cover Letter Generation
- Resume Review Assistant
- Career Gap Analysis
- Interview Question Generator
- Skill Recommendation Engine

## Analytics Dashboard

Track:

- ATS improvements
- Tailoring activity
- Resume exports
- User engagement

## Additional Templates

Planned:

- Executive
- Minimal
- Startup
- Academic CV
- Research CV

## Public Resume Links

- Shareable resume URLs
- Recruiter-friendly pages
- Portfolio mode

---

# ⚠️ Current Limitations

- Parsing quality depends on resume formatting
- Multi-column PDFs may reduce extraction accuracy
- AI tailoring quality depends on JD quality
- Free Gemini quotas may limit requests

---

# 📜 License

MIT License

---

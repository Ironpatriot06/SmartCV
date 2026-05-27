# SmartCV

> AI-powered resume tailoring and optimization platform that adapts resumes to different job descriptions while preserving factual accuracy.

SmartCV helps users:
- Upload existing resumes
- Parse them into structured editable sections
- Tailor resumes using AI for specific job roles
- Export polished ATS-friendly PDFs
- Maintain structured professional resume workflows

---

# ✨ Features

## ✅ Current Features

### 📄 Resume Upload & Parsing
- Upload PDF resumes
- Extract raw text using FastAPI backend
- Parse resumes into structured sections:
  - Summary
  - Education
  - Experience
  - Projects
  - Skills

---

### 🧠 Structured Resume Engine
- Converts unstructured resume text into typed entities
- Strongly typed architecture using:
  - `ExperienceItem`
  - `EducationItem`
  - `ProjectItem`
  - `ResumeData`

Supports:
- Company names
- Locations
- Durations
- Achievement bullets
- Technologies
- GitHub/project links

---

### ✍️ Editable Resume Workspace
Interactive resume editing UI with:
- Dynamic section editing
- Bullet management
- Project technology editing
- Structured form-based workflow
- Live state updates

---

### 🤖 AI Resume Tailoring
Tailor resumes for different job descriptions using Gemini API.

Features:
- ATS keyword alignment
- Professional wording improvements
- Role-specific optimization
- Concise bullet enhancement
- Factuality preservation

Safety constraints:
- No hallucinated experience
- No fake technologies
- No fabricated companies/projects

---

### 📑 Professional PDF Export
Generate polished resume PDFs from structured data.

Includes:
- ATS-friendly template
- Modern professional template
- Multi-page support
- A4 optimized export
- Print-safe rendering

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

## AI
- Google Gemini API

## PDF / Parsing
- PyMuPDF
- html2pdf.js

---

# 📂 Project Architecture

```bash
SmartCV/
├── backend/
│   ├── api/
│   ├── parsers/
│   ├── services/
│   ├── schemas/
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

# CORE ARCHITECHTURE
```
PDF Upload
   ↓
Text Extraction
   ↓
Section Parsing
   ↓
Typed ResumeData Model
   ↓
Editable Resume Workspace
   ↓
AI Tailoring
   ↓
PDF Export
```

🚀 Getting Started

1. Clone Repository
```
git clone https://github.com/ironpatriot06/SmartCV.git
cd SmartCV
```
2. Backend Setup
```
cd backend

python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

# Create .env
GEMINI_API_KEY=your_api_key

#Run backend
uvicorn main:app --reload

#Backend runs on
http://127.0.0.1:8000
```

3. Frontend Setup
```
cd frontend

npm install
npm run dev


# Frontend runs on
http://localhost:3000
```

📌 Example Workflow

1. Upload resume PDF
2. Resume gets parsed into sections
3. Edit structured fields
4. Paste target job description
5. AI tailors resume
6. Export polished PDF

⸻

🔥 Planned Features

📊 ATS Scoring Engine

* Keyword matching
* Section scoring
* Formatting checks
* Role relevance analysis
* Improvement recommendations

⸻

🧾 Resume Versioning

* Resume history
* Restore previous versions
* AI-generated resume iterations
* Comparison diffs

⸻

👤 Authentication

* Google Auth
* Persistent resumes
* Cloud sync

⸻

☁️ Database Integration

Planned:

* Supabase integration
* Resume persistence
* Version storage
* Analytics tracking

⸻

📈 Analytics Dashboard

Track:

* Tailoring usage
* Export counts
* User engagement
* Template popularity

⸻

🎨 More Resume Templates

Planned templates:

* Executive
* Compact
* Minimal
* Startup-style
* Academic CV

⸻

🌐 Public Resume Links

Generate shareable:

* Portfolio-style resumes
* Public resume pages
* Recruiter links

⸻

🧠 Advanced AI Features

Future roadmap:

* AI bullet generation
* Role gap analysis
* Skill recommendation engine
* Interview preparation
* Career transition optimization

⸻

🎯 Design Goals

SmartCV is designed to:

* Keep resumes ATS-friendly
* Preserve factual accuracy
* Avoid AI hallucinations
* Provide structured editing workflows
* Support scalable resume automation

⸻

⚠️ Current Limitations

* Parsing quality depends on resume formatting
* AI tailoring quality depends on job description clarity
* Complex multi-column PDFs may parse imperfectly
* ATS scoring engine not implemented yet

⸻

📜 License

MIT License

⸻

👨‍💻 Author

Built by Ratish Kapoor

* LinkedIn: linkedin.com/in/ratish-kapoor
* GitHub: github.com/Ironpatriot06

⸻

🌟 Vision

SmartCV aims to become a complete AI-powered resume operating system:

* Resume optimization
* Intelligent tailoring
* ATS analysis
* Career positioning
* Professional branding

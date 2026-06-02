# EduPulse AI - Classroom Learning Gap & Feedback Engine

EduPulse AI is a full-stack, lightweight web application built to help teachers quickly detect student learning gaps, automate personalized feedback, and arrange dynamic classroom interventions.

---

## Stand-out Feature: AI Smart-Grouping & Peer-Tutoring Engine
EduPulse AI doesn't just show charts; it actively organizes the classroom to bridge learning gaps:
1. **Dynamic Remedial Groups**: Automatically groups students struggling with identical concepts (score <60%) and generates a tailored group activity (e.g. paper fraction strips, friction ramps, circuit building).
2. **Peer-Tutoring Pairings**: Matches a "Student Mentor" (scored >85% in a concept) with a "Student Peer" (scored <60% in that same concept) for a peer-guided worksheet review.

---

## Technology Stack
- **Frontend**: React, Tailwind CSS, Chart.js (via `react-chartjs-2`), Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn.
- **Database**: SQLite (SQLAlchemy ORM).
- **AI Feedback**: Rule-based Python template engine (fully functional local offline MVP, zero paid API keys or internet connection required).

---

## Project Directory Structure
```
edupulse-ai/
├── main.py                  # Root entrypoint to launch backend uvicorn server
├── backend/
│   ├── main.py              # FastAPI routers and endpoints
│   ├── database.py          # SQLite database connection setup
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── crud.py              # Database query operations
│   ├── analysis.py          # Learning gap classification, feedback generation, groupings
│   ├── sample_data.py       # Seeds 7 students and multiple tests on first run
│   └── requirements.txt     # Backend python dependencies
├── frontend/
│   ├── index.html           # Root HTML structure
│   ├── tailwind.config.js   # Tailwind configurations
│   ├── postcss.config.js    # PostCSS configurations
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Top navigation header
│   │   │   ├── Dashboard.jsx # Overview cards, watchlist, gap overview
│   │   │   ├── SmartGroups.jsx # Smart grouping & tutoring pairing engine
│   │   │   ├── StudentList.jsx # Student CRUD operations
│   │   │   ├── StudentDetail.jsx # Student performance card, recommendations, trend chart
│   │   │   └── AssessmentUpload.jsx # Log new test scores
│   │   ├── App.jsx          # Screen routing and global state controller
│   │   ├── index.css        # Tailwind imports and premium styles
│   │   └── main.jsx         # React mounting bootstrapper
│   └── package.json         # Node package manager dependencies
└── README.md                # Documentation and running instructions
```

---

## Setup & Execution Guide

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** & **npm**

### Step 1: Run the Backend API
1. Open a terminal in the root `edupulse-ai` directory.
2. Install Python packages:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   *FastAPI will start running at `http://127.0.0.1:8000`. On first run, it will automatically create `edupulse.db` and seed sample student records and assessments.*

### Step 2: Run the Frontend UI
1. Open a second terminal in the `edupulse-ai/frontend` directory.
2. Install node dependencies (if not already installed during setup):
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Vite will start the client UI at `http://localhost:5173`. Open this link in your browser.*

---

## API Endpoints Documentation

### Student Management
- `GET /api/students`: Lists all students.
- `GET /api/students/{id}`: Detailed profile with historical scores, trend data, risk levels, and generated AI feedback.
- `POST /api/students`: Create a new student profile (Fields: `name`, `grade`, `roll_number`).
- `PUT /api/students/{id}`: Update student details.
- `DELETE /api/students/{id}`: Delete a student and all their assessment history.

### Assessment Management
- `POST /api/assessments`: Records test scores. Accepts a student ID, subject, and a mapping of concept scores (e.g. `{"Fractions": 40, "Algebra": 80}`).
- `GET /api/assessments`: Retrieves a historical list of all recorded tests.

### Analytics & Smart Groups
- `GET /api/dashboard/stats`: Returns KPI metrics (total students, class average, high-risk counts, number of weak concepts).
- `GET /api/dashboard/insights`: Compiles averages per concept and student struggle totals for charting.
- `GET /api/dashboard/groupings`: Triggers the smart-grouping engine to categorize students by common weak spots and generate mentor-peer tutor matches.

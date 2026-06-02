from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

import models
import schemas
import crud
import analysis
from database import engine, Base, get_db
from sample_data import seed_sample_data

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database on startup
db = next(get_db())
try:
    seed_sample_data(db)
finally:
    db.close()

app = FastAPI(
    title="EduPulse AI API",
    description="API server for tracking learning gaps, generating automated feedback, and classroom groupings.",
    version="1.0.0"
)

# Enable CORS for frontend connection (port 5173 for Vite React app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get analyzed student profiles
def get_all_analyzed_students(db: Session) -> List[Dict[str, Any]]:
    students = db.query(models.Student).all()
    analyzed = []
    for s in students:
        assessments = db.query(models.Assessment).filter(models.Assessment.student_id == s.id).all()
        analyzed.append(analysis.analyze_student_assessments(s, assessments))
    return analyzed

# --- STUDENT ENDPOINTS ---

@app.get("/api/students", response_model=List[schemas.StudentOut])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_students(db, skip=skip, limit=limit)

@app.get("/api/students/{student_id}", response_model=Dict[str, Any])
def read_student_detail(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    assessments = db.query(models.Assessment).filter(models.Assessment.student_id == student_id).all()
    analysis_result = analysis.analyze_student_assessments(student, assessments)
    
    # Also attach assessment list for historical display
    serialized_assessments = []
    for a in assessments:
        serialized_assessments.append({
            "id": a.id,
            "subject": a.subject,
            "date": a.date,
            "scores": [{"concept_name": s.concept_name, "score": s.score} for s in a.scores]
        })
    analysis_result["assessments"] = serialized_assessments
    return analysis_result

@app.post("/api/students", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def add_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = crud.get_student_by_roll_number(db, roll_number=student.roll_number)
    if db_student:
        raise HTTPException(status_code=400, detail="Roll number already registered")
    return crud.create_student(db=db, student=student)

@app.put("/api/students/{student_id}", response_model=schemas.StudentOut)
def update_student_details(student_id: int, student: schemas.StudentUpdate, db: Session = Depends(get_db)):
    db_student = crud.update_student(db=db, student_id=student_id, student=student)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

@app.delete("/api/students/{student_id}")
def delete_student_record(student_id: int, db: Session = Depends(get_db)):
    db_student = crud.delete_student(db=db, student_id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": f"Successfully deleted student {db_student.name}"}

# --- ASSESSMENT ENDPOINTS ---

@app.post("/api/assessments", status_code=status.HTTP_201_CREATED)
def record_assessment(assessment: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id=assessment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db_assessment = crud.create_assessment(db=db, assessment=assessment)
    return {"message": "Assessment recorded successfully", "assessment_id": db_assessment.id}

@app.get("/api/assessments")
def list_assessments(db: Session = Depends(get_db)):
    assessments = crud.get_assessments(db)
    result = []
    for a in assessments:
        student = crud.get_student(db, a.student_id)
        result.append({
            "id": a.id,
            "student_name": student.name if student else "Unknown",
            "roll_number": student.roll_number if student else "N/A",
            "subject": a.subject,
            "date": a.date,
            "scores": {s.concept_name: s.score for s in a.scores}
        })
    return result

# --- ANALYTICS & DASHBOARD ENDPOINTS ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    analyzed_students = get_all_analyzed_students(db)
    total_students = len(analyzed_students)
    
    if total_students == 0:
        return {
            "total_students": 0,
            "class_average": 0.0,
            "struggling_students": 0,
            "weak_concepts_count": 0,
            "risk_distribution": {"High Risk": 0, "Medium Risk": 0, "Low Risk": 0}
        }
    
    # Class averages
    valid_scores_sums = 0
    valid_students_count = 0
    struggling_count = 0
    risk_dist = {"High Risk": 0, "Medium Risk": 0, "Low Risk": 0}
    
    # Keep track of concept averages to find class-wide weak concepts
    concept_sums = {}
    concept_counts = {}

    for s in analyzed_students:
        risk_dist[s["risk_level"]] += 1
        if s["risk_level"] == "High Risk":
            struggling_count += 1
        
        if s["average_score"] > 0:
            valid_scores_sums += s["average_score"]
            valid_students_count += 1
            
        for concept, score in s.get("latest_scores", {}).items():
            concept_sums[concept] = concept_sums.get(concept, 0.0) + score
            concept_counts[concept] = concept_counts.get(concept, 0) + 1

    class_avg = round(valid_scores_sums / valid_students_count, 1) if valid_students_count > 0 else 0.0
    
    # Identify how many concepts have class averages below 60%
    weak_concepts_count = 0
    for concept, total_score in concept_sums.items():
        count = concept_counts[concept]
        avg = total_score / count
        if avg < 60.0:
            weak_concepts_count += 1

    return {
        "total_students": total_students,
        "class_average": class_avg,
        "struggling_students": struggling_count,
        "weak_concepts_count": weak_concepts_count,
        "risk_distribution": risk_dist
    }

@app.get("/api/dashboard/insights")
def get_classroom_insights(db: Session = Depends(get_db)):
    analyzed_students = get_all_analyzed_students(db)
    
    concept_sums = {}
    concept_counts = {}
    concept_struggling = {}

    for s in analyzed_students:
        for concept, score in s.get("latest_scores", {}).items():
            concept_sums[concept] = concept_sums.get(concept, 0.0) + score
            concept_counts[concept] = concept_counts.get(concept, 0) + 1
            
            if score < 60.0:
                concept_struggling[concept] = concept_struggling.get(concept, 0) + 1

    # Format data for charts
    concept_averages = []
    struggling_per_concept = []
    
    for concept, total_score in concept_sums.items():
        count = concept_counts[concept]
        avg = round(total_score / count, 1)
        concept_averages.append({
            "concept": concept,
            "average": avg
        })
        struggling_per_concept.append({
            "concept": concept,
            "count": concept_struggling.get(concept, 0)
        })

    # Sort to find weakest concepts
    weakest_concepts = sorted(concept_averages, key=lambda x: x["average"])[:5]

    return {
        "concept_averages": concept_averages,
        "struggling_per_concept": struggling_per_concept,
        "weakest_concepts": weakest_concepts
    }

@app.get("/api/dashboard/groupings")
def get_remedial_groupings(db: Session = Depends(get_db)):
    analyzed_students = get_all_analyzed_students(db)
    return analysis.get_smart_groupings(analyzed_students)

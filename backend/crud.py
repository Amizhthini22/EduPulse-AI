from sqlalchemy.orm import Session
import models
import schemas
from datetime import datetime

# Student CRUD
def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_roll_number(db: Session, roll_number: str):
    return db.query(models.Student).filter(models.Student.roll_number == roll_number).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        name=student.name,
        grade=student.grade,
        roll_number=student.roll_number
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student: schemas.StudentUpdate):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    
    update_data = student.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
        
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    db.delete(db_student)
    db.commit()
    return db_student

# Assessment CRUD
def get_assessments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Assessment).offset(skip).limit(limit).all()

def get_student_assessments(db: Session, student_id: int):
    return db.query(models.Assessment).filter(models.Assessment.student_id == student_id).all()

def create_assessment(db: Session, assessment: schemas.AssessmentCreate):
    db_assessment = models.Assessment(
        student_id=assessment.student_id,
        subject=assessment.subject,
        date=datetime.utcnow()
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    # Add concept scores
    for name, score in assessment.scores.items():
        db_score = models.ConceptScore(
            assessment_id=db_assessment.id,
            concept_name=name,
            score=score
        )
        db.add(db_score)
    
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

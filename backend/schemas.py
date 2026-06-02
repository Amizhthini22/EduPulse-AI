from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# Concept Score Schemas
class ConceptScoreBase(BaseModel):
    concept_name: str
    score: float = Field(..., ge=0, le=100)

class ConceptScoreCreate(ConceptScoreBase):
    pass

class ConceptScoreOut(ConceptScoreBase):
    id: int
    assessment_id: int

    class Config:
        from_attributes = True

# Assessment Schemas
class AssessmentBase(BaseModel):
    subject: str
    student_id: int

class AssessmentCreate(BaseModel):
    student_id: int
    subject: str
    scores: Dict[str, float] # Dynamic concept mapping: {"Fractions": 80.0, "Algebra": 45.0}

class AssessmentOut(BaseModel):
    id: int
    student_id: int
    subject: str
    date: datetime
    scores: List[ConceptScoreBase]

    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    name: str = Field(..., min_length=1)
    grade: str = Field(..., min_length=1)
    roll_number: str = Field(..., min_length=1)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    roll_number: Optional[str] = None

class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True

class StudentDetailOut(StudentOut):
    assessments: List[AssessmentOut] = []

    class Config:
        from_attributes = True

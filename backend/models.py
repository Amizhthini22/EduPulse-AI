from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)

    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="assessments")
    scores = relationship("ConceptScore", back_populates="assessment", cascade="all, delete-orphan")

class ConceptScore(Base):
    __tablename__ = "concept_scores"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    concept_name = Column(String, nullable=False)
    score = Column(Float, nullable=False) # 0 to 100

    assessment = relationship("Assessment", back_populates="scores")

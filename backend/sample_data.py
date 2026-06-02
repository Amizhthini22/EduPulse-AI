from sqlalchemy.orm import Session
import models
from datetime import datetime, timedelta

def seed_sample_data(db: Session):
    # Check if we already have students
    if db.query(models.Student).first() is not None:
        return # Data already exists

    # 1. Create Students
    sample_students = [
        {"name": "Bobby Brown", "grade": "8th Grade", "roll_number": "R101"},
        {"name": "Clara Smith", "grade": "8th Grade", "roll_number": "R102"},
        {"name": "David Lee", "grade": "8th Grade", "roll_number": "R103"},
        {"name": "Emma Watson", "grade": "8th Grade", "roll_number": "R104"},
        {"name": "Frank Miller", "grade": "8th Grade", "roll_number": "R105"},
        {"name": "Grace Hopper", "grade": "8th Grade", "roll_number": "R106"},
        {"name": "John Doe", "grade": "8th Grade", "roll_number": "R107"}
    ]

    db_students = []
    for s in sample_students:
        db_student = models.Student(
            name=s["name"],
            grade=s["grade"],
            roll_number=s["roll_number"]
        )
        db.add(db_student)
        db_students.append(db_student)
    db.commit()

    # Retrieve students to ensure IDs are populated
    for s in db_students:
        db.refresh(s)

    # Student references
    bobby = db_students[0]
    clara = db_students[1]
    david = db_students[2]
    emma = db_students[3]
    frank = db_students[4]
    grace = db_students[5]
    john = db_students[6]

    # Helper function to add historical assessments
    def add_historical_assessment(student_id, subject, days_ago, scores_dict):
        date = datetime.utcnow() - timedelta(days=days_ago)
        assessment = models.Assessment(
            student_id=student_id,
            subject=subject,
            date=date
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        for concept, score in scores_dict.items():
            concept_score = models.ConceptScore(
                assessment_id=assessment.id,
                concept_name=concept,
                score=score
            )
            db.add(concept_score)
        db.commit()

    # 2. Add Mathematics assessments (showing trends over 3 tests)
    # Test 1 (30 days ago)
    add_historical_assessment(bobby.id, "Mathematics", 30, {"Fractions": 30.0, "Algebra": 70.0, "Geometry": 48.0, "Word Problems": 25.0})
    add_historical_assessment(clara.id, "Mathematics", 30, {"Fractions": 85.0, "Algebra": 90.0, "Geometry": 88.0, "Word Problems": 80.0})
    add_historical_assessment(david.id, "Mathematics", 30, {"Fractions": 60.0, "Algebra": 65.0, "Geometry": 55.0, "Word Problems": 70.0})
    add_historical_assessment(emma.id, "Mathematics", 30, {"Fractions": 72.0, "Algebra": 80.0, "Geometry": 78.0, "Word Problems": 68.0})
    add_historical_assessment(frank.id, "Mathematics", 30, {"Fractions": 45.0, "Algebra": 82.0, "Geometry": 70.0, "Word Problems": 58.0})
    add_historical_assessment(grace.id, "Mathematics", 30, {"Fractions": 92.0, "Algebra": 95.0, "Geometry": 94.0, "Word Problems": 96.0})
    add_historical_assessment(john.id, "Mathematics", 30, {"Fractions": 58.0, "Algebra": 62.0, "Geometry": 60.0, "Word Problems": 50.0})

    # Test 2 (15 days ago)
    add_historical_assessment(bobby.id, "Mathematics", 15, {"Fractions": 35.0, "Algebra": 75.0, "Geometry": 52.0, "Word Problems": 28.0})
    add_historical_assessment(clara.id, "Mathematics", 15, {"Fractions": 88.0, "Algebra": 92.0, "Geometry": 90.0, "Word Problems": 85.0})
    add_historical_assessment(david.id, "Mathematics", 15, {"Fractions": 62.0, "Algebra": 68.0, "Geometry": 58.0, "Word Problems": 72.0})
    add_historical_assessment(emma.id, "Mathematics", 15, {"Fractions": 75.0, "Algebra": 82.0, "Geometry": 80.0, "Word Problems": 70.0})
    add_historical_assessment(frank.id, "Mathematics", 15, {"Fractions": 50.0, "Algebra": 85.0, "Geometry": 72.0, "Word Problems": 60.0})
    add_historical_assessment(grace.id, "Mathematics", 15, {"Fractions": 95.0, "Algebra": 98.0, "Geometry": 96.0, "Word Problems": 97.0})
    add_historical_assessment(john.id, "Mathematics", 15, {"Fractions": 60.0, "Algebra": 65.0, "Geometry": 62.0, "Word Problems": 55.0})

    # Test 3 (Latest - 2 days ago)
    add_historical_assessment(bobby.id, "Mathematics", 2, {"Fractions": 40.0, "Algebra": 80.0, "Geometry": 55.0, "Word Problems": 30.0})
    add_historical_assessment(clara.id, "Mathematics", 2, {"Fractions": 92.0, "Algebra": 95.0, "Geometry": 94.0, "Word Problems": 90.0})
    add_historical_assessment(david.id, "Mathematics", 2, {"Fractions": 65.0, "Algebra": 72.0, "Geometry": 59.0, "Word Problems": 75.0})
    add_historical_assessment(emma.id, "Mathematics", 2, {"Fractions": 78.0, "Algebra": 85.0, "Geometry": 82.0, "Word Problems": 74.0})
    add_historical_assessment(frank.id, "Mathematics", 2, {"Fractions": 55.0, "Algebra": 88.0, "Geometry": 75.0, "Word Problems": 62.0})
    add_historical_assessment(grace.id, "Mathematics", 2, {"Fractions": 96.0, "Algebra": 99.0, "Geometry": 98.0, "Word Problems": 98.0})
    add_historical_assessment(john.id, "Mathematics", 2, {"Fractions": 63.0, "Algebra": 68.0, "Geometry": 65.0, "Word Problems": 58.0})

    # 3. Add Science assessments (latest - 5 days ago)
    add_historical_assessment(bobby.id, "Science", 5, {"Photosynthesis": 65.0, "Forces": 60.0, "Circuits": 45.0, "Ecosystems": 70.0})
    add_historical_assessment(clara.id, "Science", 5, {"Photosynthesis": 94.0, "Forces": 92.0, "Circuits": 96.0, "Ecosystems": 95.0})
    add_historical_assessment(david.id, "Science", 5, {"Photosynthesis": 72.0, "Forces": 70.0, "Circuits": 68.0, "Ecosystems": 74.0})
    add_historical_assessment(emma.id, "Science", 5, {"Photosynthesis": 80.0, "Forces": 78.0, "Circuits": 55.0, "Ecosystems": 82.0})
    add_historical_assessment(frank.id, "Science", 5, {"Photosynthesis": 70.0, "Forces": 72.0, "Circuits": 64.0, "Ecosystems": 75.0})
    add_historical_assessment(grace.id, "Science", 5, {"Photosynthesis": 98.0, "Forces": 96.0, "Circuits": 95.0, "Ecosystems": 99.0})
    add_historical_assessment(john.id, "Science", 5, {"Photosynthesis": 62.0, "Forces": 60.0, "Circuits": 50.0, "Ecosystems": 64.0})

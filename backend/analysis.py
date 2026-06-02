from typing import List, Dict, Any

# Dynamic database of remedial suggestions by concept
CONCEPT_RESOURCES = {
    "Mathematics": {
        "Fractions": {
            "remedial_action": "Provide 15 minutes of guided practice on Fractions using visual fraction models (pizza slices or bar models).",
            "suggested_activity": "Create paper fraction strips to physically compare sizes and build equivalence intuition.",
            "homework": "Complete a 10-question worksheet matching visual representations to fraction symbols."
        },
        "Algebra": {
            "remedial_action": "Use hands-on balance scales or algebra tiles to visualize solving linear equations.",
            "suggested_activity": "Play the 'Equation Balancing' game in pairs with algebraic cards.",
            "homework": "Solve 5 single-step and 5 two-step linear equations showing balancing steps."
        },
        "Geometry": {
            "remedial_action": "Provide 3D models and nets to explain perimeter, area, and surface volume concepts.",
            "suggested_activity": "Construct 3D shapes from paper templates and calculate their dimensions.",
            "homework": "Measure and calculate the area of three rectangular objects in your household."
        },
        "Word Problems": {
            "remedial_action": "Teach the CUBES method (Circle numbers, Underline question, Box key words, Evaluate, Solve).",
            "suggested_activity": "Partner activity: Translate written scenarios into mathematical equations before solving.",
            "homework": "Break down and solve 5 scenario-based word problems using the CUBES checklist."
        }
    },
    "Science": {
        "Photosynthesis": {
            "remedial_action": "Use interactive diagrams of chloroplasts to trace inputs and outputs of light/dark reactions.",
            "suggested_activity": "Roleplay the photosynthesis chemical equation with students representing Carbon, Hydrogen, and Oxygen.",
            "homework": "Draw and label a color-coded diagram showing the light reactions and Calvin cycle."
        },
        "Forces": {
            "remedial_action": "Demonstrate balanced vs. unbalanced forces using spring scales and friction blocks.",
            "suggested_activity": "Build a simple balloon-powered racer to study force, mass, and acceleration.",
            "homework": "Log and explain 5 examples of friction and gravity observed in daily life."
        },
        "Circuits": {
            "remedial_action": "Build virtual series and parallel circuits using free interactive circuit simulators.",
            "suggested_activity": "Assemble physical circuit loops using light bulbs, wires, and D-batteries to trace gaps.",
            "homework": "Determine if 5 illustrated circuit diagrams are complete, short, or open, with reasons."
        },
        "Ecosystems": {
            "remedial_action": "Review trophic levels using food web cards to trace energy transfers.",
            "suggested_activity": "Model food chain disruptions by simulating the elimination of a keystone species.",
            "homework": "Select a local animal and map its food web, identifying producers, consumers, and decomposers."
        }
    },
    "English": {
        "Grammar": {
            "remedial_action": "Conduct targeted drills focusing on subject-verb agreement and pronoun usage.",
            "suggested_activity": "Sentence surgery: Spot errors in a paragraph written on the board and 'heal' them.",
            "homework": "Complete a 15-sentence correction sheet fixing subject-verb agreement errors."
        },
        "Punctuation": {
            "remedial_action": "Review formatting dialogue, comma splices, and semicolon usage.",
            "suggested_activity": "Take a completely unpunctuated text passage and insert appropriate markers in teams.",
            "homework": "Re-write a short dialogue narrative, correctly using quotation marks and comma placements."
        },
        "Vocabulary": {
            "remedial_action": "Introduce context clue strategies to deduce unfamiliar words.",
            "suggested_activity": "Vocabulary matching charades: Act out definitions while peers guess context words.",
            "homework": "Select 5 new words from the reading list and write sentences using context clues."
        },
        "Reading Comprehension": {
            "remedial_action": "Use guided reading sessions to model scanning text and identifying primary arguments.",
            "suggested_activity": "Complete a story-mapping graphic organizer summarizing characters, setting, conflict, and theme.",
            "homework": "Read a 1-page article and write a 3-sentence summary covering Who, What, and Why."
        }
    }
}

# Fallback defaults for unrecognized concepts
DEFAULT_REMEDIAL = {
    "remedial_action": "Review core concepts of {concept} with guided flashcards and step-by-step example walks.",
    "suggested_activity": "Create a mind map connecting {concept} to previously mastered lessons.",
    "homework": "Summarize 3 key rules of {concept} and solve 5 review problems."
}

def analyze_concept_score(score: float) -> str:
    """Categorize scores into Weak, Moderate, or Strong."""
    if score < 60.0:
        return "Weak"
    elif score <= 75.0:
        return "Moderate"
    else:
        return "Strong"

def calculate_risk_level(average_score: float, weak_count: int) -> str:
    """Determine student risk level based on performance criteria."""
    if average_score < 60.0 or weak_count >= 2:
        return "High Risk"
    elif average_score <= 75.0 or weak_count == 1:
        return "Medium Risk"
    else:
        return "Low Risk"

def get_concept_details(subject: str, concept: str) -> Dict[str, str]:
    """Retrieve remedial suggestions, activities, and homework for a concept."""
    subject_dict = CONCEPT_RESOURCES.get(subject, {})
    concept_details = subject_dict.get(concept)
    if not concept_details:
        # Fallback dynamic creation
        return {
            "remedial_action": DEFAULT_REMEDIAL["remedial_action"].format(concept=concept),
            "suggested_activity": DEFAULT_REMEDIAL["suggested_activity"].format(concept=concept),
            "homework": DEFAULT_REMEDIAL["homework"].format(concept=concept)
        }
    return concept_details

def generate_feedback(student_name: str, concept_scores: Dict[str, float]) -> str:
    """Generate personalized feedback based on strong and weak concepts."""
    if not concept_scores:
        return f"No assessment data available for {student_name}."

    strong_concepts = [c for c, s in concept_scores.items() if s > 75.0]
    weak_concepts = [c for c, s in concept_scores.items() if s < 60.0]
    moderate_concepts = [c for c, s in concept_scores.items() if 60.0 <= s <= 75.0]

    # Feedback Templates
    if weak_concepts and strong_concepts:
        strong_str = ", ".join(strong_concepts)
        weak_str = ", ".join(weak_concepts)
        return (f"{student_name} demonstrates good understanding of {strong_str} "
                f"but requires additional support in {weak_str}. "
                f"Recommend focused practice and small-group intervention to bridge the gaps.")
    
    elif weak_concepts:
        weak_str = ", ".join(weak_concepts)
        return (f"{student_name} is struggling with core components, particularly {weak_str}. "
                f"They need immediate visual aids, remedial review, and structured scaffolding support.")
        
    elif strong_concepts:
        strong_str = ", ".join(strong_concepts)
        return (f"{student_name} shows excellent mastery across the board, particularly in {strong_str}. "
                f"Encourage enrichment activities and peer mentoring challenges to sustain engagement.")
    
    else:
        mod_str = ", ".join(moderate_concepts)
        return (f"{student_name} is performing at grade level in {mod_str}. "
                f"Consolidation of these concepts through review worksheets will lock in understanding.")

def generate_recommendations(subject: str, concept_scores: Dict[str, float]) -> List[Dict[str, Any]]:
    """Generate recommendation objects for weak concepts."""
    recommendations = []
    for concept, score in concept_scores.items():
        if score < 60.0:
            details = get_concept_details(subject, concept)
            recommendations.append({
                "concept": concept,
                "score": score,
                "remedial_action": details["remedial_action"],
                "suggested_activity": details["suggested_activity"],
                "homework": details["homework"]
            })
    return recommendations

def analyze_student_assessments(student: Any, assessments: List[Any]) -> Dict[str, Any]:
    """Analyze a single student's assessments, giving overall stats, weak concepts, and feedback."""
    if not assessments:
        return {
            "student_id": student.id,
            "name": student.name,
            "grade": student.grade,
            "roll_number": student.roll_number,
            "average_score": 0.0,
            "risk_level": "Low Risk",
            "weak_concepts": [],
            "moderate_concepts": [],
            "strong_concepts": [],
            "feedback": f"No assessment history yet for {student.name}.",
            "recommendations": []
        }

    # Gather latest concept scores
    # If student has multiple assessments, let's look at the latest score for each unique concept
    latest_scores = {}
    subject = assessments[-1].subject # Use latest assessment's subject
    
    # Sort assessments by date (ascending) so latest overwrites earlier
    sorted_assessments = sorted(assessments, key=lambda x: x.date)
    for a in sorted_assessments:
        for score_obj in a.scores:
            latest_scores[score_obj.concept_name] = score_obj.score

    if not latest_scores:
        return {
            "student_id": student.id,
            "name": student.name,
            "grade": student.grade,
            "roll_number": student.roll_number,
            "average_score": 0.0,
            "risk_level": "Low Risk",
            "weak_concepts": [],
            "moderate_concepts": [],
            "strong_concepts": [],
            "feedback": f"No concept scores available for {student.name}.",
            "recommendations": []
        }

    total_score = sum(latest_scores.values())
    avg_score = total_score / len(latest_scores)

    weak_concepts = [c for c, s in latest_scores.items() if s < 60.0]
    moderate_concepts = [c for c, s in latest_scores.items() if 60.0 <= s <= 75.0]
    strong_concepts = [c for c, s in latest_scores.items() if s > 75.0]

    risk_level = calculate_risk_level(avg_score, len(weak_concepts))
    feedback = generate_feedback(student.name, latest_scores)
    recs = generate_recommendations(subject, latest_scores)

    return {
        "student_id": student.id,
        "name": student.name,
        "grade": student.grade,
        "roll_number": student.roll_number,
        "average_score": round(avg_score, 1),
        "risk_level": risk_level,
        "weak_concepts": weak_concepts,
        "moderate_concepts": moderate_concepts,
        "strong_concepts": strong_concepts,
        "feedback": feedback,
        "recommendations": recs,
        "latest_scores": latest_scores
    }

def get_smart_groupings(students_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Groups students dynamically based on concept performance.
    - Groups: For each concept, list students scoring < 60%
    - Peer Matcher: Pair a student with score < 60% in a concept with a mentor score > 85% in that concept.
    """
    remedial_groups = {}
    concept_mentors = {}
    concept_subjects = {} # Mapping concept to subject for getting recommendations
    
    # Fill in scores and categorize
    for s in students_data:
        # Check latest scores from their analysis packet
        latest_scores = s.get("latest_scores", {})
        for concept, score in latest_scores.items():
            # Estimate subject from recommendations or set default
            subj = "Mathematics"
            if s.get("recommendations"):
                # We can grab subject from the first recommendation's subject details
                pass
            
            # Simple heuristic to determine subject
            if concept in CONCEPT_RESOURCES["Science"]:
                subj = "Science"
            elif concept in CONCEPT_RESOURCES["English"]:
                subj = "English"

            concept_subjects[concept] = subj

            if score < 60.0:
                if concept not in remedial_groups:
                    remedial_groups[concept] = []
                remedial_groups[concept].append({
                    "id": s["student_id"],
                    "name": s["name"],
                    "roll_number": s["roll_number"],
                    "score": score
                })
            elif score > 85.0:
                if concept not in concept_mentors:
                    concept_mentors[concept] = []
                concept_mentors[concept].append({
                    "id": s["student_id"],
                    "name": s["name"],
                    "roll_number": s["roll_number"],
                    "score": score
                })

    # Build response packages for groupings
    groups_list = []
    for concept, struggling in remedial_groups.items():
        subject = concept_subjects.get(concept, "Mathematics")
        details = get_concept_details(subject, concept)
        groups_list.append({
            "concept": concept,
            "subject": subject,
            "struggling_students": struggling,
            "remedial_action": details["remedial_action"],
            "suggested_activity": details["suggested_activity"]
        })

    # Build Peer-Tutoring Pairings
    pairings = []
    # We iterate over concepts that have struggling students
    for concept, struggling in remedial_groups.items():
        mentors = concept_mentors.get(concept, [])
        if not mentors:
            continue
        
        # Match them: round-robin or simple pairs
        # For each struggling student, pair them with a mentor if available
        for idx, tutee in enumerate(struggling):
            mentor = mentors[idx % len(mentors)]
            pairings.append({
                "concept": concept,
                "mentor": mentor,
                "tutee": tutee,
                "activity": f"Work together on a peer-guided {concept} worksheet. The mentor will review the steps and explain their solution strategy."
            })

    return {
        "remedial_groups": groups_list,
        "peer_pairings": pairings
    }

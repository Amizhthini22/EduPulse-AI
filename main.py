import os
import sys

# Ensure backend directory is in python module path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    try:
        import uvicorn
    except ImportError:
        print("Error: 'uvicorn' is not installed. Please run 'pip install -r backend/requirements.txt' first.")
        sys.exit(1)

    print("--- Starting EduPulse AI FastAPI Server ---")
    # Launch uvicorn pointing to the main file in backend
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

from flask import Flask, request, jsonify
import pandas as pd
import datetime
import groq
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# API Key for Groq AI (Ensure this is secured in a real project)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = groq.Groq(api_key=GROQ_API_KEY)

# Load dataset (if needed for future recommendations)
def load_data():
    df = pd.read_csv("xAPI-Edu-Data.csv")
    return df

df = load_data()

@app.route("/generate-plan", methods=["POST"])
def generate_study_plan():
    data = request.json

    daily_habits = data.get("daily_habits")
    study_habits = data.get("study_habits")
    selected_subjects = data.get("subjects", [])
    exam_date = data.get("exam_date")
    study_time = data.get("study_time")
    days_of_week = data.get("days_of_week", [])

    if not daily_habits or not study_habits or not selected_subjects or not days_of_week:
        return jsonify({"error": "Please provide all required inputs."}), 400

    subjects_str = ", ".join(selected_subjects)

    # AI prompt for study plan
    prompt = f"""
    Generate a **personalized and detailed study schedule** for a student with the following details:

    - **Daily Routine:** {daily_habits}
    - **Study Style:** {study_habits}
    - **Focus Subjects:** {subjects_str}
    - **Exam Date:** {exam_date}
    - **Preferred Study Days:** {', '.join(days_of_week)}
    - **Preferred Study Time:** {study_time}

    The schedule should be **realistic and effective**, balancing study time across subjects, including **breaks, revisions, and optimized study techniques**.
    Provide a structured, day-wise plan with recommended study duration for each subject.
    """

    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "system", "content": "You are an expert study planner."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024
        )

        study_plan = response.choices[0].message.content.strip()
        return jsonify({"study_plan": study_plan})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

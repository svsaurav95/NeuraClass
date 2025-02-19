from flask import Flask, render_template, request
import pandas as pd
import datetime
import groq

app = Flask(__name__)

# Direct API Key (Replace with your actual key)
GROQ_API_KEY = "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"

# Initialize Groq Client
client = groq.Groq(api_key=GROQ_API_KEY)

# Load dataset
def load_data():
    df = pd.read_csv("xAPI-Edu-Data.csv")
    return df

df = load_data()

@app.route("/", methods=["GET", "POST"])
def index():
    study_plan = None  # Placeholder for study plan result

    if request.method == "POST":
        daily_habits = request.form.get("daily_habits")
        study_habits = request.form.get("study_habits")
        selected_subjects = request.form.getlist("subjects")
        exam_date = request.form.get("exam_date")
        study_time = request.form.get("study_time")
        days_of_week = request.form.getlist("days")

        if not daily_habits or not study_habits or not selected_subjects or not days_of_week:
            return render_template("index.html", study_plan="Please provide all required inputs.")

        subjects_str = ", ".join(selected_subjects)

        # AI prompt
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

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "system", "content": "You are an expert study planner."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024
        )

        study_plan = response.choices[0].message.content.strip()

    return render_template("index.html", study_plan=study_plan)

if __name__ == "__main__":
    app.run(debug=True)

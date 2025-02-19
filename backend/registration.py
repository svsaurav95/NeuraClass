from flask import Flask, request, jsonify
import cv2
import numpy as np
from facenet_pytorch import InceptionResnetV1, MTCNN
import torch
from PIL import Image
import os
import pickle
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load FaceNet model
facenet_model = InceptionResnetV1(pretrained='casia-webface').to(device).eval()
mtcnn = MTCNN(keep_all=False, device=device)

# Directory to store student embeddings
EMBEDDINGS_DIR = "student_embeddings"
os.makedirs(EMBEDDINGS_DIR, exist_ok=True)

# -------------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------------
def get_face_embedding(face_img):
    """Extracts a face embedding using FaceNet after alignment with MTCNN."""
    try:
        pil_img = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
        face_aligned = mtcnn(pil_img)
        if face_aligned is None:
            return None

        with torch.no_grad():
            face_aligned = face_aligned.to(device)
            embedding = facenet_model(face_aligned.unsqueeze(0))

        return embedding.cpu().numpy().flatten()
    except Exception as e:
        print("Error in embedding extraction:", e)
        return None

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------
@app.route('/upload_students', methods=['POST'])
def upload_students():
    """Handles multiple student image uploads and stores embeddings separately."""
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    uploaded_students = {}

    for file in files:
        filename = secure_filename(file.filename)
        student_name, _ = os.path.splitext(filename)
        file_path = os.path.join(EMBEDDINGS_DIR, filename)
        file.save(file_path)

        frame = cv2.imread(file_path)
        if frame is None:
            continue

        embedding = get_face_embedding(frame)
        if embedding is None:
            continue

        # Save embedding separately for each student
        embedding_path = os.path.join(EMBEDDINGS_DIR, f"{student_name}.pkl")
        with open(embedding_path, "wb") as f:
            pickle.dump(embedding, f)

        uploaded_students[student_name] = "Embedding saved successfully"

    return jsonify(uploaded_students)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

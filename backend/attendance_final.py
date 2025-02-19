from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
import os
import torch
import pickle
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image

app = Flask(__name__)

# -------------------------------------------------------------------
# 🔹 Folder Setup - All files inside ./temp
# -------------------------------------------------------------------
TEMP_DIR = "./temp"
STUDENT_EMBEDDINGS_DIR = os.path.join(TEMP_DIR, "student_embeddings")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(STUDENT_EMBEDDINGS_DIR, exist_ok=True)

attendance_log = {}

# -------------------------------------------------------------------
# 🔹 Model & Device Setup
# -------------------------------------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load YOLOv8 face detection model
face_detector = YOLO("ultralytics/yolov8n.pt")

# Load FaceNet model for embeddings
facenet_model = InceptionResnetV1(pretrained="casia-webface").to(device).eval()
mtcnn = MTCNN(keep_all=False, device=device)

def get_face_embedding(face_img):
    pil_img = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
    with torch.no_grad():
        face_tensor = torch.tensor(np.array(pil_img)).permute(2, 0, 1).float() / 255.0
        face_tensor = face_tensor.unsqueeze(0).to(device)
        embedding = facenet_model(face_tensor)
    return embedding.cpu().numpy().flatten()

def detect_face(image):
    results = face_detector(image)
    for result in results:
        for box in result.boxes.xyxy:
            x1, y1, x2, y2 = map(int, box[:4])
            face = image[y1:y2, x1:x2]
            return face, (x1, y1, x2, y2)
    return None, None

def draw_boxes(frame, faces):
    for (x1, y1, x2, y2) in faces:
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

def load_student_embeddings():
    embeddings = {}
    for file in os.listdir(STUDENT_EMBEDDINGS_DIR):
        if file.endswith('.pkl'):
            with open(os.path.join(STUDENT_EMBEDDINGS_DIR, file), 'rb') as f:
                embeddings[file.replace('.pkl', '')] = pickle.load(f)
    return embeddings

def recognize_student(face_embedding, stored_embeddings):
    best_match, best_similarity = None, 0
    for student_name, stored_embedding in stored_embeddings.items():
        similarity = np.dot(stored_embedding, face_embedding) / (
            np.linalg.norm(stored_embedding) * np.linalg.norm(face_embedding) + 1e-10
        )
        if similarity > best_similarity and similarity > 0.5:
            best_match, best_similarity = student_name, similarity
    return best_match

def generate_frames():
    cap = cv2.VideoCapture(0)
    stored_embeddings = load_student_embeddings()
    global attendance_log
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            face, bbox = detect_face(frame)
            if face is not None:
                face_embedding = get_face_embedding(face)
                if face_embedding is not None:
                    student_name = recognize_student(face_embedding, stored_embeddings)
                    if student_name:
                        attendance_log[student_name] = "Present"
                if bbox:
                    draw_boxes(frame, [bbox])
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    finally:
        cap.release()
        cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/attendance', methods=['GET'])
def get_attendance():
    return jsonify(attendance_log)

@app.route('/upload_students', methods=['POST'])
def upload_students():
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400
    files = request.files.getlist('files')
    for file in files:
        if file.filename == '':
            continue
        filename = secure_filename(file.filename)
        file_path = os.path.join(TEMP_DIR, filename)  # Save inside ./temp
        file.save(file_path)

        frame = cv2.imread(file_path)
        face, _ = detect_face(frame)
        if face is None:
            continue
        embedding = get_face_embedding(face)
        if embedding is None:
            continue

        embedding_file = os.path.join(STUDENT_EMBEDDINGS_DIR, f"{filename}.pkl")
        with open(embedding_file, "wb") as f:
            pickle.dump(embedding, f)

        # Clean up temp image after processing
        os.remove(file_path)

    return jsonify({"message": "Embeddings stored successfully."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

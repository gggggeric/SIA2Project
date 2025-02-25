import logging
import base64
import cv2
import numpy as np
import tensorflow as tf
import speech_recognition as sr
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
from threading import Thread

# Set up logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Load HaarCascade face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Load the trained face shape model
model_path = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\learning\face_shape_model2.h5"
model = tf.keras.models.load_model(model_path)

# Define face shape labels
face_shape_labels = ["Heart", "Oblong", "Oval", "Round", "Square"]
glasses_recommendations = {
    "Oval": "Most frame styles work well! Try square, rectangular, or round glasses.",
    "Round": "Opt for angular frames like rectangular or square glasses to add definition.",
    "Square": "Round or oval frames soften sharp facial features.",
    "Heart": "Bottom-heavy frames, aviators, or round glasses balance the wider forehead.",
    "Oblong": "Oversized, tall frames or round glasses add width and balance the face."
}

# Constants
REAL_FACE_WIDTH = 14.0  # cm
FOCAL_LENGTH = 500  # Adjust based on camera calibration

@app.route("/calculate-distance", methods=["POST"])
def calculate_distance():
    data = request.json
    if "image" not in data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        img_data = base64.b64decode(data["image"])
        img = Image.open(BytesIO(img_data))
        img_np = np.array(img)
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            return jsonify({"error": "No face detected"}), 400
        if len(faces) > 1:
            return jsonify({"error": "Multiple faces detected. Ensure only one person is in the frame."}), 400

        (x, y, w, h) = faces[0]
        face_width_in_pixels = w
        distance = (FOCAL_LENGTH * REAL_FACE_WIDTH) / face_width_in_pixels

        if not (30 <= distance <= 100):
            return jsonify({"error": "Please position yourself between 30-100 cm from the screen."}), 400

        return jsonify({"distance_cm": round(distance, 2), "message": "Correct distance. Proceed with the test."})
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500
    
@app.route("/predict-face-shape", methods=["POST"])
def predict_face_shape():
    data = request.json
    if "image" not in data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        img_data = base64.b64decode(data["image"])
        img = Image.open(BytesIO(img_data)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions)
        confidence = round(float(np.max(predictions)) * 100, 2)

        detected_shape = face_shape_labels[predicted_class]
        recommended_glasses = glasses_recommendations.get(detected_shape, "No specific recommendation.")

        return jsonify({
            "face_shape": detected_shape,
            "confidence": f"{confidence}%",
            "recommended_glasses": recommended_glasses
        })
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

def diagnose_vision(near_accuracy, far_accuracy):
    if near_accuracy >= 50 and far_accuracy < 50:
        return "Nearsighted (Myopia)"
    elif near_accuracy < 50 and far_accuracy >= 50:
        return "Farsighted (Hyperopia)"
    elif near_accuracy >= 50 and far_accuracy >= 50:
        return "Vision is Normal"
    else:
        return "Severely Impaired"

def run_vision_test(eye_type):
    recognizer = sr.Recognizer()
    test_results = {}

    try:
        with sr.Microphone() as source:
            print(f"Testing {eye_type} at 40-50 cm...")
            near_accuracy, near_text = test_vision(recognizer, source)

            print(f"Testing {eye_type} at 80-100 cm...")
            far_accuracy, far_text = test_vision(recognizer, source)

            diagnosis = diagnose_vision(near_accuracy, far_accuracy)

            test_results = {
                "eye": eye_type,
                "near_accuracy": f"{near_accuracy:.2f}%",
                "near_spoken_text": near_text,
                "far_accuracy": f"{far_accuracy:.2f}%",
                "far_spoken_text": far_text,
                "diagnosis": diagnosis
            }

        return jsonify(test_results)
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route("/vision-test/both-eyes", methods=["POST"])
def vision_test_both():
    return run_vision_test("both_eyes") 

@app.route("/vision-test/left-eye", methods=["POST"])
def vision_test_left():
    return run_vision_test("left_eye")

@app.route("/vision-test/right-eye", methods=["POST"])
def vision_test_right():
    return run_vision_test("right_eye")

if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)

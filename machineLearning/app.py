import logging
from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from flask_cors import CORS
import speech_recognition as sr
import tensorflow as tf

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

# Constants
REAL_FACE_WIDTH = 14.0  # cm
FOCAL_LENGTH = 500  # Adjust based on camera calibration

# Vision chart
eye_chart = {
    "20/25": ["F", "E", "L", "O", "P", "Z", "D"],
    "20/20": ["D", "E", "F", "P", "O", "T", "C"]
}

def diagnose_vision(near_accuracy, far_accuracy):
    if near_accuracy >= 50 and far_accuracy < 50:
        return "Nearsighted (Myopia)"
    elif near_accuracy < 50 and far_accuracy >= 50:
        return "Farsighted (Hyperopia)"
    elif near_accuracy >= 50 and far_accuracy >= 50:
        return "Vision is Normal"
    else:
        return "Severely Impaired"

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
        img = img.resize((224, 224))  # Match MobileNetV2 input size
        img_array = np.array(img) / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0)  # Expand batch dimension

        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions)
        confidence = round(float(np.max(predictions)) * 100, 2)

        # Face Shape Labels
        face_shape_labels = [
            "Oval", "Round", "Square", "Heart", "Diamond", "Oblong"
        ]

        # Recommended Glasses for Each Face Shape
        glasses_recommendations = {
            "Oval": "Most frame styles work well! Try square, rectangular, or round glasses.",
            "Round": "Opt for angular frames like rectangular or square glasses to add definition.",
            "Square": "Round or oval frames soften sharp facial features.",
            "Heart": "Bottom-heavy frames, aviators, or round glasses balance the wider forehead.",
            "Diamond": "Oval or rimless glasses complement high cheekbones and narrow jawlines.",
            "Oblong": "Oversized, tall frames or round glasses add width and balance the face."
        }

        # Get detected face shape
        detected_shape = face_shape_labels[predicted_class]
        recommended_glasses = glasses_recommendations.get(detected_shape, "No specific recommendation.")

        # Debugging prints
        print("Predicted Probabilities:", predictions)
        print("Predicted Class Index:", predicted_class)
        print("Mapped Face Shape:", detected_shape)
        print("Recommended Glasses:", recommended_glasses)

        return jsonify({
            "face_shape": detected_shape,
            "confidence": f"{confidence}%",
            "recommended_glasses": recommended_glasses
        })
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

def run_vision_test(eye_type):
    recognizer = sr.Recognizer()
    test_results = {}

    try:
        with sr.Microphone() as source:
            print("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)

            # Test at 40-50 cm (near test)
            print(f"Testing {eye_type} at 40-50 cm...")
            near_accuracy, near_text, near_vision_score, near_test_characters = test_vision(recognizer, source)

            # Test at 80-100 cm (far test)
            print(f"Testing {eye_type} at 80-100 cm...")
            far_accuracy, far_text, far_vision_score, far_test_characters = test_vision(recognizer, source)

            # Determine final diagnosis
            diagnosis = diagnose_vision(near_accuracy, far_accuracy)

            test_results = {
                "eye": eye_type,
                "near_distance": "40-50 cm",
                "near_spoken_text": near_text,
                "near_accuracy": f"{near_accuracy:.2f}%",
                "near_vision_score": near_vision_score,
                "near_test_characters": near_test_characters,
                "far_distance": "80-100 cm",
                "far_spoken_text": far_text,
                "far_accuracy": f"{far_accuracy:.2f}%",
                "far_vision_score": far_vision_score,
                "far_test_characters": far_test_characters,
                "diagnosis": diagnosis,
                "distance_message": "Position yourself correctly at 40-50 cm or 80-100 cm"
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
    app.run(debug=True, port=5000)


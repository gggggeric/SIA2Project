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

# Load HaarCascade face detector (replace with MTCNN or Dlib for better accuracy)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Load the trained face shape model
model_path = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\learning\face_shape_model4.h5"
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

# Vision Test Constants
chart_lines = {
    "20/200": "E",
    "20/100": "FP",
    "20/70": "TOZ",
    "20/50": "LPED",
    "20/40": "PECFD",
    "20/30": "EDFCZP",
    "20/25": "FELPZD",
    "20/20": "DEFPOTEC"
}

REAL_FACE_WIDTH = 14.0  # cm
FOCAL_LENGTH = 500      # Adjust based on camera calibration

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
        logger.error(f"Processing error: {str(e)}")
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
        logger.error(f"Processing error: {str(e)}")
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

def diagnose_vision(near_text, far_text):
    if near_text in ["20/200", "20/100"] and far_text in ["20/30", "20/25", "20/20"]:
        return "Nearsighted (Myopia)"
    elif near_text in ["20/30", "20/25", "20/20"] and far_text in ["20/200", "20/100"]:
        return "Farsighted (Hyperopia)"
    elif near_text in ["20/30", "20/25", "20/20"] and far_text in ["20/30", "20/25", "20/20"]:
        return "Vision is Normal"
    else:
        return "Severely Impaired"

def estimate_eye_grade(near_text, far_text):
    grade_map = {
        "20/200": "-4.00",
        "20/100": "-3.00",
        "20/70": "-2.00",
        "20/50": "-1.50",
        "20/40": "-1.00",
        "20/30": "-0.75",
        "20/25": "-0.50",
        "20/20": "0.00"
    }

    # Function to find the closest matching chart line
    def find_closest_chart_line(text):
        text_cleaned = text.replace(" ", "").upper()  # Remove spaces and convert to uppercase
        for key, value in chart_lines.items():
            if text_cleaned in value:  # Check if the cleaned text is a substring of the chart line
                return key
        return None

    # Find the closest matching chart line for near_text and far_text
    near_chart_line = find_closest_chart_line(near_text)
    far_chart_line = find_closest_chart_line(far_text)

    # Use the near_chart_line to estimate the eye grade
    if near_chart_line and near_chart_line in grade_map:
        return grade_map[near_chart_line]
    else:
        return "Unknown"

def test_vision(recognizer, source, expected_text):
    max_attempts = 3  # Maximum number of attempts to get a valid response
    attempts = 0

    while attempts < max_attempts:
        try:
            logger.info(f"Expected chart letters: '{expected_text}'")  # Logs the expected text
            print(f"Please read the chart showing: '{expected_text}'...")

            # Listen for user input with a longer timeout
            audio = recognizer.listen(source, timeout=10)
            spoken_text = recognizer.recognize_google(audio).strip().upper()

            # Log raw and cleaned user response
            logger.info(f"User said (raw): '{spoken_text}'")
            spoken_text_cleaned = spoken_text.replace(" ", "")
            logger.info(f"User said (cleaned): '{spoken_text_cleaned}'")

            # Split expected and spoken text into individual letters
            expected_letters = list(expected_text)
            spoken_letters = list(spoken_text_cleaned)

            # Calculate accuracy based on correct letters
            correct = 0
            for i in range(min(len(expected_letters), len(spoken_letters))):
                if expected_letters[i] == spoken_letters[i]:
                    correct += 1

            accuracy = (correct / len(expected_letters)) * 100 if expected_letters else 0

            logger.info(f"Result: {accuracy:.2f}% Accuracy")
            return accuracy, spoken_text_cleaned
        except sr.WaitTimeoutError:
            logger.warning("No speech detected. Please try again.")
            attempts += 1
            if attempts < max_attempts:
                print("No speech detected. Please try again.")
        except Exception as e:
            logger.error(f"Speech recognition error: {str(e)}")
            return 0, "Unable to detect speech."

    logger.error("Maximum attempts reached. No valid response.")
    return 0, "No valid response."

def run_vision_test(eye_type):
    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            logger.info(f"Using default microphone for {eye_type} test")

            # Adjust microphone for ambient noise
            recognizer.adjust_for_ambient_noise(source)

            near_accuracy, near_text = test_vision(recognizer, source, chart_lines["20/30"])
            far_accuracy, far_text = test_vision(recognizer, source, chart_lines["20/100"])

            return jsonify({
                "eye": eye_type,
                "near_accuracy": f"{near_accuracy:.2f}%",
                "near_spoken_text": near_text,
                "far_accuracy": f"{far_accuracy:.2f}%",
                "far_spoken_text": far_text,
                "diagnosis": diagnose_vision(near_text, far_text),
                "estimated_eye_grade": estimate_eye_grade(near_text, far_text)
            })
    except Exception as e:
        logger.error(f"Error in vision test: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route("/vision-test/both-eyes", methods=["POST"])
def vision_test_both():
    return run_vision_test("Both Eyes")

@app.route("/vision-test/left-eye", methods=["POST"])
def vision_test_left():
    return run_vision_test("Left Eye")

@app.route("/vision-test/right-eye", methods=["POST"])
def vision_test_right():
    return run_vision_test("Right Eye")

if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)
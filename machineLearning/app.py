from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging
import base64
import cv2
import numpy as np
import tensorflow as tf
import speech_recognition as sr
from io import BytesIO
from PIL import Image
import time
import re

# Set up logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable WebSocket with CORS

# Load HaarCascade face detector
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

# Adjusted thresholds for better accuracy
LOW_ACCURACY_THRESHOLD = 50.0  # Threshold for low accuracy
HIGH_ACCURACY_THRESHOLD = 80.0  # Threshold for normal vision

# Global flag to track if the user is within the correct distance
is_within_correct_distance = False

@app.route("/calculate-distance", methods=["POST"])
def calculate_distance():
    global is_within_correct_distance

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

        if not (40 <= distance <= 60):  # Ensure user is within 40-60 cm
            is_within_correct_distance = False
            return jsonify({"error": "Please position yourself between 40-60 cm from the screen."}), 400

        is_within_correct_distance = True
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

def diagnose_vision(results):
    """
    Enhanced vision diagnosis with improved myopia/hyperopia detection
    Returns diagnosis and recommended eye grade
    """
    # Determine which rows were read successfully (above low threshold)
    readable_rows = [
        row for row, data in results.items() 
        if data["accuracy"] >= LOW_ACCURACY_THRESHOLD
    ]
    
    if not readable_rows:
        return "Severe vision impairment - Unable to read any chart lines", -4.00

    # Sort rows by difficulty (easiest to hardest)
    row_order = ["20/200", "20/100", "20/70", "20/50", "20/40", "20/30", "20/25", "20/20"]
    readable_rows_sorted = sorted(readable_rows, key=lambda x: row_order.index(x))
    
    # Get smallest (most difficult) readable row
    smallest_row = readable_rows_sorted[-1]
    
    # Check if user read all rows with high accuracy
    all_rows_high_accuracy = all(
        results[row]["accuracy"] >= HIGH_ACCURACY_THRESHOLD 
        for row in readable_rows
    )
    
    # Perfect vision case
    if smallest_row == "20/20" and all_rows_high_accuracy:
        return "Normal vision (20/20)", 0.00

    # Nearsightedness (myopia) detection:
    # - Can read small letters but struggles with large ones
    # - Typically has difficulty with the top rows (20/200, 20/100)
    if (smallest_row in ["20/20", "20/25", "20/30", "20/40"] and
        any(results.get(row, {}).get("accuracy", 0) < LOW_ACCURACY_THRESHOLD 
        for row in ["20/200", "20/100", "20/70"])):
        
        # Estimate degree of myopia based on smallest readable row
        myopia_map = {
            "20/20": ("Very mild nearsightedness", -0.25),
            "20/25": ("Mild nearsightedness", -0.50),
            "20/30": ("Moderate nearsightedness", -1.00),
            "20/40": ("Significant nearsightedness", -1.50)
        }
        return myopia_map.get(smallest_row, ("Nearsightedness", -0.50))

    # Farsightedness (hyperopia) detection:
    # - Can read large letters but struggles with small ones
    # - Typically has difficulty with bottom rows (20/20, 20/25)
    if (smallest_row in ["20/70", "20/100", "20/200"] and
        any(results.get(row, {}).get("accuracy", 0) < LOW_ACCURACY_THRESHOLD 
        for row in ["20/20", "20/25", "20/30"])):
        
        # Estimate degree of hyperopia based on smallest readable row
        hyperopia_map = {
            "20/70": ("Mild farsightedness", +0.75),
            "20/100": ("Moderate farsightedness", +1.50),
            "20/200": ("Significant farsightedness", +2.50)
        }
        return hyperopia_map.get(smallest_row, ("Farsightedness", +1.00))

    # General classification based on smallest readable row
    classification_map = {
        "20/20": ("Normal or near-normal vision", 0.00),
        "20/25": ("Very mild vision impairment", -0.25),
        "20/30": ("Mild vision impairment", -0.50),
        "20/40": ("Moderate vision impairment", -1.00),
        "20/50": ("Moderate to significant impairment", -1.50),
        "20/70": ("Significant vision impairment", -2.00),
        "20/100": ("Severe vision impairment", -2.50),
        "20/200": ("Very severe impairment or legal blindness", -3.00)
    }
    
    return classification_map.get(smallest_row, ("Vision condition unclear", 0.00))

def test_vision(recognizer, source, expected_text, test_type, row_label):
    max_attempts = 3  # Maximum number of attempts to get a valid response
    attempts = 0

    while attempts < max_attempts:
        try:
            logger.info(f"Expected chart letters: '{expected_text}'")

            # Emit the row to read and start the countdown
            socketio.emit('vision_test_update', {
                'type': 'start',
                'test_type': test_type,
                'row_label': row_label,
                'letters': expected_text,
                'message': f"Please read the row labeled {row_label}"
            })

            # 3-second delay before listening
            logger.info("Starting 3-second delay before listening...")
            for i in range(3, 0, -1):
                logger.info(f"Countdown: {i} seconds remaining...")
                time.sleep(1)
            logger.info("3-second delay complete. Ready to listen.")

            # Listen for user input with a longer timeout
            logger.info("Listening for user input (10-second timeout)...")
            audio = recognizer.listen(source, timeout=10)
            logger.info("User input received. Processing...")

            spoken_text = recognizer.recognize_google(audio).strip().upper()

            if spoken_text.lower() == "skip":
                logger.info("User chose to skip this row.")
                return 0, "skip"

            # Clean and compare responses
            spoken_text_cleaned = re.sub(r'[^A-Z]', '', spoken_text)
            expected_text_cleaned = re.sub(r'[^A-Z]', '', expected_text)
            
            correct = 0
            min_length = min(len(expected_text_cleaned), len(spoken_text_cleaned))
            for i in range(min_length):
                if expected_text_cleaned[i] == spoken_text_cleaned[i]:
                    correct += 1

            accuracy = (correct / len(expected_text_cleaned)) * 100 if expected_text_cleaned else 0

            logger.info(f"Result: {accuracy:.2f}% Accuracy")
            return accuracy, spoken_text_cleaned
            
        except sr.WaitTimeoutError:
            logger.warning("No speech detected. Please try again.")
            attempts += 1
            if attempts < max_attempts:
                socketio.emit('vision_test_update', {
                    'type': 'retry',
                    'message': "No speech detected. Please try again."
                })
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
            recognizer.adjust_for_ambient_noise(source)

            results = {}
            for row_label in ["20/200", "20/100", "20/70", "20/50", "20/40", "20/30", "20/25", "20/20"]:
                expected_text = chart_lines[row_label]
                logger.info(f"Testing row: {row_label} ({expected_text})")

                accuracy, spoken_text = test_vision(
                    recognizer, source, expected_text, "Vision Test", row_label
                )

                results[row_label] = {
                    "accuracy": accuracy,
                    "spoken_text": spoken_text
                }

                if spoken_text == "skip":
                    logger.info(f"User skipped row {row_label}. Moving to next row.")
                    results[row_label]["accuracy"] = 0  # Mark skipped rows as failed
                    continue

                if accuracy < LOW_ACCURACY_THRESHOLD:
                    logger.info(f"Accuracy below threshold. Moving to next row.")
                    results[row_label]["accuracy"] = 0  # Mark failed rows

            # Get diagnosis and eye grade
            diagnosis, estimated_eye_grade = diagnose_vision(results)

            # Print results in the backend
            logger.info(f"Vision Test Results for {eye_type}:")
            logger.info(f"Diagnosis: {diagnosis}")
            logger.info(f"Estimated Eye Grade: {estimated_eye_grade}")
            logger.info(f"Detailed Results: {results}")

            # Emit the final results
            socketio.emit('vision_test_update', {
                'type': 'result',
                'eye': eye_type,
                'results': results,
                'estimated_eye_grade': estimated_eye_grade,
                'diagnosis': diagnosis
            })

            return jsonify({
                "eye": eye_type,
                "results": results,
                "estimated_eye_grade": estimated_eye_grade,
                "diagnosis": diagnosis
            })
    except Exception as e:
        logger.error(f"Error in vision test: {str(e)}")
        socketio.emit('vision_test_update', {
            'type': 'error',
            'message': f"Test failed: {str(e)}"
        })
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









# Astigmatism Line Mapping
ASTIGMATISM_MAP = {
    "1": "Right Eye - Vertical Axis",
    "2": "Right Eye - Oblique Axis",
    "3": "Both Eyes - Horizontal Axis",
    "4": "Left Eye - Oblique Axis",
    "5": "Left Eye - Vertical Axis",
    "6": "Both Eyes - Vertical Axis",
    "7": "Left Eye - Oblique Axis",
    "8": "Left Eye - Horizontal Axis",
    "9": "Both Eyes - Horizontal Axis",
    "10": "Right Eye - Oblique Axis",
    "11": "Right Eye - Horizontal Axis",
    "12": "Both Eyes - Vertical Axis"
}

# Diagnose based on reported bold lines
def diagnose_astigmatism(lines):
    left_eye = any(line in ['4', '5', '7', '8'] for line in lines)
    right_eye = any(line in ['1', '2', '10', '11'] for line in lines)
    both_eyes = any(line in ['3', '6', '9', '12'] for line in lines)

    if left_eye and right_eye:
        return "Astigmatism detected in BOTH eyes."
    elif left_eye:
        return "Astigmatism detected in the LEFT eye."
    elif right_eye:
        return "Astigmatism detected in the RIGHT eye."
    elif both_eyes:
        return "Astigmatism symptoms appear in BOTH eyes."
    else:
        return "No significant signs of astigmatism detected."

# Speech Recognition Function
def recognize_speech():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Please say the bold line numbers (e.g., '1, 6'):")
        try:
            audio = recognizer.listen(source)
            spoken_text = recognizer.recognize_google(audio)
            print(f"Recognized speech: {spoken_text}")
            return spoken_text
        except sr.UnknownValueError:
            return "Sorry, I couldn't understand you. Please try again."
        except sr.RequestError:
            return "Speech Recognition service is unavailable."

@app.route("/astigmatism-test", methods=["POST"])
def astigmatism_test():
    data = request.json
    if 'lines' not in data:
        return jsonify({"error": "Please provide the detected lines."}), 400

    lines = data['lines'].split(",")
    extracted_lines = [num.strip() for num in lines if num.strip().isdigit()]

    if extracted_lines:
        result = diagnose_astigmatism(extracted_lines)
        return jsonify({"result": result})
    else:
        return jsonify({"error": "Could not detect valid line numbers."})
    


# Correct answers for 20 images (removed 39, 53, 59, 21, and 12 (2))
correct_answers = {
    "2 (2).png": "2",
    "2 (3).png": "2",
    "2 (4).png": "2",
    "2 (5).png": "2",
    "2 (6).png": "2",
    "5 (2).png": "5",
    "5.png": "5",
    "7 (2).png": "7",
    "7 (3).png": "7",
    "7.png": "7",
    "8.png": "8",
    "10.png": "10",
    "12.png": "12",
    "14.png": "14",
    "16.png": "16",
    "26.png": "26",
    "27.png": "27",
    "29.png": "29",
    "56.png": "56",
    "57.png": "57"
}

@app.route('/color-blindness-test', methods=['POST'])
def color_blindness_test():
    data = request.json.get('answers', [])
    if not data or len(data) != 20:  # Now expecting 20 answers
        return jsonify({"error": "Please provide 20 answers."}), 400

    score = 0
    for answer in data:
        image_name = answer.get("imageName")
        user_answer = answer.get("userAnswer")

        # Normalize the image name by removing the hash part
        normalized_image_name = re.sub(r'\.[a-f0-9]+\.png$', '.png', image_name)

        if normalized_image_name in correct_answers and str(user_answer).strip() == str(correct_answers[normalized_image_name]).strip():
            score += 1

    # Adjusted thresholds for 20 images
    if score >= 18:  # ~90% correct
        result = "normal"
    elif score >= 14:  # ~70% correct
        result = "mild"
    elif score >= 8:   # ~40% correct
        result = "moderate"
    else:
        result = "severe"
        
    return jsonify({"result": result, "correctCount": score})
if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True, use_reloader=False)
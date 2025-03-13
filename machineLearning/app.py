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

def diagnose_vision(near_accuracy, far_accuracy, near_text, far_text):
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

    # Determine the smallest readable row
    smallest_readable_row = None
    if near_chart_line:
        smallest_readable_row = near_chart_line
    elif far_chart_line:
        smallest_readable_row = far_chart_line

    # Diagnose vision based on the smallest readable row
    if smallest_readable_row:
        if smallest_readable_row == "20/20":
            return "Vision is Normal"
        elif smallest_readable_row in ["20/25", "20/30", "20/40", "20/50", "20/70", "20/100", "20/200"]:
            return "Likely Nearsighted (Myopia): You have difficulty seeing objects that are far away."
        else:
            return "Likely Farsighted (Hyperopia): You have difficulty seeing objects that are close up."

    # Unable to determine
    return "Vision Condition Unclear: Further testing may be required."

def estimate_eye_grade(near_text, far_text):
    grade_map = {
        "20/200": "-4.00",  # Severe myopia
        "20/100": "-3.00",  # Moderate myopia
        "20/70": "-2.00",   # Mild myopia
        "20/50": "-1.50",   # Mild myopia
        "20/40": "-1.00",   # Mild myopia
        "20/30": "-0.75",   # Very mild myopia
        "20/25": "-0.50",   # Very mild myopia
        "20/20": "0.00",    # Normal vision
    }

    farsighted_grade_map = {
        "20/200": "+4.00",  # Severe hyperopia
        "20/100": "+3.00",  # Moderate hyperopia
        "20/70": "+2.00",   # Mild hyperopia
        "20/50": "+1.50",   # Mild hyperopia
        "20/40": "+1.00",   # Mild hyperopia
        "20/30": "+0.75",   # Very mild hyperopia
        "20/25": "+0.50",   # Very mild hyperopia
        "20/20": "0.00",    # Normal vision
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

    # Log the values for debugging
    logger.info(f"Near Text: {near_text}, Near Chart Line: {near_chart_line}")
    logger.info(f"Far Text: {far_text}, Far Chart Line: {far_chart_line}")

    # Determine the smallest readable row
    smallest_readable_row = None
    if near_chart_line:
        smallest_readable_row = near_chart_line
    elif far_chart_line:
        smallest_readable_row = far_chart_line

    # Estimate eye grade based on the smallest readable row
    if smallest_readable_row:
        if smallest_readable_row in grade_map:
            return grade_map[smallest_readable_row]
        elif smallest_readable_row in farsighted_grade_map:
            return farsighted_grade_map[smallest_readable_row]

    # Unable to determine
    return "Unknown"

def test_vision(recognizer, source, expected_text, test_type, row_label):
    max_attempts = 3  # Maximum number of attempts to get a valid response
    attempts = 0

    while attempts < max_attempts:
        try:
            logger.info(f"Expected chart letters: '{expected_text}'")  # Logs the expected text

            # Emit the row to read and start the countdown
            socketio.emit('vision_test_update', {
                'type': 'start',
                'test_type': test_type,
                'row_label': row_label,  # Emit the row label (e.g., "20/200")
                'letters': expected_text,  # Emit the letters in the row
                'message': f"Please read the row labeled {row_label}"  # Inform the user which row to read
            })

            # 3-second delay before switching to another row
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

            rows_to_test = [
                "20/20", "20/25", "20/30", "20/40", "20/50", "20/70", "20/100", "20/200"
            ]

            results = {}

            for row_label in rows_to_test:
                expected_text = chart_lines[row_label]
                logger.info(f"Testing row: {row_label} ({expected_text})")

                accuracy, spoken_text = test_vision(
                    recognizer, source, expected_text, "Vision Test", row_label
                )

                results[row_label] = {
                    "accuracy": accuracy,
                    "spoken_text": spoken_text
                }

                if accuracy < LOW_ACCURACY_THRESHOLD:
                    logger.info(f"Accuracy below threshold. Stopping test.")
                    break

            smallest_readable_row = None
            for row_label in rows_to_test:
                if results[row_label]["accuracy"] >= LOW_ACCURACY_THRESHOLD:
                    smallest_readable_row = row_label
                else:
                    break

            estimated_eye_grade = estimate_eye_grade(
                results[smallest_readable_row]["spoken_text"] if smallest_readable_row else "",
                ""
            )

            # Determine vision type (Nearsighted, Farsighted, or Normal)
            near_accuracy = results.get("20/20", {}).get("accuracy", 0)
            far_accuracy = results.get("20/200", {}).get("accuracy", 0)
            near_text = results.get("20/20", {}).get("spoken_text", "")
            far_text = results.get("20/200", {}).get("spoken_text", "")
            diagnosis = diagnose_vision(near_accuracy, far_accuracy, near_text, far_text)

            # Print results in the backend
            logger.info(f"Vision Test Results for {eye_type}:")
            logger.info(f"Smallest Readable Row: {smallest_readable_row}")
            logger.info(f"Estimated Eye Grade: {estimated_eye_grade}")
            logger.info(f"Diagnosis: {diagnosis}")
            logger.info(f"Detailed Results: {results}")

            # Emit the final results
            socketio.emit('vision_test_update', {
                'type': 'result',
                'eye': eye_type,
                'results': results,
                'smallest_readable_row': smallest_readable_row,
                'estimated_eye_grade': estimated_eye_grade,
                'diagnosis': diagnosis
            })

            return jsonify({
                "eye": eye_type,
                "results": results,
                "smallest_readable_row": smallest_readable_row,
                "estimated_eye_grade": estimated_eye_grade,
                "diagnosis": diagnosis
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
    




#color blindess

# Correct answers for each image
correct_answers = {
    "img1": "74",
    "img2": "27",
    "img3": "42"
}

@app.route('/color-blindness-test', methods=['POST'])
def color_blindness_test():
    data = request.json.get('answers', [])
    if not data or len(data) != 3:
        return jsonify({"error": "Please provide 3 answers."}), 400

    score = 0
    for i, key in enumerate(correct_answers.keys()):
        if data[i].strip() == correct_answers[key]:
            score += 1

    if score == 3:
        result = "You have normal color vision."
    elif score == 2:
        result = "You may have mild color blindness."
    elif score == 1:
        result = "You may have moderate color blindness."
    else:
        result = "You may have severe color blindness."

    return jsonify({"result": result})

if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True, use_reloader=False)
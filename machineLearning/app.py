from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from flask_cors import CORS
import speech_recognition as sr

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Load HaarCascade face and eye detectors
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# Constants for distance calculation
REAL_FACE_WIDTH = 14.0  # cm
FOCAL_LENGTH = 500  # Can be adjusted based on camera calibration


@app.route('/calculate-distance', methods=['POST'])
def calculate_distance():
    data = request.json

    if 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        # Decode the base64 image
        img_data = base64.b64decode(data['image'])
        img = Image.open(BytesIO(img_data))
        img_np = np.array(img)
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Convert to grayscale
        gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            return jsonify({"error": "No face detected"}), 400
        if len(faces) > 1:
            return jsonify({"error": "Multiple faces detected. Ensure only one person is in the frame."}), 400

        (x, y, w, h) = faces[0]

        # Detect eyes within the face region
        roi_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=5)

        left_eye_visible = any(ex + ew // 2 < w // 2 for (ex, ey, ew, eh) in eyes)
        right_eye_visible = any(ex + ew // 2 >= w // 2 for (ex, ey, ew, eh) in eyes)

        eye_status = "Both eyes visible" if left_eye_visible and right_eye_visible else \
                     "Left eye only visible" if left_eye_visible else \
                     "Right eye only visible" if right_eye_visible else \
                     "Both eyes not visible"

        # Calculate distance
        face_width_in_pixels = w
        distance = (FOCAL_LENGTH * REAL_FACE_WIDTH) / face_width_in_pixels

        return jsonify({"distance_cm": round(distance, 2), "eye_status": eye_status})

    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    recognizer = sr.Recognizer()
    
    with sr.Microphone() as source:
        print("Adjusting for ambient noise...")  
        recognizer.adjust_for_ambient_noise(source, duration=1)  # Noise cancellation
        
        print("Listening...")
        audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio)
            return jsonify({"text": text})
        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand the audio"}), 400
        except sr.RequestError:
            return jsonify({"error": "Speech recognition service is unavailable"}), 500

    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source)

        print("Processing speech...")
        text = recognizer.recognize_google(audio)
        print("Recognized text:", text)
        return jsonify({"text": text})

    except sr.UnknownValueError:
        print("Error: Could not understand the audio")
        return jsonify({"error": "Could not understand the audio"}), 400
    except sr.RequestError as e:
        print("Error: Speech recognition service unavailable", str(e))
        return jsonify({"error": "Speech recognition service unavailable"}), 500
    except Exception as e:
        print("Unexpected Error:", str(e))
        return jsonify({"error": str(e)}), 500

    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("Listening for speech...")
            audio = recognizer.listen(source)

        # Recognize speech
        text = recognizer.recognize_google(audio)
        return jsonify({"text": text})

    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand the audio"}), 400
    except sr.RequestError as e:
        return jsonify({"error": f"Speech recognition service unavailable: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load HaarCascade face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Real face width in cm (approx.)
REAL_FACE_WIDTH = 14.0  # cm

# Focal length (estimated or calibrated)
FOCAL_LENGTH = 500  # You can adjust this based on your camera

@app.route('/calculate-distance', methods=['POST'])
def calculate_distance():
    data = request.json
    image_data = data['image']

    # Decode the base64 string to an image
    try:
        img_data = base64.b64decode(image_data)
        img = Image.open(BytesIO(img_data))

        # Convert image to numpy array
        img_np = np.array(img)
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)  # Convert RGB to BGR

        # Convert image to grayscale for face detection
        gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

        # Detect faces in the image
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            return jsonify({"error": "No face detected"}), 400

        # Get the first face's coordinates (x, y, width, height)
        (x, y, w, h) = faces[0]

        # Calculate the distance using the formula
        face_width_in_pixels = w
        distance = (FOCAL_LENGTH * REAL_FACE_WIDTH) / face_width_in_pixels

        # Return the distance
        return jsonify({"distance": distance})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)

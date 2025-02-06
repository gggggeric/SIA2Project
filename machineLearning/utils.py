# utils.py

import cv2
import numpy as np

# A simple method to estimate the face distance from the camera
def calculate_face_distance(frame, face_cascade):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return None  # No face detected

    # Assume the first detected face is the correct one
    x, y, w, h = faces[0]
    face_area = w * h

    # Estimate the distance based on the face area (simplified)
    distance = 10000 / np.sqrt(face_area)

    return distance

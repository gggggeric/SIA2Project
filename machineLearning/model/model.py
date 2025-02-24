import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import MobileNetV2
from sklearn.utils.class_weight import compute_class_weight
from PIL import Image, ImageFile
import collections

# Fix truncated image loading
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Define dataset paths
train_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\training_set"
test_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\testing_set"

# Image dimensions (increased for better accuracy)
img_size = 224
batch_size = 16

# Function to remove corrupted images
def remove_corrupt_images(directory):
    for category in os.listdir(directory):
        category_path = os.path.join(directory, category)
        if os.path.isdir(category_path):
            for img_name in os.listdir(category_path):
                img_path = os.path.join(category_path, img_name)
                try:
                    img = Image.open(img_path)
                    img.verify()
                except (IOError, SyntaxError):
                    print(f"🛑 Corrupt image removed: {img_path}")
                    os.remove(img_path)

# Remove corrupted images
remove_corrupt_images(train_dir)
remove_corrupt_images(test_dir)

# Data Augmentation
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=45,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=[0.6, 1.4],  # Increased contrast
    fill_mode="nearest"
)

test_datagen = ImageDataGenerator(rescale=1.0/255)

# Load Data
train_generator = train_datagen.flow_from_directory(
    train_dir, target_size=(img_size, img_size),
    batch_size=batch_size, class_mode="categorical"
)

test_generator = test_datagen.flow_from_directory(
    test_dir, target_size=(img_size, img_size),
    batch_size=batch_size, class_mode="categorical"
)

# Check dataset balance
class_counts = collections.Counter(train_generator.classes)
print(f"Class Distribution: {class_counts}")

# Compute Class Weights
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)
class_weights_dict = {i: class_weights[i] for i in range(len(class_weights))}
print(f"Class Weights: {class_weights_dict}")

# Use Pretrained Model (MobileNetV2) for better accuracy
base_model = MobileNetV2(input_shape=(img_size, img_size, 3), include_top=False, weights="imagenet")
base_model.trainable = False  # Freeze initial layers

# Define Model
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation="relu"),
    Dropout(0.3),  # Reduced dropout for better learning
    Dense(256, activation="relu"),
    Dropout(0.3),
    Dense(5, activation="softmax")  # 5 classes
])

# Compile Model
model.compile(loss="categorical_crossentropy",
              optimizer=Adam(learning_rate=0.0001),  # Lower learning rate for better convergence
              metrics=["accuracy"])

# Train Model
epochs = 25
history = model.fit(train_generator, epochs=epochs, validation_data=test_generator, class_weight=class_weights_dict)

# Save Model
model_save_path = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\learning\face_shape_model2.h5"
model.save(model_save_path)
print(f"✅ Model training complete and saved as '{model_save_path}'")

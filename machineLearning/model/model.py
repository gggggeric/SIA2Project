import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight
from PIL import Image, ImageFile
import collections

# Fix truncated images
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Dataset Paths
train_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\training_set"
test_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\testing_set"

# Optimized Image Size (smaller = faster)
img_size = 160  
batch_size = 32  # Increase batch size for fewer updates per epoch

# Function to remove corrupt images
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

# Remove corrupt images
remove_corrupt_images(train_dir)
remove_corrupt_images(test_dir)

# Faster Data Augmentation
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=30,  # Reduced for speed
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
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

# Compute Class Weights for Balanced Training
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)
class_weights_dict = {i: class_weights[i] for i in range(len(class_weights))}

# Use MobileNetV2 with Some Trainable Layers
base_model = MobileNetV2(input_shape=(img_size, img_size, 3), include_top=False, weights="imagenet")
for layer in base_model.layers[:100]:  # Freeze first 100 layers (train only the last few)
    layer.trainable = False

# Define Model
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation="relu"),
    Dropout(0.2),  # Reduced dropout for faster convergence
    Dense(256, activation="relu"),
    Dense(5, activation="softmax")  # 5 classes
])

# Compile Model with Dynamic Learning Rate
model.compile(
    loss="categorical_crossentropy",
    optimizer=Adam(learning_rate=0.0005),  # Slightly higher learning rate
    metrics=["accuracy"]
)

# Learning Rate Reduction (Speeds Up Convergence)
lr_scheduler = ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.5, verbose=1)

# Train Model Faster 🚀
epochs = 20  # Fewer epochs but better learning
history = model.fit(train_generator, epochs=epochs, validation_data=test_generator,
                    class_weight=class_weights_dict, callbacks=[lr_scheduler])

# Save Model
model_save_path = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\learning\face_shape_model3.h5"
model.save(model_save_path)
print(f"✅ Model training complete and saved as '{model_save_path}'")

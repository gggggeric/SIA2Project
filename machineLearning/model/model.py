import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping
from sklearn.utils.class_weight import compute_class_weight
from PIL import Image, ImageFile

# Fix truncated images
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Paths
train_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\training_set"
test_dir = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\dataset\testing_set"

# Hyperparameters
img_size = 224  # Higher resolution for better accuracy
batch_size = 32  
epochs = 25  

# Remove corrupt images
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

remove_corrupt_images(train_dir)
remove_corrupt_images(test_dir)

# Data Augmentation (Stronger)
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],  # Adjust brightness
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

# Compute Class Weights
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)
class_weights_dict = {i: class_weights[i] for i in range(len(class_weights))}

# Load MobileNetV2 (More trainable layers)
base_model = MobileNetV2(input_shape=(img_size, img_size, 3), include_top=False, weights="imagenet")

# Unfreeze more layers for fine-tuning
for layer in base_model.layers[:100]:  
    layer.trainable = False  
for layer in base_model.layers[100:]:  
    layer.trainable = True  

# Model Definition
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation="relu"),
    Dropout(0.3),  # Increased for regularization
    Dense(256, activation="relu"),
    Dropout(0.3),
    Dense(5, activation="softmax")  
])

# Compile Model with a Lower Initial Learning Rate
model.compile(
    loss="categorical_crossentropy",
    optimizer=Adam(learning_rate=0.0003),  # Lower initial LR for stability
    metrics=["accuracy"]
)

# Callbacks for Optimization
lr_scheduler = ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.5, verbose=1)
early_stopping = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

# Train Model with Class Weights
history = model.fit(train_generator, epochs=epochs, validation_data=test_generator,
                    class_weight=class_weights_dict, callbacks=[lr_scheduler, early_stopping])

# Save Model
model_save_path = r"C:\Users\morit\Desktop\3RD YR PROJECTS\2nd\SIA2_System\machineLearning\learning\face_shape_model4.h5"
model.save(model_save_path)
print(f"✅ Model training complete and saved as '{model_save_path}'")

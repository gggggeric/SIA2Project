const mongoose = require("mongoose");

const FaceShapeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  faceShape: {
    type: String,
    required: true,
  },
  recommendedGlasses: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FaceShape", FaceShapeSchema);
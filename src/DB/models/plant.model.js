

import mongoose from "mongoose";

const plantScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plant: {
    type: String,
    required: true,
    default: "tomato",
    lowercase: true
  },
  healthStatus: {
    type: String,
    enum: ["healthy", "sick", "مريض", "صحي"],
    required: true
  },
  disease: {
    type: String,
    required: false,
    default: null
  },
  severity: {
    type: String,
    enum: ["none", "low", "medium", "high", "لا يوجد", "منخفض", "متوسط", "مرتفع"],
    default: "none"
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  description: {
    type: String,
    required: true
  },
  cloudImage: {
    public_id: String,
    secure_url: String
  }
},
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export const PlantScanModel = mongoose.models.PlantScan || mongoose.model("PlantScan", plantScanSchema);
export default PlantScanModel;
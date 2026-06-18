


import joi from "joi";

export const createScanSchema = {
  body: joi.object({
    ai_class_name: joi.string().valid(
      "Tomato___healthy", 
      "Tomato___Early_blight", 
      "Tomato___Late_blight", 
      "Tomato___Septoria_leaf_spot"
    ).required(),
    confidence: joi.number().min(0).max(1).required(),
  })
};
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import mongoose from "mongoose";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";

import { PlantScanModel } from "../../DB/models/plant.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import { diseaseDictionary } from "./plant.description.js";
import { checkImageQuality } from "../../Utils/image.utils.js";


export const CheckImageQuality = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new Error("Image is required"));
    }

    const lang = req.query.lang === "ar" ? "ar" : "en";

    const { width, height, variance, isLowResolution, isBlurry } = await checkImageQuality(req.file.path);

    if (isLowResolution) {
      return res.status(422).json({
        success: false,
        data: { width, height },
        error: {
          type: "LOW_RESOLUTION",
          message:
            lang === "ar"
              ? `دقة الصورة منخفضة جداً (${width}x${height})، يرجى التقاط صورة أوضح.`
              : `Image resolution is too low (${width}x${height}). Please take a clearer photo.`,
        },
      });
    }

    if (isBlurry) {
      return res.status(422).json({
        success: false,
        data: { width, height, variance },
        error: {
          type: "BLURRY_IMAGE",
          message:
            lang === "ar"
              ? "الصورة مشوشة، يرجى التقاط صورة واضحة."
              : "Image is blurry. Please take a clearer photo.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: { width, height, variance },
      message: lang === "ar" ? "الصورة واضحة وجاهزة للفحص" : "Image quality is acceptable",
    });

  } catch (err) {
    next(err);
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};



export const UploadImageLeafDetect = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new Error("Image is required"));
    }

    const lang = req.query.lang === "ar" ? "ar" : "en";

    const formData = new FormData();

    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const aiModelUrl = process.env.AI_MODEL_URL;
    if (!aiModelUrl) {
      return next(new Error("AI_MODEL_URL is not defined in .env"));
    }

    let aiResponse;
    try {
      aiResponse = await axios.post(
        `${aiModelUrl}/predict`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 15000,
        }
      );
    } catch (axiosErr) {
      return next(new Error(`Failed to reach AI model: ${axiosErr.message}`));
    }

    const ai_class_name = aiResponse.data?.prediction;

    let confidence = aiResponse.data?.confidence;

    if (typeof confidence === "string") {
      confidence = confidence.replace("%", "");
    }

    confidence = Number(confidence);

    if (!ai_class_name || isNaN(confidence)) {
      return next(new Error("Invalid AI response structure"));
    }

    if (confidence > 1 && confidence <= 100) {
      confidence = confidence / 100;
    }

    if (confidence < 0 || confidence > 1) {
      return next(new Error("Invalid confidence value"));
    }

    if (confidence < 0.6) {
      return next(new Error("Prediction confidence too low"));
    }

    const isTomatoClass = ai_class_name.toLowerCase().startsWith("tomato");

    if (!isTomatoClass) {
      return res.status(422).json({
        success: false,
        data: null,
        error: {
          type: "UNSUPPORTED_PLANT",
          message:
            lang === "ar"
              ? "النظام يدعم نباتات الطماطم فقط حالياً."
              : "Only tomato plants are supported.",
        },
      });
    }

    const diseaseData = diseaseDictionary[ai_class_name];
    if (!diseaseData) {
      return next(new Error("Invalid AI class name"));
    }

    const description =
      lang === "ar" ? diseaseData.description_ar : diseaseData.description;

    const disease =
      lang === "ar" ? (diseaseData.disease_ar ?? null) : diseaseData.disease;

    const severity =
      lang === "ar" ? diseaseData.severity_ar : diseaseData.severity;

    const healthStatus =
      lang === "ar"
        ? diseaseData.health_status_ar
        : diseaseData.health_status;

    const { public_id, secure_url } =
      await cloudinaryConfig().uploader.upload(req.file.path, {
        folder: `LeafDetect/users/${req.user._id}`,
      });

    const scan = await PlantScanModel.create({
      userId: req.user._id,
      plant: "tomato",
      healthStatus: diseaseData.health_status_ar ?? diseaseData.health_status,
      disease: diseaseData.disease_ar ?? diseaseData.disease,
      severity: diseaseData.severity_ar ?? diseaseData.severity,
      confidence,
      description: diseaseData.description_ar ?? diseaseData.description,
      cloudImage: { public_id, secure_url },
    });

    return successResponse({
      res,
      statusCode: 201,
      message: lang === "ar" ? "تم حفظ الفحص بنجاح" : "Scan saved successfully",
      data: {
        scan: {
          ...scan.toObject(),
          disease,
          description,
          severity,
          healthStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

export const getUserScanHistory = async (req, res, next) => {
  const lang = req.query.lang === "ar" ? "ar" : "en";
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new Error("Invalid user ID", { cause: 400 }));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      PlantScanModel.find({ userId: new mongoose.Types.ObjectId(userId) })
        .select("plant healthStatus disease severity cloudImage createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PlantScanModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
    ]);

    if (!scans.length) {
      return successResponse({
        res,
        statusCode: 200,
        message: "No scans found",
        data: { scans: [], total: 0, page, limit },
      });
    }

    const translatedScans = scans.map((scan) => {
      const raw = scan.toObject();

      const dictEntry = Object.values(diseaseDictionary).find(
        (d) =>
          d.health_status_ar === raw.healthStatus ||
          d.health_status === raw.healthStatus
      );

      if (!dictEntry) return raw;

      return {
        ...raw,
        healthStatus:
          lang === "ar" ? dictEntry.health_status_ar : dictEntry.health_status,
        disease:
          lang === "ar" ? dictEntry.disease_ar ?? null : dictEntry.disease ?? null,
        severity:
          lang === "ar" ? dictEntry.severity_ar : dictEntry.severity,
      };
    });

    return successResponse({
      res,
      statusCode: 200,
      message: lang === "ar" ? "تم جلب السجل بنجاح" : "Scan history retrieved successfully",
      data: { scans: translatedScans, total, page, limit },
    });
  } catch (err) {
    next(err);
  }

};
export const clearUserScanHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new Error("Invalid user ID", { cause: 400 }));
    }

    await PlantScanModel.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return successResponse({
      res,
      statusCode: 200,
      message: "Scan history cleared successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }

};
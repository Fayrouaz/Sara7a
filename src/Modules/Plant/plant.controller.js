import { Router } from "express";
import { roleEnum } from "../../DB/models/user.model.js";
import { authentication, authorization } from "../../Middleware/auth.middleware.js";
import { cloudFileUploadMulter } from "../../Utils/multer/cloud.multer.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";
import * as plantSerive from "./plant.serive.js";

const router = Router();

router.post(
  "/check-image-quality",
  authentication(),
  authorization({ accesRole: [roleEnum.ADMIN, roleEnum.USER] }),
  cloudFileUploadMulter({ validation: [...fileValidation.images] }).single("image"),
  plantSerive.CheckImageQuality   
);

router.post(
  "/upload-leaf",
  authentication(),
  authorization({ accesRole: [roleEnum.ADMIN, roleEnum.USER] }),
  cloudFileUploadMulter({ validation: [...fileValidation.images] }).single("image"),
  plantSerive.UploadImageLeafDetect
);
router.get("/history/:userId", authentication(), plantSerive.getUserScanHistory);
router.delete("/history/:userId", authentication(), plantSerive.clearUserScanHistory);

export default router;
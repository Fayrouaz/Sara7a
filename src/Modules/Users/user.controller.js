



import { Router } from "express";
import * as authService from "./user.service.js"
import { authentication, authorization, tokenTypeEnum } from "../../Middleware/auth.middleware.js"
import { fileValidation, localFileUpload } from "../../Utils/multer/local.multer.js";
import { cloudFileUploadMulter } from "../../Utils/multer/cloud.multer.js"
import { roleEnum } from "../../DB/models/user.model.js";


const router = Router();

router.get("/", authService.listAllUsers);

router.patch("/update",
    authentication({ tokenType: tokenTypeEnum.ACCESS }),
    authorization({ accesRole: roleEnum.USER }),
    authService.updateProfile
);

// GET — fetch current profile image
router.get("/profile-image",
    authentication(),
    authorization({ accesRole: [roleEnum.ADMIN, roleEnum.USER] }),
    authService.getProfileImage
);

// PATCH — upload new profile image
router.patch("/profile-image",
    authentication(),
    authorization({ accesRole: [roleEnum.ADMIN, roleEnum.USER] }),
    cloudFileUploadMulter({ validation: [...fileValidation.images] }).single("profileImage"),
    authService.profileImage
);

export default router;
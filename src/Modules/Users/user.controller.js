



import {Router } from "express";
import * as authService from "./user.service.js"
import {authorization} from "../../Middleware/auth.middleware.js"
import { localFileUpload } from "../../Utils/multer/local.multer.js";

const router = Router();


router.get("/" , authService.listAllUsers)


router.patch("/update" ,authorization, authService.updateProfile)
router.patch("/profile-image" ,authorization,localFileUpload().single("profileImage") , authService.profileImage)
export default router;
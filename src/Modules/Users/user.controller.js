



import {Router } from "express";
import * as authService from "./user.service.js"
import {authentication , authorization, tokenTypeEnum} from "../../Middleware/auth.middleware.js"
import { fileValidation, localFileUpload  } from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { profileImageSchema ,coverImageSchema  } from "./user.validation.js";
import {cloudFileUploadMulter} from "../../Utils/multer/cloud.multer.js"
import { roleEnum } from "../../DB/models/user.model.js";
import { freezeAccountSchema  ,restoreAccountSchema ,deleteAccountSchema } from "./user.validation.js";
//import { generateQR } from "../Auth/auth.service.js"; // ./user.service.js موجود في نفس الفولدر

import { deleteFreezedAccount } from './user.service.js'; // تأكد من الاستيراد الصحيح


const router = Router();


router.get("/" , authService.listAllUsers)


router.patch("/update" ,
authentication({tokenType : tokenTypeEnum.ACCESS}),
authorization({ accesRole :roleEnum.USER}),

 authService.updateProfile);




router.patch("/profile-image" ,
authentication,
authorization({accesRole :[roleEnum.ADMIN]}),

 //authorization({accesRole :["USER"]}),
/*
localFileUpload({customPath :"User" ,
validation:[...fileValidation.images]}).single("profileImage") ,
 validation(profileImageSchema),
*/
cloudFileUploadMulter({validation : [...fileValidation.images]}).single("profileImage"),
 authService.profileImage)

router.patch("/cover-images" ,
authentication,
 //authorization({accesRole :["USER"]}),
/*
localFileUpload({customPath :"User" ,
validation:[...fileValidation.images]}).array("coverImages" , 4) ,
 validation(coverImageSchema),
*/
  cloudFileUploadMulter({validation : [...fileValidation.images]}).array("coverImages" , 5),
authService.coverImages)

router.delete("{/:userId}/freeze-account" , authentication({tokenType : tokenTypeEnum.ACCESS}),
  authorization({accesRole :[roleEnum.USER , roleEnum.ADMIN]}),
  validation(freezeAccountSchema),
  authService.freezedAccount
  )

router.delete(
    "/:userId/delete-freezed-account",
    authentication({ tokenType: tokenTypeEnum.ACCESS }),
    // **هام:** الصلاحية محددة هنا بـ [roleEnum.ADMIN] فقط.
    authorization({ accesRole: [roleEnum.ADMIN] }),
    validation(deleteAccountSchema),
    deleteFreezedAccount
);

router.patch("{/:userId}/restore-account" , authentication({tokenType : tokenTypeEnum.ACCESS}),
  authorization({accesRole :[roleEnum.USER , roleEnum.ADMIN]}),
  validation(restoreAccountSchema),
  authService.restoreAccount
  )



export default router;




import {Router } from "express";
import * as authService from "./user.service.js"
import {authentication , authorization, tokenTypeEnum} from "../../Middleware/auth.middleware.js"
import { fileValidation, localFileUpload  } from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {cloudFileUploadMulter} from "../../Utils/multer/cloud.multer.js"
import { roleEnum } from "../../DB/models/user.model.js";
import { freezeAccountSchema  ,restoreAccountSchema ,deleteAccountSchema } from "./user.validation.js";
import { deleteFreezedAccount } from './user.service.js'; 


const router = Router();


router.get("/" , authService.listAllUsers)


router.patch("/update" ,
authentication({tokenType : tokenTypeEnum.ACCESS}),
authorization({ accesRole :roleEnum.USER}),

 authService.updateProfile);




router.patch("/profile-image" ,
authentication,
authorization({accesRole :[roleEnum.ADMIN]}),
cloudFileUploadMulter({validation : [...fileValidation.images]}).single("profileImage"),
 authService.profileImage)

router.patch("/cover-images" ,
authentication,
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



import {Router } from "express"
import * as authService from "./auth.service.js"
import {authentication, tokenTypeEnum} from "../../Middleware/auth.middleware.js"
import {validation} from "../../Middleware/validation.middleware.js"
import { forgetPasswordShema, loginSchema, resetPasswordShema , updatePasswordSchema  } from "./auth.validation.js";
import { signupSchema } from "../../DB/models/user.model.js";
const router = Router();


router.post("/signup" ,  validation(signupSchema), authService.signup)
router.post("/login", validation(loginSchema), authService.login)
router.post("/revoke-token" ,authentication({tokenType :tokenTypeEnum.ACCESS})  , authService.logout)
router.post("/refresh-token" , authentication({tokenType :tokenTypeEnum.REFRESH}) ,authService.refreshToken )
router.patch("/forget-password" , validation(forgetPasswordShema),authService.forgetPassword )
router.patch("/reset-password" , validation(resetPasswordShema),authService.resetPassword )
router.patch(
  "/update-password",
authentication,
  validation(updatePasswordSchema),
  authService.updatePassword
);

router.post(
  "/social-login",
  authService.loginWithGmail
);

export default router;
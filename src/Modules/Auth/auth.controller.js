


import {Router } from "express"
import * as authService from "./auth.service.js"
import {authorization} from "../../Middleware/auth.middleware.js"
import {validation} from "../../Middleware/validation.middleware.js"
import { confirmEmailSchema, forgetPasswordShema, loginSchema, signupSchema ,resetPasswordShema , updatePasswordSchema  } from "./auth.validation.js";
const router = Router();


router.post("/signup" ,  validation(signupSchema), authService.signup)
router.post("/login", validation(loginSchema), authService.login)
router.patch( "/confirm-email",validation(confirmEmailSchema) ,authService.confirmEmail)
router.post("/revoke-token" ,authorization , authService.logout)
router.post("/refesh-token" , authService.refreshToken )
router.patch("/forget-password" , validation(forgetPasswordShema),authService.forgetPassword )
//update password
router.patch("/reset-password" , validation(resetPasswordShema),authService.resetPassword )
router.patch(
  "/update-password",
  authorization,
  validation(updatePasswordSchema),
  authService.updatePassword
);

router.post(
  "/social-login",
  authService.loginWithGmail
);


export default router;
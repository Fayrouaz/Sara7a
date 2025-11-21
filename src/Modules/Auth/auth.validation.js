
import joi from "joi"
import { generalFields } from "../../Middleware/validation.middleware.js";

  export const loginSchema = {body: joi.object({
   email:generalFields.email.required(),
  password:generalFields.password.required(),

   })}

 export const confirmEmailSchema = {body: joi.object({
  email:generalFields.email.required(),
  otp:generalFields.otp.required(),

 })}


export const forgetPasswordShema = {body: joi.object({
  email:generalFields.email.required(),
   
 })
 }

export const resetPasswordShema = {body: joi.object({
  email:generalFields.email.required(),
  otp:generalFields.otp.required(),
   password:generalFields.password.required(),
   confirmPassword:generalFields.confirmPassword,
 })
 }

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmNewPassword: joi.any().valid(joi.ref("newPassword")).required()
      .messages({ "any.only": "confirmNewPassword must match newPassword" }),
  }),
};
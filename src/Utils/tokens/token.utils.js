import jwt from "jsonwebtoken";
import { roleEnum } from "../../DB/models/user.model.js";
import {v4 as uuid} from "uuid"


export const signaitureEnum = {
 ADMIN:"ADMIN",
 USER:"USER"
 
}

export const generateToken= ({payload ,secretKey = process.env.TOKEN_ACCESS_SECRETE ,
  options = {exipiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN}})=>{
 return jwt.sign(payload ,secretKey ,options)
}


export const verifyToken=({token ,secretKey=process.env.TOKEN_ACCESS_SECRETE })=>{
 return jwt.verify(token ,secretKey)
}


export const getSignaiture=async({signatureLvel = signaitureEnum.USER} ={})=>{

 let signatures= {accessSignature : undefined ,refreshSignature :undefined}

  switch(signaitureEnum){
  case signaitureEnum.ADMIN:
  signatures.accessSignature=process.env.TOKEN_ACCESS_ADMIN_SECRETE;
  signatures.refreshSignature=process.env.TOKEN_RFRESH_ADMIN_SECRETE;
  break;
  default:
  signatures.accessSignature=process.env.TOKEN_ACCESS_USER_SECRETE;
  signatures.refreshSignature=process.env.TOKEN_RFRESH_USER_SECRETE;
  break;
 console.log(signatures);
 

 }
  return signatures;

}


export const getNewLoginCredientional =async(user)=>{
  const signatures = await getSignaiture({
    signatureLvel : user.role != roleEnum.USER ? signaitureEnum.ADMIN : signaitureEnum.ADMIN})
   const jwtid = uuid();

  const accessToken =  generateToken({payload:{id:user._id ,email:user.email},
    secretKey:signatures.accessSignature,
    options:{
      expiresIn:parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      jwtid,
    }
   })

   const refreshToken =  generateToken({payload:{id:user._id ,email:user.email},
    secretKey:signatures.refreshSignature,
    options:{
      expiresIn:parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      jwtid,
    }
   })
  return {accessToken , refreshToken}
}
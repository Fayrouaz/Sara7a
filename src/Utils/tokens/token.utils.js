import jwt from "jsonwebtoken";


export const generateToken= ({payload ,secretKey = process.env.TOKEN_ACCESS_SECRETE ,
  options = {exipiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN}})=>{
 return jwt.sign(payload ,secretKey ,options)
}


export const verifyToken=({token ,secretKey=process.env.TOKEN_ACCESS_SECRETE })=>{
 return jwt.verify(token ,secretKey)
}
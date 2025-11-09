
import *  as dbSerivce from "../DB/dbService.js"
import { UserModel } from "../DB/models/user.model.js";
import TokenModel from "../DB/token.models.js";
import { verifyToken } from "../Utils/tokens/token.utils.js";
 export const authorization=async(req,res,next)=>{
 const {authorization}=req.headers;
  if(!authorization) return next(new Error("Authorization token is missing" ,{cause:400}))
    if(!authorization.startsWith(process.env.TOKEN_PREFIX)) return next(new Error("Invalid Authorization Format" ,{cause:400}))

    const token = authorization.split(" ")[1];
 
    const decoded = verifyToken({token ,secretKey:process.env.TOKEN_ACCESS_SECRETE})
    if(!decoded.jti)
     return next(new Error("Invalid token" ,{cause:401}));
 
     const revokedToken = await dbSerivce.findOne({
     model:TokenModel,
     filter:{jwtid:decoded.jti}
   });
   if(revokedToken)  return next(new Error("Token is Revoked" ,{cause:401}));

   const user= await dbSerivce.findById({
    model:UserModel,
    id:decoded.id
   })

   if(!user) return next(new Error("User Not Found" ,{cause:404}));

   /*
    const token= await dbSerivce.findOne({model:TokenModel , filter:{jwtid:decoded.jti}})
    if(token) return next(new Error("Token is Revoked" ,{cause:400}))
    */
    req.user=user;
    req.decoded=decoded;
   next();
}
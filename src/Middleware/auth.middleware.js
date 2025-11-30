
import *  as dbSerivce from "../DB/dbService.js"
import { UserModel } from "../DB/models/user.model.js";
import TokenModel from "../DB/token.models.js";
import { getSignaiture, verifyToken } from "../Utils/tokens/token.utils.js";

export const tokenTypeEnum = {
  ACCESS :"ACCESS",
  REFRESH:"REFRESH"
};

 const  decodedToken =  async({authorization ,tokenType = tokenTypeEnum.ACCESS ,next} ={}) =>{
    const[Bearer,token] =authorization.split(" ") || [];
    if(!Bearer || !token)  return next("Invalid Token" ,{cause : 400});
    let signatures = await getSignaiture({signaitureLevel : Bearer})

   const decoded =  verifyToken({
    token,
    secretKey: tokenType === tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
   })
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
   if(!user) return next(new Error("Not registered Account" ,{cause:404}));

   return{user , decoded}
}


 
 export const authentication = ({tokenType = tokenTypeEnum.ACCESS } ={} ) =>{
  return async(req,res,next)=>{
   const {user , decoded} = (await decodedToken({authorization : req.headers.authorization , tokenType ,next})) || {}
     req.user= user;
    req.decoded = decoded;
    return next();
  
  }
 }




 export const authorization= ({accesRole = []} = {})=>{
 return (req , res, next ) =>{
   if(!accesRole.includes(req.user.role)){
    return next(new Error("Unathorizated Access" ,{ cause : 403}))
  }
   return next();
  }

 }


import mongoose from "mongoose";

const  messageSchema = new mongoose.Schema(
{
 content:{
  type:String,
  required: true,
  minLength:[2,"Message must be at least 2 character long"],
  maxLength:[500,"Message must be at most  500 character long"],
 },
 receiverId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  ref: "User"
}
},
{timestamps:true})

export const MessageModel = mongoose.models.Message || mongoose.model("Message",  messageSchema);
export default   MessageModel ;
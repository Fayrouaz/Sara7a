


import {Router } from "express";
import * as  messageService from "./message.service.js"
import { validation } from "../../Middleware/validation.middleware.js";
import{SendMessageSchema} from "./message.validation.js"
const router = Router();
router.post("/send-message/:receiverId" ,validation(SendMessageSchema),messageService.sendMessage)
router.get("/get-message" ,messageService.getMessage)

export default router;
import express from "express";
import { getNotifications, addNotification, deleteNotification } from "../controllers/notification.js";

const router = express.Router()

router.get("/", getNotifications)
router.post("/", addNotification)
router.delete("/", deleteNotification)

export default router
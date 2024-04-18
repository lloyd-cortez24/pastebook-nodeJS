import express from "express";
import { getUser, searchUsers, updateEmail, updatePassword, updateUser } from "../controllers/user.js";

const router = express.Router()

router.get("/profile/:userId", getUser)
router.put("/updateUser", updateUser)
router.put("/", updateEmail)
router.put("/updatePassword", updatePassword)
router.get("/search", searchUsers);

export default router
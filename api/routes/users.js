import express from "express";
import { getUser, searchUsers, updateUser } from "../controllers/user.js";

const router = express.Router()

router.get("/profile/:userId", getUser)
router.put("/", updateUser)
router.get("/search", searchUsers);

export default router
import express from "express";
import { getRelationships, addRelationship, deleteRelationship, getFriendsList } from "../controllers/relationship.js";

const router = express.Router()

router.get("/", getRelationships)
router.get("/getFriends", getFriendsList)
router.post("/", addRelationship)
router.delete("/", deleteRelationship)

export default router
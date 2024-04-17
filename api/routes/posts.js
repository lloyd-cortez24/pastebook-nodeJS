import express from "express";
import { getPosts, addPost, deletePost, addPostToOther, updatePost, getSpecificPost } from "../controllers/post.js";

const router = express.Router()

router.get("/", getPosts);
router.get("/:id", getSpecificPost);
router.put("/:id", updatePost);
router.post("/", addPost);
router.post("/addToOther", addPostToOther);
router.delete("/:id", deletePost);

export default router